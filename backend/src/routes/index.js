const u = require("../controllers/user.controller");
const r = require("../controllers/resource.controller");
const rt = require("../controllers/rating.controller");
const c = require("../controllers/comment.controller");
const wrap = fn => (req,res,next) => { try { fn(req,res,next); } catch(err) { next(err); } };
function registerRoutes(app) {
  app.get("/api/users",wrap(u.getAll)); app.get("/api/users/:id",wrap(u.getById)); app.post("/api/users",wrap(u.create)); app.put("/api/users/:id",wrap(u.update)); app.delete("/api/users/:id",wrap(u.remove));
  app.get("/api/resources",wrap(r.getAll)); app.get("/api/resources/:id",wrap(r.getById)); app.post("/api/resources",wrap(r.create)); app.put("/api/resources/:id",wrap(r.update)); app.delete("/api/resources/:id",wrap(r.remove));
  app.get("/api/ratings",wrap(rt.getAll)); app.get("/api/ratings/:id",wrap(rt.getById)); app.post("/api/ratings",wrap(rt.create)); app.put("/api/ratings/:id",wrap(rt.update)); app.delete("/api/ratings/:id",wrap(rt.remove));
  app.get("/api/comments",wrap(c.getAll)); app.get("/api/comments/:id",wrap(c.getById)); app.post("/api/comments",wrap(c.create)); app.put("/api/comments/:id",wrap(c.update)); app.delete("/api/comments/:id",wrap(c.remove));
  app.use((req,res) => res.status(404).json({ error: { code:"NOT_FOUND", message:`Route ${req.method} ${req.url} not found`, details:[] } }));
}
module.exports = registerRoutes;
