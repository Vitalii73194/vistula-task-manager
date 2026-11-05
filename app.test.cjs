// Dependency-free integration checks for browser actions against a REST stub.
// These do not replace checking the real Supabase project and GitHub Pages.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Element {
  constructor(tag = 'div') {
    this.tag = tag; this.children = []; this.dataset = {}; this.listeners = {};
    this.value = ''; this.className = ''; this.textContent = ''; this.attributes = {};
    this.classList = {
      contains: name => this.className.split(' ').includes(name),
      toggle: (name, on) => { this.className = this.className.split(' ').filter(x => x !== name).concat(on ? [name] : []).join(' '); }
    };
  }
  append(...nodes) { for (const node of nodes) { node.parent = this; this.children.push(node); } }
  replaceChildren() { this.children = []; }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener(name, handler) { this.listeners[name] = handler; }
  querySelectorAll(tag) { return this.children.flatMap(node => [...(node.tag === tag ? [node] : []), ...node.querySelectorAll(tag)]); }
  closest(selector) { if (selector === this.tag || (selector.startsWith('.') && this.classList.contains(selector.slice(1)))) return this; return this.parent?.closest(selector); }
  setCustomValidity(value) { this.validationMessage = value; }
  reportValidity() {}
  focus() {}
}

async function waitFor(check) {
  for (let i = 0; i < 100; i++) {
    if (check()) return;
    await new Promise(resolve => setImmediate(resolve));
  }
  throw new Error('Application did not settle');
}

async function setup({ configured = true } = {}) {
  const ids = ['task-form','task-title','task-description','task-submit','cancel-edit','refresh-tasks','task-list','status-message','form-heading','task-count'];
  const nodes = Object.fromEntries(ids.map(id => [id, new Element()]));
  nodes['task-form'].reset = () => { nodes['task-title'].value = ''; nodes['task-description'].value = ''; };
  const store = []; const calls = []; let nextId = 1; let failNext = false;
  const fetch = async (url, options = {}) => {
    if (url === 'config.json') return { ok: true, json: async () => ({ supabaseUrl: configured ? 'https://example.supabase.co' : 'https://YOUR_PROJECT_ID.supabase.co', supabasePublishableKey: 'sb_publishable_test', tableName: 'tasks' }) };
    calls.push({url, ...options});
    if (failNext) { failNext = false; return {ok:false,status:503,json:async()=>({message:'Temporary database outage'})}; }
    const parsed = new URL(url); const id = parsed.searchParams.get('id')?.slice(3);
    const index = store.findIndex(task => String(task.id) === id);
    let result;
    switch (options.method || 'GET') {
      case 'GET': result = [...store].reverse(); break;
      case 'POST': result = [{id:nextId++, ...JSON.parse(options.body)}]; store.push(result[0]); break;
      case 'PATCH': result = index < 0 ? [] : [store[index] = {...store[index], ...JSON.parse(options.body)}]; break;
      case 'DELETE': result = index < 0 ? [] : store.splice(index, 1); break;
      default: throw new Error('Unexpected method');
    }
    return {ok:true,status:200,json:async()=>JSON.parse(JSON.stringify(result))};
  };
  vm.runInNewContext(fs.readFileSync('app.js', 'utf8'), {
    document: { querySelector: selector => nodes[selector.slice(1)], createElement: tag => new Element(tag) },
    fetch, AbortSignal, console
  });
  await waitFor(() => nodes['task-list'].attributes['aria-busy'] === 'false');
  const action = async (name, target) => {
    nodes[name].listeners[name === 'task-form' ? 'submit' : 'click']({preventDefault(){}, target});
    await waitFor(() => nodes['task-list'].attributes['aria-busy'] === 'false');
  };
  const button = name => nodes['task-list'].querySelectorAll('button').find(node => node.classList.contains(name));
  return {nodes, store, calls, action, button, fail: () => { failNext = true; }};
}

test('CRUD persists through refresh, preserves completion during editing, and renders text safely', async () => {
  const app = await setup(); const {nodes, action, button, store, calls} = app;
  nodes['task-title'].value = '<img src=x onerror=alert(1)>';
  nodes['task-description'].value = 'First description';
  await action('task-form');
  assert.equal(store.length, 1);
  assert.equal(nodes['task-list'].children[0].children[0].children[0].textContent, '<img src=x onerror=alert(1)>');
  assert.equal(nodes['task-list'].children[0].dataset.id, '1');
  await action('refresh-tasks');
  assert.equal(nodes['task-count'].textContent, '1');
  await action('task-list', button('toggle-task'));
  assert.equal(store[0].completed, true);
  await action('task-list', button('edit-task'));
  nodes['task-title'].value = 'Edited task'; nodes['task-description'].value = 'Edited description';
  await action('task-form');
  assert.equal(store[0].title, 'Edited task'); assert.equal(store[0].description, 'Edited description');
  assert.equal(store[0].completed, true);
  await action('task-list', button('toggle-task'));
  assert.equal(store[0].completed, false);
  await action('task-list', button('delete-task'));
  await action('refresh-tasks');
  assert.equal(store.length, 0); assert.equal(nodes['task-count'].textContent, '0');
  assert.ok(calls.every(call => call.headers.apikey === 'sb_publishable_test' && !call.headers.Authorization));
});

test('failed save retains form text, reports error and permits retry', async () => {
  const app = await setup();
  app.nodes['task-title'].value = 'Keep this title'; app.fail();
  await app.action('task-form');
  assert.match(app.nodes['status-message'].textContent, /503.*Temporary database outage/);
  assert.equal(app.nodes['task-title'].value, 'Keep this title');
  assert.equal(app.nodes['task-submit'].disabled, false);
  await app.action('task-form');
  assert.equal(app.store.length, 1);
});

test('unconfigured app reports setup requirement and makes no database requests', async () => {
  const app = await setup({configured:false});
  assert.match(app.nodes['status-message'].textContent, /Setup needed/);
  assert.equal(app.nodes['task-submit'].disabled, true);
  assert.equal(app.calls.length, 0);
});

test('whitespace-only title is rejected before a database request', async () => {
  const app = await setup(); const before = app.calls.length;
  app.nodes['task-title'].value = '   ';
  await app.action('task-form');
  assert.equal(app.calls.length, before);
  assert.equal(app.nodes['task-title'].validationMessage, 'Enter a task title.');
});
