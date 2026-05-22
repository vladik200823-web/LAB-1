function errorHandler(err, req, res, next) {
  const msg = String(err && err.message ? err.message : err);
  if (msg.includes("UNIQUE constraint failed")) return res.status(409).json({ error: "Unique constraint violation" });
  if (msg.includes("NOT NULL constraint failed") || msg.includes("CHECK constraint failed")) return res.status(400).json({ error: "Invalid data" });
  if (msg.includes("FOREIGN KEY constraint failed")) return res.status(400).json({ error: "Referenced record does not exist" });
  console.error("[ERROR]", err);
  res.status(500).json({ error: "Internal Server Error" });
}
module.exports = { errorHandler };
