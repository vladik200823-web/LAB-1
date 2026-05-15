const { db, nextId } = require("../db/inMemory");
const AppError = require("../middleware/AppError");
const { throwIfErrors, requireString, requireInt } = require("../middleware/validate");
function getAll() { return db.comments; }
function getById(id) {
  const c = db.comments.find(c => c.id === id);
  if (!c) throw new AppError(404, "NOT_FOUND", `Comment with id=${id} not found`);
  return c;
}
function create(body) {
  const errors = [];
  requireInt(errors, body, "resourceId", { min: 1 });
  requireInt(errors, body, "userId", { min: 1 });
  requireString(errors, body, "text", { min: 2, max: 1000 });
  throwIfErrors(errors);
  if (!db.resources.find(r => r.id === body.resourceId)) throw new AppError(400, "VALIDATION_ERROR", "Invalid request body", [{ field: "resourceId", message: `Resource with id=${body.resourceId} does not exist` }]);
  if (!db.users.find(u => u.id === body.userId)) throw new AppError(400, "VALIDATION_ERROR", "Invalid request body", [{ field: "userId", message: `User with id=${body.userId} does not exist` }]);
  const comment = { id: nextId("comments"), resourceId: body.resourceId, userId: body.userId, text: body.text.trim(), createdAt: new Date().toISOString() };
  db.comments.push(comment);
  return comment;
}
function update(id, body) {
  const comment = getById(id);
  const errors = [];
  if (body.text !== undefined) requireString(errors, body, "text", { min: 2, max: 1000 });
  throwIfErrors(errors);
  if (body.text !== undefined) comment.text = body.text.trim();
  return comment;
}
function remove(id) {
  const idx = db.comments.findIndex(c => c.id === id);
  if (idx === -1) throw new AppError(404, "NOT_FOUND", `Comment with id=${id} not found`);
  db.comments.splice(idx, 1);
}
module.exports = { getAll, getById, create, update, remove };
