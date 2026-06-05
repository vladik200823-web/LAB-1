import {
  getResources, getResourceById, createResource, removeResource, getUsers
} from "./apiClient.js";
import {
  showNotice, renderListStatus, renderResources, renderDetail,
  setFormEnabled, clearForm, showFieldErrors
} from "./ui.js";

const CATEGORIES = ["programming", "math", "design", "languages", "science", "business", "other"];

// ── Load list ──────────────────────────────────────────────────────────────
async function loadList() {
  renderListStatus("loading");
  document.getElementById("listContainer").innerHTML = "";
  try {
    const result = await getResources();
    const items = result?.data ?? result ?? [];
    if (!items || items.length === 0) {
      renderListStatus("empty");
      return;
    }
    renderListStatus("success");
    renderResources(items, handleDelete, handleSelect);
  } catch (err) {
    renderListStatus("error", err);
  }
}

// ── Select / detail ────────────────────────────────────────────────────────
async function handleSelect(id) {
  try {
    const result = await getResourceById(id);
    renderDetail(result?.data ?? result);
  } catch (err) {
    showNotice(`Помилка (${err.status}): ${err.message}`, true);
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────
async function handleDelete(id) {
  if (!confirm(`Видалити ресурс #${id}?`)) return;
  try {
    await removeResource(id);
    showNotice("✅ Ресурс видалено");
    await loadList();
  } catch (err) {
    showNotice(`❌ Помилка видалення (${err.status}): ${err.message}`, true);
  }
}

// ── Validate form ──────────────────────────────────────────────────────────
function validateForm(data) {
  const errors = {};
  if (!data.title || data.title.trim().length < 2) errors.title = "Мінімум 2 символи";
  if (!data.url || !data.url.startsWith("http")) errors.url = "Введіть коректний URL (http/https)";
  if (!data.category || !CATEGORIES.includes(data.category)) errors.category = "Оберіть категорію";
  if (!data.description || data.description.trim().length < 5) errors.description = "Мінімум 5 символів";
  if (!data.authorId) errors.authorId = "Оберіть автора";
  return Object.keys(errors).length ? errors : null;
}

// ── Submit form ────────────────────────────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();

  // clear previous errors
  document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
  document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));

  const data = {
    title: document.getElementById("f-title").value.trim(),
    url: document.getElementById("f-url").value.trim(),
    category: document.getElementById("f-category").value,
    description: document.getElementById("f-description").value.trim(),
    authorId: parseInt(document.getElementById("f-authorId").value),
  };

  const clientErrors = validateForm(data);
  if (clientErrors) { showFieldErrors(clientErrors); return; }

  setFormEnabled(false);
  try {
    await createResource(data);
    showNotice("✅ Ресурс додано!");
    clearForm();
    await loadList();
  } catch (err) {
    if (err.errors) {
      showFieldErrors(err.errors);
    } else {
      showNotice(`❌ Помилка (${err.status}): ${err.message}`, true);
    }
  } finally {
    setFormEnabled(true);
  }
}

// ── Filter ─────────────────────────────────────────────────────────────────
async function handleFilter() {
  const cat = document.getElementById("filterCategory").value;
  renderListStatus("loading");
  document.getElementById("listContainer").innerHTML = "";
  try {
    const result = await getResources(cat ? { category: cat } : {});
    const items = result?.data ?? result ?? [];
    if (!items.length) { renderListStatus("empty"); return; }
    renderListStatus("success");
    renderResources(items, handleDelete, handleSelect);
  } catch (err) {
    renderListStatus("error", err);
  }
}

// ── Fill author select ─────────────────────────────────────────────────────
async function loadAuthors() {
  try {
    const result = await getUsers();
    const users = result?.data ?? result ?? [];
    const sel = document.getElementById("f-authorId");
    sel.innerHTML = `<option value="">— Оберіть автора —</option>`;
    for (const u of users) {
      sel.innerHTML += `<option value="${u.id}">${u.name}</option>`;
    }
  } catch { /* ignore */ }
}

// ── Init ───────────────────────────────────────────────────────────────────
document.getElementById("resourceForm").addEventListener("submit", handleSubmit);
document.getElementById("filterCategory").addEventListener("change", handleFilter);

loadAuthors();
loadList();
