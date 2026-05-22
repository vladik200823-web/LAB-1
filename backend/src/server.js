const { app } = require("./app");
const { initDb } = require("./db/initDb");
const PORT = process.env.PORT || 3000;
async function bootstrap() {
  await initDb();
  app.listen(PORT, () => { console.log(`Server is running on http://localhost:${PORT}`); });
}
bootstrap().catch((err) => { console.error("Fatal startup error:", err); process.exit(1); });
