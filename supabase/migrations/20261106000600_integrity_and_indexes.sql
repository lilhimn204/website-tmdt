-- Structural catalog edits are low frequency. Serialize their constraint checks,
-- including REPEATABLE READ (a concurrent edit then fails with serialization_failure).
create table private.catalog_integrity_lock (id boolean primary key check (id), revision bigint not null);
insert into private.catalog_integrity_lock values (true, 1);
create function private.lock_catalog_structure() returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  update private.catalog_integrity_lock set revision = revision + 1 where id;
  return null;
end $$;
create function private.check_catalog_structure() returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  if exists (with recursive ancestors(id, parent_id) as (
    select id, parent_id from app.categories where parent_id is not null
    union select a.id, c.parent_id from ancestors a join app.categories c on c.id = a.parent_id where c.parent_id is not null
  ) select 1 from ancestors where id = parent_id) then
    raise exception using errcode = '23514', message = 'category_cycle';
  end if;
  if exists (select 1 from app.product_categories pc join app.categories c on c.id = pc.category_id
    join app.products p on p.id = pc.product_id where c.product_type_id is not null and c.product_type_id <> p.product_type_id) then
    raise exception using errcode = '23514', message = 'category_product_type_mismatch';
  end if;
  return null;
end $$;
do $$ declare t text; begin
  foreach t in array array['categories','products','product_categories'] loop
    execute format('create trigger catalog_structure_lock before insert or update or delete on app.%I for each statement execute function private.lock_catalog_structure()', t);
    execute format('create constraint trigger catalog_structure_check after insert or update or delete on app.%I deferrable initially deferred for each row execute function private.check_catalog_structure()', t);
  end loop;
end $$;

create function private.check_specification() returns trigger language plpgsql set search_path = pg_catalog as $$
declare v uuid; d uuid; s app.product_specifications; selections bigint; bounds app.product_type_specifications;
begin
  v := coalesce(new.variant_id, old.variant_id); d := coalesce(new.definition_id, old.definition_id);
  select * into s from app.product_specifications where variant_id = v and definition_id = d;
  if not found then return null; end if;
  select count(*) into selections from app.product_specification_options where variant_id = v and definition_id = d;
  if (s.data_type = 'multi_enum' and s.value_status = 'known' and selections = 0)
    or ((s.data_type <> 'multi_enum' or s.value_status <> 'known') and selections <> 0) then
    raise exception using errcode = '23514', message = 'invalid_multi_enum_selections';
  end if;
  select * into bounds from app.product_type_specifications where product_type_id = s.product_type_id and definition_id = d;
  if s.value_status = 'known' and s.data_type = 'number' and
    (s.value_number < bounds.min_value or s.value_number > bounds.max_value) then
    raise exception using errcode = '23514', message = 'specification_out_of_range';
  end if;
  return null;
end $$;
create constraint trigger specification_check after insert or update or delete on app.product_specifications
  deferrable initially deferred for each row execute function private.check_specification();
create constraint trigger specification_options_check after insert or update or delete on app.product_specification_options
  deferrable initially deferred for each row execute function private.check_specification();
-- Do not allow changes of keys/bounds to invalidate existing values silently.
create function private.guard_specification_definition() returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  if tg_table_name = 'product_type_specifications' then
    if (new.product_type_id,new.definition_id,new.min_value,new.max_value) is distinct from
       (old.product_type_id,old.definition_id,old.min_value,old.max_value) then
      raise exception using errcode = '23514', message = 'specification_schema_change_requires_migration';
    end if;
  elsif (new.id,new.data_type,new.canonical_unit_code) is distinct from (old.id,old.data_type,old.canonical_unit_code) then
    raise exception using errcode = '23514', message = 'specification_schema_change_requires_migration';
  end if;
  return new;
end $$;
create trigger specification_schema_guard before update on app.specification_definitions for each row execute function private.guard_specification_definition();
create trigger specification_bounds_guard before update on app.product_type_specifications for each row execute function private.guard_specification_definition();

create function private.check_inventory_reserved() returns trigger language plpgsql set search_path = pg_catalog as $$
declare v uuid; current_reserved integer; expected bigint;
begin
  v := coalesce(new.variant_id, old.variant_id);
  select reserved into current_reserved from app.inventory where variant_id = v for update;
  if not found then return null; end if;
  select coalesce(sum(quantity),0) into expected from app.stock_reservations where variant_id = v and state in ('active','allocated');
  if current_reserved <> expected then raise exception using errcode = '23514', message = 'inventory_reservation_mismatch'; end if;
  return null;
end $$;
create constraint trigger inventory_reserved_check after insert or update or delete on app.inventory
  deferrable initially deferred for each row execute function private.check_inventory_reserved();
create constraint trigger reservation_counter_check after insert or update or delete on app.stock_reservations
  deferrable initially deferred for each row execute function private.check_inventory_reserved();

