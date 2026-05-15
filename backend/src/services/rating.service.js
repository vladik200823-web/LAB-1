const { db, nextId } = require("../db/inMemory");
const AppError = require("../middleware/AppError");
const { throwIfErrors, requireInt } = require("../middleware/validate");
function getAll() { return db.ratings; }
function getById(id) {
  const r = db.ratings.find(r => r.id === id);
  if (!r) throw new AppError(404, "NOT_FOUND", `Rating with id=${id} not found`);
  return r;
}
function create(body) {
  const errors = [];
  requireInt(errors, body, "resourceId", { min: 1 });
  requireInt(errors, body, "userId", { min: 1 });
  requireInt(errors, body, "value", { min: 1, max: 5 });
  throwIfErrors(errors);
  if (!db.resources.find(r => r.id === body.resourceId)) throw new AppError(400, "VALIDATION_ERROR", "Invalid request body", [{ field: "resourceId", message: `Resource with id=${body.resourceId} does not exist` }]);
  if (!db.users.find(u => u.id === body.userId)) throw new AppError(400, "VALIDATION_ERROR", "Invalid request body", [{ field: "userId", message: `User with id=${body.userId} does not exist` }]);
  if (db.ratings.find(r => r.resourceId === body.resourceId && r.userId === body.userId)) throw new AppError(409, "CONFLICT", "User has already rated this resource");
  const rating = { id: nextId("ratings"), resourceId: body.resourceId, userId: body.userId, value: body.value, createdAt: new Date().toISOString() };
  db.ratings.push(rating);
  return rating;
}
function update(id, body) {
  const rating = getById(id);
  const errors = [];
  if (body.value !== undefined) requireInt(errors, body, "value", { min: 1, max: 5 });
  throwIfErrors(errors);
  if (body.value !== undefined) rating.value = body.value;
  return rating;
}
function remove(id) {
  const idx = db.ratings.findIndex(r => r.id === id);
  if (idx === -1) throw new AppError(404, "NOT_FOUND", `Rating with id=${id} not found`);
  db.ratings.splice(idx, 1);
}
module.exports = { getAll, getById, create, update, remove };
