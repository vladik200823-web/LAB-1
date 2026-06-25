'use strict';

// ─── STATE ────────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'resources_v1';

let state = {
  resources: [],
  filters: { search: '', category: '', sort: 'date-desc' },
  editingId: null,
};

// ─── PERSISTENCE ──────────────────────────────────────────────────────────────
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.resources));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    state.resources = raw ? JSON.parse(raw) : [];
  } catch {
    state.resources = [];
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let nextId = 1;
function generateId() {
  const max = state.resources.reduce((m, r) => Math.max(m, r.id), 0);
  nextId = max + 1;
  return nextId;
}

function starsHtml(n) {
  return '★'.repeat(Number(n)) + '☆'.repeat(5 - Number(n));
}

const CATEGORY_LABELS = {
  programming: 'Програмування',
  math: 'Математика',
  design: 'Дизайн',
  languages: 'Мови',
  science: 'Наука',
  business: 'Бізнес',
  other: 'Інше',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── READ FORM ────────────────────────────────────────────────────────────────
function readForm() {
  return {
    title: document.getElementById('title').value.trim(),
    url: document.getElementById('url').value.trim(),
    category: document.getElementById('category').value,
    rating: document.getElementById('rating').value,
    comment: document.getElementById('comment').value.trim(),
  };
}

// ─── VALIDATE ─────────────────────────────────────────────────────────────────
function validate(data) {
  const errors = {};

  if (!data.title) {
    errors.title = 'Назва є обов'язковою';
  } else if (data.title.length < 2) {
    errors.title = 'Назва має бути не менше 2 символів';
  }

  if (!data.url) {
    errors.url = 'URL є обов'язковим';
  } else {
    try { new URL(data.url); }
    catch { errors.url = 'Введіть коректний URL (https://...)'; }
  }

  if (!data.category) {
    errors.category = 'Оберіть категорію';
  }

  const r = Number(data.rating);
  if (!data.rating) {
    errors.rating = 'Рейтинг є обов'язковим';
  } else if (!Number.isInteger(r) || r < 1 || r > 5) {
    errors.rating = 'Рейтинг має бути цілим числом від 1 до 5';
  }

  return errors;
}

// ─── SHOW / CLEAR ERRORS ─────────────────────────────────────────────────────
function showErrors(errors) {
  const fields = ['title', 'url', 'category', 'rating', 'comment'];
  fields.forEach(f => {
    const el = document.getElementById(f);
    const errEl = document.getElementById(`err-${f}`);
    if (errors[f]) {
      el.classList.add('invalid');
      errEl.textContent = errors[f];
    } else {
      el.classList.remove('invalid');
      errEl.textContent = '';
    }
  });
}

function clearErrors() {
  showErrors({});
}

// ─── ADD ITEM ─────────────────────────────────────────────────────────────────
function addItem(data) {
  const item = {
    id: generateId(),
    title: data.title,
    url: data.url,
    category: data.category,
    rating: Number(data.rating),
    comment: data.comment,
    createdAt: new Date().toISOString(),
  };
  state.resources.push(item);
  saveToStorage();
  return item;
}

// ─── UPDATE ITEM ──────────────────────────────────────────────────────────────
function updateItem(id, data) {
  const idx = state.resources.findIndex(r => r.id === id);
  if (idx === -1) return;
  state.resources[idx] = {
    ...state.resources[idx],
    title: data.title,
    url: data.url,
    category: data.category,
    rating: Number(data.rating),
    comment: data.comment,
  };
  saveToStorage();
}

// ─── DELETE ITEM ──────────────────────────────────────────────────────────────
function deleteItem(id) {
  state.resources = state.resources.filter(r => r.id !== id);
  saveToStorage();
}

// ─── FILTER + SORT ────────────────────────────────────────────────────────────
function getFiltered() {
  const { search, category, sort } = state.filters;
  let list = [...state.resources];

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(r => r.title.toLowerCase().includes(q));
  }

  if (category) {
    list = list.filter(r => r.category === category);
  }

  if (sort === 'date-desc') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else if (sort === 'date-asc') list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  else if (sort === 'rating-desc') list.sort((a, b) => b.rating - a.rating);
  else if (sort === 'rating-asc') list.sort((a, b) => a.rating - b.rating);
  else if (sort === 'title-asc') list.sort((a, b) => a.title.localeCompare(b.title, 'uk'));

  return list;
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function render() {
  const list = getFiltered();
  const tbody = document.getElementById('resources-tbody');
  const empty = document.getElementById('empty-state');
  const meta = document.getElementById('list-meta');

  meta.textContent = `Знайдено: ${list.length} із ${state.resources.length}`;

  if (list.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  // Делегування подій — рендеримо tbody один раз
  tbody.innerHTML = list.map(r => `
    <tr data-id="${r.id}">
      <td class="td-id">${r.id}</td>
      <td class="td-title"><a href="${r.url}" target="_blank" rel="noopener">${r.title}</a></td>
      <td><span class="badge badge-${r.category}">${CATEGORY_LABELS[r.category] || r.category}</span></td>
      <td><span class="stars">${starsHtml(r.rating)}</span></td>
      <td class="td-comment">${r.comment || '—'}</td>
      <td class="td-date">${formatDate(r.createdAt)}</td>
      <td>
        <div class="actions">
          <button class="btn-edit" data-action="edit" data-id="${r.id}">✏️ Ред.</button>
          <button class="btn-delete" data-action="delete" data-id="${r.id}">🗑 Видалити</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ─── FORM RESET ───────────────────────────────────────────────────────────────
function resetForm() {
  document.getElementById('resource-form').reset();
  document.getElementById('edit-id').value = '';
  document.getElementById('form-title').textContent = 'Додати ресурс';
  document.getElementById('submit-btn').textContent = '➕ Додати';
  document.getElementById('cancel-btn').classList.add('hidden');
  state.editingId = null;
  clearErrors();
}

// ─── POPULATE FORM FOR EDIT ───────────────────────────────────────────────────
function populateForm(item) {
  document.getElementById('title').value = item.title;
  document.getElementById('url').value = item.url;
  document.getElementById('category').value = item.category;
  document.getElementById('rating').value = item.rating;
  document.getElementById('comment').value = item.comment;
  document.getElementById('edit-id').value = item.id;
  document.getElementById('form-title').textContent = 'Редагувати ресурс';
  document.getElementById('submit-btn').textContent = '💾 Зберегти';
  document.getElementById('cancel-btn').classList.remove('hidden');
  state.editingId = item.id;
  clearErrors();
  document.getElementById('title').focus();
  document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth' });
}

// ─── HANDLERS ─────────────────────────────────────────────────────────────────
function handleFormSubmit(e) {
  e.preventDefault();
  const data = readForm();
  const errors = validate(data);

  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    return;
  }

  clearErrors();

  if (state.editingId !== null) {
    updateItem(state.editingId, data);
  } else {
    addItem(data);
  }

  resetForm();
  render();
}

// Делегування подій для кнопок таблиці
function handleTableClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;

  if (action === 'delete') {
    if (confirm('Видалити цей ресурс?')) {
      deleteItem(id);
      if (state.editingId === id) resetForm();
      render();
    }
  }

  if (action === 'edit') {
    const item = state.resources.find(r => r.id === id);
    if (item) populateForm(item);
  }
}

function handleSearchInput(e) {
  state.filters.search = e.target.value.trim();
  render();
}

function handleFilterCategory(e) {
  state.filters.category = e.target.value;
  render();
}

function handleSortChange(e) {
  state.filters.sort = e.target.value;
  render();
}

function handleCancel() {
  resetForm();
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init() {
  loadFromStorage();

  // Form
  document.getElementById('resource-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('cancel-btn').addEventListener('click', handleCancel);

  // Table — делегування подій
  document.getElementById('resources-tbody').addEventListener('click', handleTableClick);

  // Filters
  document.getElementById('search').addEventListener('input', handleSearchInput);
  document.getElementById('filter-category').addEventListener('change', handleFilterCategory);
  document.getElementById('sort-by').addEventListener('change', handleSortChange);

  render();
}

document.addEventListener('DOMContentLoaded', init);
