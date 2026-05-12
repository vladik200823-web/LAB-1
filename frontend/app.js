/* ============================================================
   Каталог навчальних ресурсів — Варіант 5
   Структура: state | render | validate | handlers
   ============================================================ */

// ===== STATE =====
const state = {
  items: [],          // масив ресурсів
  nextId: 1,          // лічильник id
  filters: {
    search: '',
    category: ''
  },
  currentRating: 0    // обране значення зірок у формі
};

// ===== CATEGORY BADGE CLASS =====
const categoryClass = {
  'Програмування': 'cat-programming',
  'Математика':    'cat-math',
  'Дизайн':        'cat-design',
  'Мови':          'cat-languages',
  'Наука':         'cat-science',
  'Бізнес':        'cat-business',
  'Інше':          'cat-other'
};

// ===== DOM REFS =====
const form          = document.getElementById('resourceForm');
const titleInput    = document.getElementById('title');
const urlInput      = document.getElementById('url');
const categoryInput = document.getElementById('category');
const ratingInput   = document.getElementById('rating');
const commentInput  = document.getElementById('comment');
const starPicker    = document.getElementById('starPicker');
const stars         = starPicker.querySelectorAll('.star');
const submitBtn     = document.getElementById('submitBtn');
const resetBtn      = document.getElementById('resetBtn');
const successMsg    = document.getElementById('formSuccess');
const tbody         = document.getElementById('resourceBody');
const emptyRow      = document.getElementById('emptyRow');
const searchInput   = document.getElementById('searchInput');
const filterCategory= document.getElementById('filterCategory');
const totalCount    = document.getElementById('totalCount');

// ===== READ FORM =====
function readForm() {
  return {
    title:    titleInput.value.trim(),
    url:      urlInput.value.trim(),
    category: categoryInput.value,
    rating:   state.currentRating,
    comment:  commentInput.value.trim()
  };
}

// ===== VALIDATE =====
function validate(data) {
  const errors = {};

  if (!data.title) {
    errors.title = 'Назва є обов\'язковою';
  } else if (data.title.length < 2) {
    errors.title = 'Назва занадто коротка (мін. 2 символи)';
  }

  if (!data.url) {
    errors.url = 'URL є обов\'язковим';
  } else if (!isValidUrl(data.url)) {
    errors.url = 'Введіть коректний URL (наприклад: https://example.com)';
  }

  if (!data.category) {
    errors.category = 'Оберіть категорію';
  }

  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.rating = 'Оберіть рейтинг від 1 до 5';
  }

  return errors;
}

function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// ===== SHOW / CLEAR ERRORS =====
function showErrors(errors) {
  const fields = ['title', 'url', 'category', 'rating'];

  fields.forEach(field => {
    const el = document.getElementById(field === 'rating' ? 'starPicker' : field);
    const errEl = document.getElementById(field + 'Error');
    const inputEl = document.getElementById(field);

    if (errors[field]) {
      if (errEl) errEl.textContent = errors[field];
      if (inputEl && field !== 'rating') inputEl.classList.add('invalid');
      if (field === 'rating') el.classList.add('invalid');
    } else {
      if (errEl) errEl.textContent = '';
      if (inputEl && field !== 'rating') inputEl.classList.remove('invalid');
      if (field === 'rating') el.classList.remove('invalid');
    }
  });
}

function clearErrors() {
  ['title', 'url', 'category', 'rating'].forEach(field => {
    const errEl = document.getElementById(field + 'Error');
    const inputEl = document.getElementById(field);
    if (errEl) errEl.textContent = '';
    if (inputEl) inputEl.classList.remove('invalid');
  });
  starPicker.classList.remove('invalid');
}

// ===== ADD ITEM =====
function addItem(data) {
  const item = {
    id:       state.nextId++,
    title:    data.title,
    url:      data.url,
    category: data.category,
    rating:   data.rating,
    comment:  data.comment
  };
  state.items.push(item);
  return item;
}

// ===== DELETE ITEM =====
function deleteItem(id) {
  state.items = state.items.filter(item => item.id !== id);
  render();
}

