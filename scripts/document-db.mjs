import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sql = `select json_agg(json_build_object('name',c.relname,'rls',c.relrowsecurity,
  'columns',(select json_agg(json_build_object('name',a.attname,'type',format_type(a.atttypid,a.atttypmod),
    'required',a.attnotnull,'default',pg_get_expr(d.adbin,d.adrelid),'generated',a.attgenerated) order by a.attnum)
    from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped),
  'constraints',(select json_agg(json_build_object('name',conname,'definition',pg_get_constraintdef(oid)) order by conname)
    from pg_constraint where conrelid=c.oid),
  'indexes',(select json_agg(indexdef order by indexname) from pg_indexes where schemaname='app' and tablename=c.relname)) order by c.relname)
  from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='app' and c.relkind='r';`;
const result = spawnSync('docker', ['exec', '-i', 'supabase_db_website-tmdt', 'psql', '-XAt', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'postgres'], {
  input: sql, encoding: 'utf8', windowsHide: true, maxBuffer: 8 * 1024 * 1024,
});
if (result.status !== 0) throw new Error(result.stderr || 'Cannot read local schema');
const tables = JSON.parse(result.stdout);
if (tables.length !== 52) throw new Error('Expected 52 business tables before documenting schema');
const escape = value => String(value ?? '—').replaceAll('|', '\\|').replaceAll('\n', ' ');
const lines = ['# Schema thực tế — module 08.2', '',
  'Sinh từ PostgreSQL local bằng `npm.cmd run db:docs`. Migrations là nguồn chuẩn; tài liệu này chỉ đọc metadata, không có dữ liệu khách hoặc secret.', '',
  '52 bảng trong `app`; RLS bật và chưa có policy cho phép. `api` chưa có RPC/view. `private.catalog_integrity_lock` chỉ điều phối chỉnh cây danh mục. Quan hệ tổng thể: [ERD](../architecture/ERD.md).', '',
  'Ràng buộc trigger, giới hạn chưa triển khai và checklist: [bàn giao 08.1–08.2](../docs/MODULE_08_1_2.md).', ''];
for (const table of tables) {
  lines.push(`## app.${table.name}`, '', `RLS: ${table.rls ? 'bật' : 'tắt'}.`, '', '| Cột | Kiểu PostgreSQL | NOT NULL | Default / generated |', '|---|---|---|---|');
  for (const column of table.columns) lines.push(`| ${column.name} | ${escape(column.type)} | ${column.required ? 'Có' : 'Không'} | ${column.generated ? 'GENERATED: ' : ''}${escape(column.default)} |`);
  lines.push('', 'Constraints:', '', '```sql', ...(table.constraints ?? []).map(c => `-- ${c.name}\n${c.definition};`), '```', '', 'Indexes:', '', '```sql', ...(table.indexes ?? []), '```', '');
}
writeFileSync(resolve(root, 'supabase/SCHEMA.md'), lines.join('\n'));
console.log('Documented 52 tables from actual PostgreSQL metadata; no row data exported.');
