const { db } = require("../db/db");
function demoAuth(req, res, next) {
  const userId = req.headers["x-demo-userid"];
  if (!userId) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Заголовок X-Demo-UserId відсутній" } });
  }
  const id = parseInt(userId, 10);
  if (!Number.isFinite(id) || id < 1) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "X-Demo-UserId має бути додатнім числом" } });
  }
  db.get("SELECT id, name, email FROM Users WHERE id = ?", [id], (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: `Користувача з id=${id} не існує` } });
    }
    req.user = user;
    next();
  });
}
module.exports = { demoAuth };
