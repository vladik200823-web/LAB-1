const { db } = require("../db/db");
function checkOwner(table, idParam = "id") {
  return (req, res, next) => {
    const recordId = parseInt(req.params[idParam], 10);
    if (!Number.isFinite(recordId)) {
      return res.status(400).json({ error: { code: "INVALID_PARAM", message: "id має бути числом" } });
    }
    db.get(`SELECT id, ownerUserId FROM ${table} WHERE id = ?`, [recordId], (err, row) => {
      if (err) return next(err);
      if (!row) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Запис не знайдено" } });
      }
      if (row.ownerUserId !== req.user.id) {
        return res.status(403).json({ error: { code: "FORBIDDEN", message: "Доступ заборонено" } });
      }
      next();
    });
  };
}
module.exports = { checkOwner };
