// src/middleware/errorHandler.js
// Централізований обробник помилок.
// Ловить як AppError (очікувані), так і будь-які інші (неочікувані 500).

const AppError = require('./AppError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Очікувана помилка (ми самі її кинули)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Неочікувана помилка — логуємо стек, повертаємо 500
  console.error('[UNHANDLED ERROR]', err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      details: [],
    },
  });
}

module.exports = errorHandler;
