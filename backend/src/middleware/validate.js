const AppError = require("./AppError");
const ALLOWED_ROLES = ["admin", "user", "moderator"];
const ALLOWED_CATEGORIES = ["programming", "math", "design", "languages", "science", "business", "other"];
function throwIfErrors(errors) {
  if (errors.length > 0) throw new AppError(400, "VALIDATION_ERROR", "Invalid request body", errors);
}
function requireString(errors, body, field, { min = 1, max = Infinity } = {}) {
  const val = body[field];
  if (val === undefined || val === null || val === "") { errors.push({ field, message: `"${field}" is required` }); return; }
  if (typeof val !== "string") { errors.push({ field, message: `"${field}" must be a string` }); return; }
  if (val.trim().length < min) errors.push({ field, message: `"${field}" must be at least ${min} characters` });
  if (val.trim().length > max) errors.push({ field, message: `"${field}" must be at most ${max} characters` });
}
function requireEmail(errors, body, field) {
  requireString(errors, body, field);
  if (errors.some(e => e.field === field)) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body[field])) errors.push({ field, message: `"${field}" must be a valid email` });
}
function requireInt(errors, body, field, { min = -Infinity, max = Infinity } = {}) {
  const val = body[field];
  if (val === undefined || val === null) { errors.push({ field, message: `"${field}" is required` }); return; }
  if (!Number.isInteger(val)) { errors.push({ field, message: `"${field}" must be an integer` }); return; }
  if (val < min || val > max) errors.push({ field, message: `"${field}" must be between ${min} and ${max}` });
}
function requireEnum(errors, body, field, allowed) {
  requireString(errors, body, field);
  if (errors.some(e => e.field === field)) return;
  if (!allowed.includes(body[field])) errors.push({ field, message: `"${field}" must be one of: ${allowed.join(", ")}` });
}
function requireUrl(errors, body, field) {
  requireString(errors, body, field, { min: 5, max: 500 });
  if (errors.some(e => e.field === field)) return;
  try { const u = new URL(body[field]); if (!["http:", "https:"].includes(u.protocol)) throw new Error(); }
  catch { errors.push({ field, message: `"${field}" must be a valid http/https URL` }); }
}
module.exports = { throwIfErrors, requireString, requireEmail, requireInt, requireEnum, requireUrl, ALLOWED_ROLES, ALLOWED_CATEGORIES };