create function private.check_order_totals() returns trigger language plpgsql set search_path = pg_catalog as $$
declare target uuid; o app.orders; n bigint; net numeric; tax numeric;
begin
  if tg_table_name = 'orders' then target := coalesce(new.id,old.id); else target := coalesce(new.order_id,old.order_id); end if;
  select * into o from app.orders where id = target for update;
  if not found then return null; end if;
  select count(*), coalesce(sum(line_net_vnd),0), coalesce(sum(line_tax_vnd),0) into n,net,tax from app.order_items where order_id = target;
  if n = 0 or net <> o.items_net_vnd or tax <> o.items_tax_vnd then
    raise exception using errcode = '23514', message = 'order_items_total_mismatch';
  end if;
  if not exists (select 1 from app.order_contacts where order_id = target) then
    raise exception using errcode = '23514', message = 'order_contact_required';
  end if;
  return null;
end $$;
do $$ declare t text; begin
  foreach t in array array['orders','order_items','order_contacts'] loop
    execute format('create constraint trigger order_totals_check after insert or update or delete on app.%I deferrable initially deferred for each row execute function private.check_order_totals()', t);
  end loop;
end $$;

create function private.check_rfq_content() returns trigger language plpgsql set search_path = pg_catalog as $$
declare target uuid; needs text;
begin
  if tg_table_name = 'quote_requests' then target := coalesce(new.id,old.id); else target := coalesce(new.request_id,old.request_id); end if;
  select need_text into needs from app.quote_requests where id = target for update;
  if not found then return null; end if;
  if length(btrim(needs)) = 0 and not exists (select 1 from app.quote_request_items where request_id = target) then
    raise exception using errcode = '23514', message = 'rfq_requires_items_or_description';
  end if;
  return null;
end $$;
create constraint trigger rfq_content_check after insert or update or delete on app.quote_requests
  deferrable initially deferred for each row execute function private.check_rfq_content();
create constraint trigger rfq_items_check after insert or update or delete on app.quote_request_items
  deferrable initially deferred for each row execute function private.check_rfq_content();

create function private.reject_history_change() returns trigger language plpgsql set search_path = pg_catalog as $$
begin raise exception using errcode = '23514', message = 'immutable_history'; end $$;
do $$ declare t text; begin
  foreach t in array array['price_versions','warranty_policy_versions','order_items','inventory_movements','payment_entries','quote_events','quote_acceptances','audit_events','idempotency_records'] loop
    execute format('create trigger immutable_history before update or delete on app.%I for each row execute function private.reject_history_change()', t);
  end loop;
end $$;
create function private.guard_quote_content() returns trigger language plpgsql set search_path = pg_catalog as $$
declare version_id uuid; status text;
begin
  if tg_table_name = 'quote_versions' then
    if old.content_status <> 'draft' then
      if tg_op = 'UPDATE' and old.content_status = 'approved' and new.content_status = 'sealed' and
        (to_jsonb(old) - 'content_status' - 'sent_at') = (to_jsonb(new) - 'content_status' - 'sent_at') then return new; end if;
      raise exception using errcode = '23514', message = 'immutable_quote_version';
    end if;
  else
    version_id := coalesce(new.quote_version_id,old.quote_version_id);
    select content_status into status from app.quote_versions where id = version_id for update;
    if status <> 'draft' then raise exception using errcode = '23514', message = 'immutable_quote_items'; end if;
    if tg_op = 'UPDATE' and new.quote_version_id <> old.quote_version_id then
      raise exception using errcode = '23514', message = 'quote_item_parent_immutable';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end $$;
create trigger quote_version_guard before update or delete on app.quote_versions for each row execute function private.guard_quote_content();
create trigger quote_item_guard before insert or update or delete on app.quote_items for each row execute function private.guard_quote_content();

create function private.guard_policy_content() returns trigger language plpgsql set search_path = pg_catalog as $$
begin
  if old.status <> 'draft' then
    if tg_op = 'UPDATE' and old.status = 'active' and new.status = 'retired' and
      (to_jsonb(old) - 'status') = (to_jsonb(new) - 'status') then return new; end if;
    raise exception using errcode = '23514', message = 'immutable_commerce_policy';
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end $$;
create trigger policy_guard before update or delete on app.commerce_policy_versions for each row execute function private.guard_policy_content();
create function private.guard_shipping_policy() returns trigger language plpgsql set search_path = pg_catalog as $$
declare status text;
begin
  if tg_op = 'UPDATE' and new.policy_version_id <> old.policy_version_id then
    raise exception using errcode = '23514', message = 'shipping_policy_parent_immutable';
  end if;
  select p.status into status from app.commerce_policy_versions p where id = coalesce(new.policy_version_id,old.policy_version_id) for update;
  if status <> 'draft' then raise exception using errcode = '23514', message = 'immutable_shipping_policy'; end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end $$;
