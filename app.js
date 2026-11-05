"use strict";

const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#task-title");
const descriptionInput = document.querySelector("#task-description");
const submitButton = document.querySelector("#task-submit");
const cancelButton = document.querySelector("#cancel-edit");
const refreshButton = document.querySelector("#refresh-tasks");
const list = document.querySelector("#task-list");
const status = document.querySelector("#status-message");
let config;
let tasks = [];
let editingId = null;
let busy = false;

function message(text, isError = false) {
  status.textContent = text;
  status.classList.toggle("error", isError);
}

function setBusy(value) {
  busy = value;
  submitButton.disabled = value || !config;
  refreshButton.disabled = value || !config;
  cancelButton.disabled = value;
  titleInput.disabled = value;
  descriptionInput.disabled = value;
  list.setAttribute("aria-busy", String(value));
  list.querySelectorAll("button").forEach(button => { button.disabled = value; });
}

async function api(path = "", options = {}) {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${config.tableName}${path}`, {
    ...options,
    headers: {
      apikey: config.supabasePublishableKey,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...options.headers
    },
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) {
    let detail = "";
    try { detail = (await response.json()).message || ""; } catch { /* HTTP status remains useful. */ }
    throw new Error(`Request failed (${response.status}). ${detail || "Check the database configuration and RLS policies."}`);
  }
  if (response.status === 204) return [];
  return response.json();
}

function resetEditor() {
  editingId = null;
  form.reset();
  document.querySelector("#form-heading").textContent = "Add a task";
  submitButton.textContent = "Add task ↗";
  cancelButton.hidden = true;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}

function render() {
  list.replaceChildren();
  document.querySelector("#task-count").textContent = String(tasks.length);
  if (!tasks.length) {
    const empty = element("div", "empty-state", "");
    empty.append(element("span", "empty-icon", "✓"), element("h3", "", "A fresh start"), element("p", "muted", "Add your first task and give your day a little direction."));
    list.append(empty);
  }
  for (const task of tasks) {
    const item = element("article", `task-item${task.completed ? " completed" : ""}`, "");
    item.dataset.id = String(task.id);
    const heading = element("div", "task-heading", "");
    heading.append(element("h3", "task-title", task.title), element("span", "task-status", task.completed ? "Completed" : "To do"));
    const actions = element("div", "task-actions", "");
    for (const [className, text] of [["toggle-task", task.completed ? "Mark incomplete" : "Mark complete"], ["edit-task", "Edit"], ["delete-task", "Delete"]]) {
      const button = element("button", className, text);
      button.type = "button";
      if (className === "toggle-task") button.setAttribute("aria-pressed", String(task.completed));
      actions.append(button);
    }
    item.append(heading, element("p", "task-description", task.description || ""), actions);
    list.append(item);
  }
}

async function loadTasks() {
  tasks = await api("?select=*&order=id.desc");
  render();
}

async function run(operation) {
  if (busy || !config) return;
  setBusy(true);
  try { await operation(); }
  catch (error) {
    message(error.name === "TimeoutError" ? "The request timed out. Check your connection and try again." : error.message, true);
  } finally { setBusy(false); }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  if (!titleInput.value.trim()) {
    titleInput.setCustomValidity("Enter a task title.");
    titleInput.reportValidity();
    return;
  }
  run(async () => {
    const editing = editingId !== null;
    const body = { title: titleInput.value.trim(), description: descriptionInput.value.trim() };
    if (!editing) body.completed = false;
    const changed = await api(editing ? `?id=eq.${encodeURIComponent(editingId)}` : "", { method: editing ? "PATCH" : "POST", body: JSON.stringify(body) });
    if (!changed.length) throw new Error("This task could not be saved. Refresh the list and try again.");
    if (editing) tasks = tasks.map(task => String(task.id) === String(editingId) ? changed[0] : task);
    else tasks.unshift(changed[0]);
    resetEditor();
    render();
    message(editing ? "Task updated." : "Task added.");
  });
});
titleInput.addEventListener("input", () => titleInput.setCustomValidity(""));
cancelButton.addEventListener("click", () => { resetEditor(); titleInput.focus(); });
refreshButton.addEventListener("click", () => run(async () => { await loadTasks(); message("Task list refreshed."); }));

list.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button || busy) return;
  const item = button.closest(".task-item");
  const task = tasks.find(entry => String(entry.id) === item.dataset.id);
  if (!task) return;
  if (button.classList.contains("edit-task")) {
    editingId = task.id;
    titleInput.value = task.title;
    descriptionInput.value = task.description || "";
    titleInput.setCustomValidity("");
    document.querySelector("#form-heading").textContent = "Edit task";
    submitButton.textContent = "Save changes ↗";
    cancelButton.hidden = false;
    titleInput.focus();
    return;
  }
  run(async () => {
    const deleting = button.classList.contains("delete-task");
    const changed = await api(`?id=eq.${encodeURIComponent(task.id)}`, {
      method: deleting ? "DELETE" : "PATCH",
      ...(deleting ? {} : { body: JSON.stringify({ completed: !task.completed }) })
    });
    if (!changed.length) throw new Error("This task is no longer available or the operation was denied. Refresh the list.");
    tasks = deleting ? tasks.filter(entry => String(entry.id) !== String(task.id)) : tasks.map(entry => String(entry.id) === String(task.id) ? changed[0] : entry);
    if (deleting && String(editingId) === String(task.id)) resetEditor();
    render();
    message(deleting ? "Task deleted." : "Task status updated.");
  });
});

async function initialize() {
  setBusy(true);
  try {
    const response = await fetch("config.json", { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error("Could not load config.json.");
    const settings = await response.json();
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(settings.supabaseUrl) || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(settings.supabasePublishableKey) || settings.tableName !== "tasks") {
      throw new Error("Setup needed: add your Supabase project URL and public publishable key to config.json.");
    }
    config = { ...settings, supabaseUrl: settings.supabaseUrl.replace(/\/$/, "") };
    await loadTasks();
    message("All tasks are up to date.");
  } catch (error) { message(error.message, true); }
  finally { setBusy(false); }
}

initialize();
