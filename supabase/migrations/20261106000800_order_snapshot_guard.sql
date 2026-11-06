-- Status/flags may evolve through later authorized RPCs. Commercial terms cannot.
create trigger order_commercial_snapshot before update on app.orders for each row
execute function private.guard_identity('public_reference','source','quote_id','quote_version_id',
  'policy_version_id','payment_method','items_net_vnd','items_tax_vnd','shipping_net_vnd',
  'shipping_tax_vnd','total_vnd','currency','created_at');