create trigger shipping_policy_guard before insert or update or delete on app.shipping_rules for each row execute function private.guard_shipping_policy();

create function private.bump_row_version() returns trigger language plpgsql set search_path = pg_catalog as $$
begin new.row_version := old.row_version + 1; new.updated_at := clock_timestamp(); return new; end $$;
do $$ declare t text; begin
  foreach t in array array['brands','categories','products','product_variants','orders','shipments','quote_requests','quotes'] loop
    execute format('alter table app.%I add constraint positive_row_version check (row_version > 0)', t);
    execute format('create trigger bump_row_version before update on app.%I for each row execute function private.bump_row_version()', t);
  end loop;
end $$;
-- Protect identifiers on mutable relation rows: moving a row could otherwise skip an OLD-parent invariant.
create function private.guard_identity() returns trigger language plpgsql set search_path = pg_catalog as $$
declare key_name text;
begin
  foreach key_name in array tg_argv loop
    if (to_jsonb(old)->key_name) is distinct from (to_jsonb(new)->key_name) then
      raise exception using errcode = '23514', message = 'identity_immutable';
    end if;
  end loop;
  return new;
end $$;
do $$ declare t text; begin
  for t in select table_name from information_schema.columns where table_schema = 'app' and column_name = 'id' loop
    execute format('create trigger immutable_id before update on app.%I for each row execute function private.guard_identity(''id'')', t);
  end loop;
end $$;
create trigger specification_identity before update on app.product_specifications for each row execute function private.guard_identity('variant_id','definition_id','product_type_id');
create trigger multi_enum_identity before update on app.product_specification_options for each row execute function private.guard_identity('variant_id','definition_id','option_id');
create trigger inventory_identity before update on app.inventory for each row execute function private.guard_identity('variant_id');
create trigger reservation_identity before update on app.stock_reservations for each row execute function private.guard_identity('order_item_id','variant_id','quantity');
create trigger contact_identity before update on app.order_contacts for each row execute function private.guard_identity('order_id');
create trigger rfq_line_identity before update on app.quote_request_items for each row execute function private.guard_identity('request_id');

create index category_parent on app.categories(parent_id);
create index products_collection on app.products(publication_status, brand_id, product_type_id, id);
create index categories_products on app.product_categories(category_id, product_id);
create index variants_product on app.product_variants(product_id);
create index sku_prefix on app.product_variants(sku_normalized text_pattern_ops);
create index model_prefix on app.product_variants(model_normalized text_pattern_ops);
create index search_gin on app.catalog_search_documents using gin(search_vector);
create index search_product on app.catalog_search_documents(product_id);
create index specs_number on app.product_specifications(definition_id,value_number,variant_id) where value_status = 'known' and data_type = 'number';
create index specs_enum on app.product_specifications(definition_id,option_id,variant_id) where value_status = 'known' and data_type = 'enum';
create index specs_boolean on app.product_specifications(definition_id,value_boolean,variant_id) where value_status = 'known' and data_type = 'boolean';
create index specs_multi_enum on app.product_specification_options(definition_id,option_id,variant_id);
create index reservation_expiry on app.stock_reservations(expires_at,order_item_id) where state = 'active';
create index reservation_inventory on app.stock_reservations(variant_id,state);
create index orders_queue on app.orders(order_status,created_at,id);
create index orders_source on app.orders(source,created_at,id);
create index payment_order on app.payment_entries(order_id,recorded_at);
create index movement_inventory on app.inventory_movements(variant_id,created_at);
create index return_order_line on app.return_items(order_item_id);
create index rfq_queue on app.quote_requests(status,assignee_id,created_at,id);
create index quote_items_version on app.quote_items(quote_version_id);
create index grants_order on app.guest_order_grants(order_id);
create index grants_token on app.guest_order_grants(source_token_id);
create index tokens_order on app.order_access_tokens(order_id);
create index idempotency_expiry on app.idempotency_records(replay_until);
create index abuse_expiry on app.abuse_counters(expires_at);
create index audit_entity on app.audit_events(entity_type,entity_id,occurred_at);
create index operation_history on app.operation_runs(operation_type,started_at);
create index admin_roles_users on app.admin_user_roles(role_id,user_id);

-- Baseline only: 08.3 will introduce explicit, tested policies and narrow RPC grants.
do $$ declare t record; begin
  for t in select schemaname, tablename from pg_tables where schemaname in ('app','private') loop
    execute format('alter table %I.%I enable row level security', t.schemaname,t.tablename);
    execute format('revoke all on table %I.%I from public, anon, authenticated, service_role', t.schemaname,t.tablename);
  end loop;
end $$;
revoke all on all sequences in schema app,private,api from public,anon,authenticated,service_role;
revoke execute on all functions in schema app,private,api from public,anon,authenticated,service_role;
-- No SECURITY DEFINER, application policies, exposed views, login bootstrap, buckets or business RPCs here.
