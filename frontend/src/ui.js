export function showNotice(text, isError = false) {
  const el = document.getElementById("notice");
  el.textContent = text;
  el.className = "notice " + (isError ? "notice-error" : "notice-success");
  el.style.display = "block";
  setTimeout(() => { el.style.display = "none"; }, 4000);
}
export function renderListStatus(status, error) {
  const el = document.getElementById("listStatus");
  el.innerHTML = "";
  if (status === "loading") { el.textContent = "������������..."; el.className = "status-msg"; }
  else if (status === "empty") { el.textContent = "������ �� ����."; el.className = "status-msg"; }
  else if (status === "error") { el.textContent = `�������: ${error?.message || "�������"}`; el.className = "status-msg error"; }
  else { el.className = ""; }
}
export function renderResources(items, onDelete, onSelect) {
  const el = document.getElementById("listContainer");
  el.innerHTML = "";
  if (!items || items.length === 0) return;
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["#","�����","��������","�����","URL","ĳ�"].forEach(text => { const th = document.createElement("th"); th.textContent = text; headerRow.appendChild(th); });
  thead.appendChild(headerRow); table.appendChild(thead);
  const tbody = document.createElement("tbody");
  for (const item of items) {
    const tr = document.createElement("tr");
    const tdId = document.createElement("td"); tdId.textContent = item.id; tr.appendChild(tdId);
    const tdTitle = document.createElement("td"); const titleSpan = document.createElement("span"); titleSpan.className = "resource-title"; titleSpan.textContent = item.title ?? "(��� �����)"; titleSpan.addEventListener("click", () => onSelect(item.id)); tdTitle.appendChild(titleSpan); tr.appendChild(tdTitle);
    const tdCat = document.createElement("td"); const badge = document.createElement("span"); badge.className = "badge"; badge.textContent = item.category ?? "-"; tdCat.appendChild(badge); tr.appendChild(tdCat);
    const tdAuthor = document.createElement("td"); tdAuthor.textContent = item.authorName ?? item.authorId ?? "-"; tr.appendChild(tdAuthor);
    const tdUrl = document.createElement("td"); const link = document.createElement("a"); link.href = item.url; link.target = "_blank"; link.rel = "noopener"; link.textContent = "���������"; tdUrl.appendChild(link); tr.appendChild(tdUrl);
    const tdActions = document.createElement("td"); const deleteBtn = document.createElement("button"); deleteBtn.className = "btn btn-sm btn-danger"; deleteBtn.textContent = "��������"; deleteBtn.addEventListener("click", () => onDelete(item.id)); tdActions.appendChild(deleteBtn); tr.appendChild(tdActions);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody); el.appendChild(table);
}
export function renderDetail(resource) {
  const el = document.getElementById("detailPanel");
  if (!resource) { el.innerHTML = ""; el.style.display = "none"; return; }
  el.style.display = "block"; el.innerHTML = "";
  const h3 = document.createElement("h3"); h3.textContent = `����� ������� #${resource.id}`; el.appendChild(h3);
  [["�����",resource.title],["��������",resource.category],["����",resource.description],["�����",resource.authorName??resource.authorId],["��������",new Date(resource.createdAt).toLocaleString("uk-UA")]].forEach(([label,value]) => { const p = document.createElement("p"); const b = document.createElement("b"); b.textContent = label+": "; p.appendChild(b); p.appendChild(document.createTextNode(value??"�")); el.appendChild(p); });
  const pUrl = document.createElement("p"); const bUrl = document.createElement("b"); bUrl.textContent = "URL: "; const a = document.createElement("a"); a.href = resource.url; a.target = "_blank"; a.textContent = resource.url; pUrl.appendChild(bUrl); pUrl.appendChild(a); el.appendChild(pUrl);
  const closeBtn = document.createElement("button"); closeBtn.className = "btn btn-sm"; closeBtn.textContent = "�������"; closeBtn.addEventListener("click", () => { el.innerHTML = ""; el.style.display = "none"; }); el.appendChild(closeBtn);
}
export function setFormEnabled(enabled) { const btn = document.getElementById("submitBtn"); btn.disabled = !enabled; btn.textContent = enabled ? "+ ������ ������" : "����������..."; }
export function clearForm() { document.getElementById("resourceForm").reset(); document.querySelectorAll(".field-error").forEach(el => el.textContent = ""); document.querySelectorAll("input, select, textarea").forEach(el => el.classList.remove("invalid")); }
export function showFieldErrors(errors) { if (!errors) return; for (const [field, msg] of Object.entries(errors)) { const errEl = document.getElementById(`err-${field}`); const inputEl = document.getElementById(`f-${field}`); if (errEl) errEl.textContent = Array.isArray(msg) ? msg[0] : msg; if (inputEl) inputEl.classList.add("invalid"); } }

