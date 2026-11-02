// public/app.js - the "dining room": talks to the kitchen (the REST API) with fetch.
const API = '/tasks'; // same origin, so no CORS setup is needed

const els = {
  form: document.getElementById('add-form'),
  input: document.getElementById('new-title'),
  list: document.getElementById('list'),
  empty: document.getElementById('empty'),
  summary: document.getElementById('summary'),
  message: document.getElementById('message'),
  filters: document.getElementById('filters'),
};

let tasks = [];
let filter = 'all';
let editingId = null;

// ---- API helper: sends JSON, throws Error(message) on any non-2xx response ----
async function api(path = '', options = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

function showError(err) {
  els.message.textContent = err.message === 'Failed to fetch'
    ? 'Cannot reach the server. Check that it is running.'
    : err.message;
  els.message.hidden = false;
}

function clearError() {
  els.message.hidden = true;
}

// ---- Actions ----
async function loadTasks() {
  try {
    tasks = await api();
    clearError();
  } catch (err) {
    showError(err);
  }
  render();
}

async function addTask(title) {
  const task = await api('', { method: 'POST', body: JSON.stringify({ title }) });
  tasks.unshift(task);
}

async function patchTask(id, fields) {
  const updated = await api(`/${id}`, { method: 'PATCH', body: JSON.stringify(fields) });
  tasks = tasks.map((t) => (t.id === id ? updated : t));
}

async function deleteTask(id) {
  await api(`/${id}`, { method: 'DELETE' });
  tasks = tasks.filter((t) => t.id !== id);
}

// Runs an action, then re-renders. Any error is shown in the red message bar.
async function run(action) {
  try {
    await action();
    clearError();
  } catch (err) {
    showError(err);
  }
  render();
}

// ---- Rendering (textContent only, so task titles can never inject HTML) ----
function visibleTasks() {
  if (filter === 'active') return tasks.filter((t) => !t.completed);
  if (filter === 'done') return tasks.filter((t) => t.completed);
  return tasks;
}

function render() {
  const open = tasks.filter((t) => !t.completed).length;
  els.summary.textContent = tasks.length === 0
    ? 'Nothing here yet.'
    : `${open} to do, ${tasks.length - open} done`;

  els.list.replaceChildren(...visibleTasks().map(renderItem));

  const emptyText = {
    all: 'No tasks yet. Add your first one above.',
    active: 'Nothing left to do.',
    done: 'No completed tasks yet.',
  };
  els.empty.textContent = emptyText[filter];
  els.empty.hidden = visibleTasks().length > 0;

  if (editingId !== null) {
    const box = els.list.querySelector('.edit-input');
    if (box) { box.focus(); box.select(); }
  }
}

function button(label, className, onClick) {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = label;
  if (className) b.className = className;
  b.addEventListener('click', onClick);
  return b;
}

function renderItem(task) {
  const li = document.createElement('li');
  li.className = 'item' + (task.completed ? ' done' : '');

  const check = document.createElement('input');
  check.type = 'checkbox';
  check.checked = task.completed;
  check.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'to do' : 'done'}`);
  check.addEventListener('change', () => run(() => patchTask(task.id, { completed: check.checked })));
  li.append(check);

  if (editingId === task.id) {
    const box = document.createElement('input');
    box.type = 'text';
    box.className = 'edit-input';
    box.maxLength = 255;
    box.value = task.title;
    box.setAttribute('aria-label', 'Edit task title');
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveEdit(task, box.value);
      if (e.key === 'Escape') { editingId = null; render(); }
    });
    li.append(box);
    li.append(actions(
      button('Save', '', () => saveEdit(task, box.value)),
      button('Cancel', '', () => { editingId = null; render(); }),
    ));
  } else {
    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = task.title;
    title.addEventListener('dblclick', () => { editingId = task.id; render(); });
    li.append(title);
    li.append(actions(
      button('Edit', '', () => { editingId = task.id; render(); }),
      button('Delete', 'delete', () => run(() => deleteTask(task.id))),
    ));
  }
  return li;
}

function actions(...buttons) {
  const div = document.createElement('div');
  div.className = 'actions';
  div.append(...buttons);
  return div;
}

async function saveEdit(task, value) {
  const title = value.trim();
  if (title === task.title) { editingId = null; render(); return; }
  try {
    await patchTask(task.id, { title });
    editingId = null;
    clearError();
  } catch (err) {
    showError(err); // stay in edit mode so the user can fix the title
  }
  render();
}

// ---- Events ----
els.form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = els.input.value.trim();
  if (!title) return;
  const submit = els.form.querySelector('button');
  submit.disabled = true;
  try {
    await addTask(title);
    els.input.value = '';
    clearError();
  } catch (err) {
    showError(err);
  }
  submit.disabled = false;
  render();
  els.input.focus();
});

els.filters.addEventListener('click', (e) => {
  const tab = e.target.closest('button[data-filter]');
  if (!tab) return;
  filter = tab.dataset.filter;
  els.filters.querySelectorAll('button').forEach((b) =>
    b.setAttribute('aria-selected', String(b === tab)));
  render();
});

loadTasks();
