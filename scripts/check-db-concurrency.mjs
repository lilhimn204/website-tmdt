import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';

// Fixed local container: never accepts a database URL or hosted target.
const container = 'supabase_db_website-tmdt';
function session(name) {
  const child = spawn('docker', ['exec', '-i', container, 'psql', '-X', '-qAt', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'postgres'], { windowsHide: true });
  let output = '', error = '', step = 0;
  child.stdout.on('data', data => { output += data; });
  child.stderr.on('data', data => { error += data; });
  const ended = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', code => resolve({ code, output, error }));
  });
  child.stdin.on('error', () => {});
  child.stdin.write(`\\set VERBOSITY verbose\nset application_name = '${name}';\n`);
  return {
    async send(sql) {
      const marker = `STEP_${++step}`;
      child.stdin.write(`${sql}\n\\echo ${marker}\n`);
      const reached = new Promise(resolve => {
        const listener = () => {
          if (output.includes(marker)) { child.stdout.off('data', listener); resolve(); }
        };
        child.stdout.on('data', listener);
        child.once('close', () => child.stdout.off('data', listener));
      });
      return Promise.race([reached, ended.then(result => { throw new Error(result.error || `psql exited ${result.code}`); })]);
    },
    async end(sql = '') { child.stdin.end(`${sql}\n`); return ended; },
  };
}
async function query(sql) {
  const db = session('website_tmdt_schema_test');
  const result = await db.end(sql);
  if (result.code !== 0) throw new Error(result.error);
  return result.output.trim();
}
for (const isolation of ['read committed', 'repeatable read']) {
  const a = randomUUID(), b = randomUUID();
  const label = `schema_test_${randomUUID().replaceAll('-', '')}`;
  const left = session(`${label}_a`), right = session(`${label}_b`);
  let leftEnded = false, rightEnded = false;
  try {
    await query(`insert into app.categories(id,name,slug) values ('${a}','TEST concurrency','test-${a}'),('${b}','TEST concurrency','test-${b}');`);
    await right.send(`begin isolation level ${isolation}; select count(*) from app.categories;`);
    await left.send(`begin; update app.categories set parent_id='${b}' where id='${a}'; set constraints all immediate;`);
    // Capture rejection immediately, so there is no unhandled promise while the blocker commits.
    const blockedWrite = right.send(`update app.categories set parent_id='${a}' where id='${b}'; set constraints all immediate;`)
      .then(() => ({ succeeded: true }), error => ({ succeeded: false, error: error.message }));
    const deadline = Date.now() + 10000;
    let waiting = false;
    while (Date.now() < deadline) {
      waiting = await query(`select exists(select 1 from pg_stat_activity where application_name='${label}_b' and wait_event_type='Lock');`) === 't';
      if (waiting) break;
      await delay(100);
    }
    assert.ok(waiting, `${isolation}: second catalog edit must wait for the lock`);
    const first = await left.end('commit;'); leftEnded = true;
    assert.equal(first.code, 0, first.error);
    const second = await blockedWrite;
    assert.equal(second.succeeded, false, `${isolation}: concurrent cycle must fail`);
    assert.match(second.error, isolation === 'read committed' ? /category_cycle/ : /could not serialize access/);
    await right.end(); rightEnded = true;
    const cycle = await query(`with recursive ancestors(id,parent_id) as (select id,parent_id from app.categories where parent_id is not null union select a.id,c.parent_id from ancestors a join app.categories c on c.id=a.parent_id where c.parent_id is not null) select count(*) from ancestors where id=parent_id;`);
    assert.equal(cycle, '0');
    console.log(`PASS: category cycle blocked with ${isolation}, using two real PostgreSQL sessions.`);
  } finally {
    if (!leftEnded) await left.end('rollback;');
    if (!rightEnded) await right.end('rollback;');
    // Only the two random test IDs are removed. No reset, truncate or other-project cleanup.
    await query(`begin; update app.categories set parent_id=null where id in ('${a}','${b}'); delete from app.categories where id in ('${a}','${b}'); commit;`);
  }
}
console.log('Concurrency fixtures removed. Checkout/stock RPC concurrency remains part of 08.7–08.8.');
