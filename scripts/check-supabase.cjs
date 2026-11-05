// Check the configured demonstration database; remove only the task created here.
const assert = require('node:assert/strict');
const config = require('../config.json');
const base = `${config.supabaseUrl}/rest/v1/${config.tableName}`;
let testId;

async function request(query, method = 'GET', body) {
  const response = await fetch(base + query, {
    method,
    headers: { apikey: config.supabasePublishableKey, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    ...(body ? {body: JSON.stringify(body)} : {}),
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error(`${method}: HTTP ${response.status} ${await response.text()}`);
  return response.status === 204 ? [] : response.json();
}

(async () => {
  try {
    assert.ok(Array.isArray(await request('?select=*&limit=1')));
    console.log('PASS: read tasks');
    const title = `Temporary API verification ${new Date().toISOString()}`;
    const [created] = await request('', 'POST', {title, description: 'Disposable connection check', completed: false});
    assert.ok(created?.id);
    testId = created.id;
    assert.equal(created.completed, false);
    console.log('PASS: create task');
    const query = `?id=eq.${encodeURIComponent(testId)}`;
    const [updated] = await request(query, 'PATCH', {title: `${title} edited`, description: 'Updated check', completed: true});
    assert.equal(updated.title, `${title} edited`);
    assert.equal(updated.description, 'Updated check');
    assert.equal(updated.completed, true);
    const [persisted] = await request(`${query}&select=*`);
    assert.deepEqual(persisted, updated);
    console.log('PASS: edit, complete, and re-read persisted task by ID');
    const [incomplete] = await request(query, 'PATCH', {completed: false});
    assert.equal(incomplete.completed, false);
    console.log('PASS: mark incomplete');
  } finally {
    if (testId !== undefined) {
      const query = `?id=eq.${encodeURIComponent(testId)}`;
      const removed = await request(query, 'DELETE');
      assert.equal(removed.length, 1);
      assert.equal((await request(`${query}&select=*`)).length, 0);
      console.log('PASS: delete temporary task and verify removal');
    }
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
