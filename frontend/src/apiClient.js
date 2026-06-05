import { API_BASE_URL } from "./config.js";

async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  let response;
  try {
    response = await fetch(url, options);
  } catch (e) {
    throw {
      status: 0,
      message: "Помилка мережі або CORS. Перевір чи запущений бекенд.",
      details: e?.message || String(e),
    };
  }

  if (response.status === 204) return null;

  const rawText = await response.text();

  if (response.ok) {
    if (!rawText) return null;
    try { return JSON.parse(rawText); } catch { return rawText; }
  }

  let errPayload = null;
  try { errPayload = rawText ? JSON.parse(rawText) : null; } catch {}

  throw {
    status: response.status,
    message: errPayload?.error || errPayload?.message || errPayload?.title || "HTTP помилка",
    details: errPayload?.detail || rawText || `HTTP ${response.status}`,
    errors: errPayload?.errors || null,
  };
}

// Resources
export async function getResources(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/resources${qs ? "?" + qs : ""}`);
}

export async function getResourceById(id) {
  return request(`/resources/${encodeURIComponent(id)}`);
}

export async function createResource(dto) {
  return request("/resources", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function updateResource(id, dto) {
  return request(`/resources/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function removeResource(id) {
  return request(`/resources/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// Users
export async function getUsers() {
  return request("/users");
}

// Ratings
export async function createRating(dto) {
  return request("/ratings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

// Comments
export async function getComments(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/comments${qs ? "?" + qs : ""}`);
}

export async function createComment(dto) {
  return request("/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
}

export async function removeComment(id) {
  return request(`/comments/${encodeURIComponent(id)}`, { method: "DELETE" });
}
