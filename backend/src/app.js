const express = require("express");
const cors = require("cors");
const { errorHandler } = require("./middlewares/errorHandler");
const usersRoutes = require("./routes/users.routes");
const resourcesRoutes = require("./routes/resources.routes");
const ratingsRoutes = require("./routes/ratings.routes");
const commentsRoutes = require("./routes/comments.routes");

const app = express();

const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS: origin is not allowed"), false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/resources", resourcesRoutes);
app.use("/api/v1/ratings", ratingsRoutes);
app.use("/api/v1/comments", commentsRoutes);

app.use("/api/users", usersRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/ratings", ratingsRoutes);
app.use("/api/comments", commentsRoutes);

app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.url} not found` }));
app.use(errorHandler);

module.exports = { app };
