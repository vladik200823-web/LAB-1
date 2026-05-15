const { db, nextId } = require("../db/inMemory");
const AppError = require("../middleware/AppError");
const { throwIfErrors, requireString, requireUrl, requireEnum, requireInt, ALLOWED_CATEGORIES } = require("../middleware/validate");
function getAll() { return db.resources; }
function getById(id) {
  const r = db.resources.find(r => r.id === id);
  if (!r) throw new AppError(404, "NOT_FOUND", `Resource with id=${id} not found`);
  return r;
}
function create(body) {
  const errors = [];
  requireString(errors, body, "title", { min: 2, max: 200 });
  requireUrl(errors, body, "url");
  requireEnum(errors, body, "category", ALLOWED_CATEGORIES);
  requireString(errors, body, "description", { min: 5, max: 1000 });
  requireInt(errors, body, "authorId", { min: 1 });
  throwIfErrors(errors);
  if (!db.users.find(u => u.id === body.authorId)) throw new AppError(400, "VALIDATION_ERROR", "Invalid request body", [{ field: "authorId", message: `User with id=${body.authorId} does not exist` }]);
  const resource = { id: nextId("resources"), title: body.title.trim(), url: body.url.trim(), category: body.category, description: body.description.trim(), authorId: body.authorId, createdAt: new Date().toISOString() };
  db.resources.push(resource);
  return resource;
}
function update(id, body) {
  const resource = getById(id);
  const errors = [];
  if (body.title !== undefined) requireString(errors, body, "title", { min: 2, max: 200 });
  if (body.url !== undefined) requireUrl(errors, body, "url");
  if (body.category !== undefined) requireEnum(errors, body, "category", ALLOWED_CATEGORIES);
  if (body.description !== undefined) requireString(errors, body, "description", { min: 5, max: 1000 });
  throwIfErrors(errors);
  if (body.title !== undefined) resource.title = body.title.trim();
  if (body.url !== undefined) resource.url = body.url.trim();
  if (body.category !== undefined) resource.category = body.category;
  if (body.description !== undefined) resource.description = body.description.trim();
  return resource;
}
function remove(id) {
  const idx = db.resources.findIndex(r => r.id === id);
  if (idx === -1) throw new AppError(404, "NOT_FOUND", `Resource with id=${id} not found`);
  db.resources.splice(idx, 1);
}
module.exports = { getAll, getById, create, update, remove };
