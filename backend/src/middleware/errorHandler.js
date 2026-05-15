const AppError = require("./AppError");
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { code: err.code, message: err.message, details: err.details } });
  }
  console.error("[UNHANDLED ERROR]", err);
  return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Internal server error", details: [] } });
}
module.exports = errorHandler;
