export function showNotice(text, isError = false) {
  const el = document.getElementById("notice");
  el.innerHTML = text;
  el.className = "notice " + (isError ? "notice-error" : "notice-success");
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 4000);
}

export function renderListStatus(status, error) {
  const el = document.getElementById("listStatus");
  if (status === "loading") el.innerHTML = `<div class="status-msg">⏳ Завантаження...</div>`;
  else if (status === "empty") el.innerHTML = `<div class="status-msg">📭 Записів ще немає.</div>`;
  else if (status === "error") el.innerHTML = `<div class="status-msg error">❌ Помилка: ${error?.message || "невідома"}</div>`;
  else el.innerHTML = "";
}

export function renderResources(items, onDelete, onSelect) {
  const el = document.getElementById("listContainer");
  el.innerHTML = "";

  if (!items || items.length === 0) return;

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>#</th>
        <th>Назва</th>
        <th>Категорія</th>
        <th>Автор</th>
        <th>URL</th>
        <th>Дії</th>
      </tr>
    </thead>
  `;
  const tbody = document.createElement("tbody");

  for (const item of items) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.id}</td>
      <td><span class="resource-title" data-id="${item.id}">${item.title ?? "(без назви)"}</span></td>
      <td><span class="badge">${item.category ?? "–"}</span></td>
      <td>${item.authorName ?? item.authorId ?? "–"}</td>
      <td><a href="${item.url}" target="_blank" rel="noopener">🔗 посилання</a></td>
      <td>
        <button class="btn btn-sm btn-danger" data-delete="${item.id}">Видалити</button>
      </td>
    `;
    tr.querySelector("[data-delete]").addEventListener("click", () => onDelete(item.id));
    tr.querySelector(".resource-title").addEventListener("click", () => onSelect(item.id));
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  el.appendChild(table);
}

export function renderDetail(resource) {
  const el = document.getElementById("detailPanel");
  if (!resource) { el.innerHTML = ""; el.style.display = "none"; return; }
  el.style.display = "block";
  el.innerHTML = `
    <h3>📄 Деталі ресурсу #${resource.id}</h3>
    <p><b>Назва:</b> ${resource.title}</p>
    <p><b>URL:</b> <a href="${resource.url}" target="_blank">${resource.url}</a></p>
    <p><b>Категорія:</b> ${resource.category}</p>
    <p><b>Опис:</b> ${resource.description}</p>
    <p><b>Автор:</b> ${resource.authorName ?? resource.authorId}</p>
    <p><b>Створено:</b> ${new Date(resource.createdAt).toLocaleString("uk-UA")}</p>
    <button class="btn btn-sm" id="closeDetail">✕ Закрити</button>
  `;
  el.querySelector("#closeDetail").addEventListener("click", () => {
    el.innerHTML = ""; el.style.display = "none";
  });
}

export function setFormEnabled(enabled) {
  const btn = document.getElementById("submitBtn");
  btn.disabled = !enabled;
  btn.textContent = enabled ? "➕ Додати ресурс" : "⏳ Збереження...";
}

export function clearForm() {
  document.getElementById("resourceForm").reset();
  document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
  document.querySelectorAll("input, select, textarea").forEach(el => el.classList.remove("invalid"));
}

export function showFieldErrors(errors) {
  if (!errors) return;
  for (const [field, msg] of Object.entries(errors)) {
    const errEl = document.getElementById(`err-${field}`);
    const inputEl = document.getElementById(`f-${field}`);
    if (errEl) errEl.textContent = Array.isArray(msg) ? msg[0] : msg;
    if (inputEl) inputEl.classList.add("invalid");
  }
}
