function errorHandler(err, req, res, next) {
  const msg = String(err && err.message ? err.message : err);
  if (msg.includes("UNIQUE constraint failed")) {
    return res.status(409).json({ error: { code: "CONFLICT", message: "Запис вже існує" } });
  }
  if (msg.includes("NOT NULL constraint failed") || msg.includes("CHECK constraint failed")) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Невірні дані" } });
  }
  if (msg.includes("FOREIGN KEY constraint failed")) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Пов язаний запис не існує" } });
  }
  console.error("[ERROR]", err);
  const isDev = process.env.NODE_ENV !== "production";
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal Server Error",
      details: isDev ? String(err.message ?? err) : undefined,
    }
  });
}
module.exports = { errorHandler };
