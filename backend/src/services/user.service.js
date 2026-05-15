const { db, nextId } = require("../db/inMemory");
const AppError = require("../middleware/AppError");
const { throwIfErrors, requireString, requireEmail, requireEnum, ALLOWED_ROLES } = require("../middleware/validate");
function getAll() { return db.users; }
function getById(id) {
  const u = db.users.find(u => u.id === id);
  if (!u) throw new AppError(404, "NOT_FOUND", `User with id=${id} not found`);
  return u;
}
function create(body) {
  const errors = [];
  requireString(errors, body, "name", { min: 2, max: 100 });
  requireEmail(errors, body, "email");
  requireEnum(errors, body, "role", ALLOWED_ROLES);
  throwIfErrors(errors);
  if (db.users.find(u => u.email === body.email)) throw new AppError(409, "CONFLICT", `Email already taken`);
  const user = { id: nextId("users"), name: body.name.trim(), email: body.email.trim().toLowerCase(), role: body.role, createdAt: new Date().toISOString() };
  db.users.push(user);
  return user;
}
function update(id, body) {
  const user = getById(id);
  const errors = [];
  if (body.name !== undefined) requireString(errors, body, "name", { min: 2, max: 100 });
  if (body.email !== undefined) requireEmail(errors, body, "email");
  if (body.role !== undefined) requireEnum(errors, body, "role", ALLOWED_ROLES);
  throwIfErrors(errors);
  if (body.name !== undefined) user.name = body.name.trim();
  if (body.email !== undefined) user.email = body.email.trim().toLowerCase();
  if (body.role !== undefined) user.role = body.role;
  return user;
}
function remove(id) {
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) throw new AppError(404, "NOT_FOUND", `User with id=${id} not found`);
  db.users.splice(idx, 1);
}
module.exports = { getAll, getById, create, update, remove };
