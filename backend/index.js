// src/routes/index.js
// Збирає всі роути в одному місці і підключає їх до app.

const userCtrl     = require('../controllers/user.controller');
const resourceCtrl = require('../controllers/resource.controller');
const ratingCtrl   = require('../controllers/rating.controller');
const commentCtrl  = require('../controllers/comment.controller');

// Обгортка для async-контролерів — передає помилки в errorHandler
const wrap = fn => (req, res, next) => {
  try {
    fn(req, res, next);
  } catch (err) {
    next(err);
  }
};

function registerRoutes(app) {
  // ── USERS ──────────────────────────────────────────
  app.get   ('/api/users',     wrap(userCtrl.getAll));
  app.get   ('/api/users/:id', wrap(userCtrl.getById));
  app.post  ('/api/users',     wrap(userCtrl.create));
  app.put   ('/api/users/:id', wrap(userCtrl.update));
  app.delete('/api/users/:id', wrap(userCtrl.remove));

  // ── RESOURCES ──────────────────────────────────────
  app.get   ('/api/resources',     wrap(resourceCtrl.getAll));
  app.get   ('/api/resources/:id', wrap(resourceCtrl.getById));
  app.post  ('/api/resources',     wrap(resourceCtrl.create));
  app.put   ('/api/resources/:id', wrap(resourceCtrl.update));
  app.delete('/api/resources/:id', wrap(resourceCtrl.remove));

  // ── RATINGS ────────────────────────────────────────
  app.get   ('/api/ratings',     wrap(ratingCtrl.getAll));
  app.get   ('/api/ratings/:id', wrap(ratingCtrl.getById));
  app.post  ('/api/ratings',     wrap(ratingCtrl.create));
  app.put   ('/api/ratings/:id', wrap(ratingCtrl.update));
  app.delete('/api/ratings/:id', wrap(ratingCtrl.remove));

  // ── COMMENTS ───────────────────────────────────────
  app.get   ('/api/comments',     wrap(commentCtrl.getAll));
  app.get   ('/api/comments/:id', wrap(commentCtrl.getById));
  app.post  ('/api/comments',     wrap(commentCtrl.create));
  app.put   ('/api/comments/:id', wrap(commentCtrl.update));
  app.delete('/api/comments/:id', wrap(commentCtrl.remove));

  // 404 для невідомих маршрутів
  app.use((req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.url} not found`,
        details: [],
      },
    });
  });
}

module.exports = registerRoutes;
