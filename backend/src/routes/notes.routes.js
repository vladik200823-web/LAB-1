const express = require("express");
const { db } = require("../db/db");
const { demoAuth } = require("../middleware/demoAuth");
const { checkOwner } = require("../middleware/checkOwner");
const router = express.Router();

router.get("/", demoAuth, (req, res, next) => {
  const search = req.query.search ?? "";
  db.all(`SELECT id, ownerUserId, title, content, createdAt FROM Notes WHERE ownerUserId = ? AND (title LIKE ? OR content LIKE ?) ORDER BY id DESC`, [req.user.id, `%${search}%`, `%${search}%`], (err, rows) => {
    if (err) return next(err);
    res.json({ data: rows, meta: { count: rows.length } });
  });
});

router.get("/:id", demoAuth, checkOwner("Notes"), (req, res, next) => {
  db.get("SELECT id, ownerUserId, title, content, createdAt FROM Notes WHERE id = ?", [parseInt(req.params.id, 10)], (err, row) => {
    if (err) return next(err);
    res.json({ data: row });
  });
});

router.post("/", demoAuth, (req, res, next) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "title і content обовязкові" } });
  const now = new Date().toISOString();
  db.run("INSERT INTO Notes (ownerUserId, title, content, createdAt) VALUES (?, ?, ?, ?)", [req.user.id, title.trim(), content.trim(), now], function(err) {
    if (err) return next(err);
    db.get("SELECT * FROM Notes WHERE id = ?", [this.lastID], (err2, row) => {
      if (err2) return next(err2);
      res.status(201).json({ data: row });
    });
  });
});

router.put("/:id", demoAuth, checkOwner("Notes"), (req, res, next) => {
  const { title, content } = req.body;
  const id = parseInt(req.params.id, 10);
  db.get("SELECT * FROM Notes WHERE id = ?", [id], (err, note) => {
    if (err) return next(err);
    db.run("UPDATE Notes SET title = ?, content = ? WHERE id = ?", [title ?? note.title, content ?? note.content, id], (err2) => {
      if (err2) return next(err2);
      db.get("SELECT * FROM Notes WHERE id = ?", [id], (err3, updated) => {
        if (err3) return next(err3);
        res.json({ data: updated });
      });
    });
  });
});

router.delete("/:id", demoAuth, checkOwner("Notes"), (req, res, next) => {
  db.run("DELETE FROM Notes WHERE id = ?", [parseInt(req.params.id, 10)], (err) => {
    if (err) return next(err);
    res.status(204).send();
  });
});

module.exports = router;
