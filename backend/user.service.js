// src/services/user.service.js
// Вся логіка роботи з сутністю User.
// Контролер лише делегує сюди і форматує відповідь.

const { db, nextId } = require('../db/inMemory');
const AppError = require('../middleware/AppError');
const {
  throwIfErrors,
  requireString,
  requireEmail,
  requireEnum,
  ALLOWED_ROLES,
} = require('../middleware/validate');

function getAll() {
  return db.users;
}

function getById(id) {
  const user = db.users.find(u => u.id === id);
  if (!user) throw new AppError(404, 'NOT_FOUND', `User with id=${id} not found`);
  return user;
}

// CreateUserRequestDto validation
function validateCreate(body) {
  const errors = [];
  requireString(errors, body, 'name', { min: 2, max: 100 });
  requireEmail(errors, body, 'email');
  requireEnum(errors, body, 'role', ALLOWED_ROLES);
  throwIfErrors(errors);
}

function create(body) {
  validateCreate(body);

  // Перевірка унікальності email
  const exists = db.users.find(u => u.email === body.email);
  if (exists) {
    throw new AppError(409, 'CONFLICT', `Email "${body.email}" is already taken`);
  }

  const user = {
    id: nextId('users'),
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    role: body.role,
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  return user;
}

// UpdateUserRequestDto validation
function validateUpdate(body) {
  const errors = [];
  if (body.name !== undefined) requireString(errors, body, 'name', { min: 2, max: 100 });
  if (body.email !== undefined) requireEmail(errors, body, 'email');
  if (body.role !== undefined) requireEnum(errors, body, 'role', ALLOWED_ROLES);
  throwIfErrors(errors);
}

function update(id, body) {
  const user = getById(id); // кидає 404 якщо немає
  validateUpdate(body);

  // Перевірка унікальності нового email
  if (body.email && body.email !== user.email) {
    const exists = db.users.find(u => u.email === body.email && u.id !== id);
    if (exists) {
      throw new AppError(409, 'CONFLICT', `Email "${body.email}" is already taken`);
    }
  }

  if (body.name !== undefined) user.name = body.name.trim();
  if (body.email !== undefined) user.email = body.email.trim().toLowerCase();
  if (body.role !== undefined) user.role = body.role;

  return user;
}

function remove(id) {
  const idx = db.users.findIndex(u => u.id === id);
  if (idx === -1) throw new AppError(404, 'NOT_FOUND', `User with id=${id} not found`);
  db.users.splice(idx, 1);
}

module.exports = { getAll, getById, create, update, remove };