// ===== RENDER =====
function render() {
  const { search, category } = state.filters;

  const filtered = state.items.filter(item => {
    const matchSearch = !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.comment.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !category || item.category === category;
    return matchSearch && matchCategory;
  });

  // Update header count
  const total = state.items.length;
  totalCount.textContent = total === 0
    ? '0 ресурсів'
    : total === 1
    ? '1 ресурс'
    : `${total} ресурсів`;

  // Clear tbody (keep emptyRow)
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

  if (filtered.length === 0) {
    const tr = document.createElement('tr');
    tr.className = 'empty-row';
    tr.innerHTML = `<td colspan="7">
      <div class="empty-state">
        <span class="empty-icon">◈</span>
        <p>${state.items.length === 0 ? 'Додайте перший ресурс' : 'Нічого не знайдено'}</p>
      </div>
    </td>`;
    tbody.appendChild(tr);
    return;
  }

  filtered.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.dataset.id = item.id;

    const catClass = categoryClass[item.category] || 'cat-other';
    const filledStars = '★'.repeat(item.rating);
    const emptyStars  = '★'.repeat(5 - item.rating);
    const shortUrl = item.url.replace(/^https?:\/\//, '').replace(/\/$/, '').substring(0, 30);

    tr.innerHTML = `
      <td class="cell-num">${index + 1}</td>
      <td class="cell-title">${escapeHtml(item.title)}</td>
      <td class="cell-url">
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener" title="${escapeHtml(item.url)}">
          ${escapeHtml(shortUrl)}${item.url.length > 33 ? '…' : ''}
        </a>
      </td>
      <td><span class="category-badge ${catClass}">${escapeHtml(item.category)}</span></td>
      <td>
        <span class="stars-display">${filledStars}</span><span class="stars-empty">${emptyStars}</span>
      </td>
      <td class="cell-comment" title="${escapeHtml(item.comment)}">
        ${item.comment ? escapeHtml(item.comment) : '<span style="color: var(--text-muted); font-style: italic;">—</span>'}
      </td>
      <td>
        <button type="button" class="btn-delete" data-id="${item.id}">Видалити</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ===== HELPERS =====
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function resetForm() {
  form.reset();
  state.currentRating = 0;
  ratingInput.value = '';
  stars.forEach(s => s.classList.remove('active'));
  clearErrors();
  successMsg.hidden = true;
}

// ===== STAR PICKER LOGIC =====
function setStars(value) {
  state.currentRating = value;
  ratingInput.value = value;
  stars.forEach(s => {
    s.classList.toggle('active', parseInt(s.dataset.value) <= value);
  });
}

stars.forEach(star => {
  star.addEventListener('click', () => {
    const val = parseInt(star.dataset.value);
    setStars(val);
    // Clear rating error if user picks a star
    document.getElementById('ratingError').textContent = '';
    starPicker.classList.remove('invalid');
  });

  star.addEventListener('mouseenter', () => {
    const val = parseInt(star.dataset.value);
    stars.forEach(s => {
      s.classList.toggle('active', parseInt(s.dataset.value) <= val);
    });
  });
});

starPicker.addEventListener('mouseleave', () => {
  setStars(state.currentRating);
});

// ===== HANDLERS =====

// Submit
form.addEventListener('submit', e => {
  e.preventDefault();
  successMsg.hidden = true;

  const data = readForm();
  const errors = validate(data);

  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    return;
  }

  clearErrors();
  addItem(data);
  render();

  // Show success then clear
  successMsg.hidden = false;
  resetForm();
  successMsg.hidden = false; // re-show after reset

  setTimeout(() => {
    successMsg.hidden = true;
  }, 2500);
});

// Reset
resetBtn.addEventListener('click', () => {
  resetForm();
});

// Delete (event delegation)
tbody.addEventListener('click', e => {
  const btn = e.target.closest('.btn-delete');
  if (!btn) return;
  const id = parseInt(btn.dataset.id);
  if (confirm('Видалити цей ресурс?')) {
    deleteItem(id);
  }
});

// Search
searchInput.addEventListener('input', () => {
  state.filters.search = searchInput.value.trim();
  render();
});

// Filter by category
filterCategory.addEventListener('change', () => {
  state.filters.category = filterCategory.value;
  render();
});

// Inline validation on blur
titleInput.addEventListener('blur', () => {
  const val = titleInput.value.trim();
  const errEl = document.getElementById('titleError');
  if (!val) {
    titleInput.classList.add('invalid');
    errEl.textContent = 'Назва є обов\'язковою';
  } else if (val.length < 2) {
    titleInput.classList.add('invalid');
    errEl.textContent = 'Назва занадто коротка (мін. 2 символи)';
  } else {
    titleInput.classList.remove('invalid');
    errEl.textContent = '';
  }
});

urlInput.addEventListener('blur', () => {
  const val = urlInput.value.trim();
  const errEl = document.getElementById('urlError');
  if (!val) {
    urlInput.classList.add('invalid');
    errEl.textContent = 'URL є обов\'язковим';
  } else if (!isValidUrl(val)) {
    urlInput.classList.add('invalid');
    errEl.textContent = 'Введіть коректний URL (наприклад: https://example.com)';
  } else {
    urlInput.classList.remove('invalid');
    errEl.textContent = '';
  }
});

// ===== INIT =====
render();
