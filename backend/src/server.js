const http = require("http");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const registerRoutes = require("./routes/index");

const PORT = 3000;
const routes = [];

const app = {
  use: () => {},
  get:    (path, handler) => routes.push({ method: "GET",    path, handler }),
  post:   (path, handler) => routes.push({ method: "POST",   path, handler }),
  put:    (path, handler) => routes.push({ method: "PUT",    path, handler }),
  delete: (path, handler) => routes.push({ method: "DELETE", path, handler }),
};

registerRoutes(app);

function matchRoute(method, url) {
  const [pathname] = url.split("?");
  for (const route of routes) {
    if (route.method !== method) continue;
    const rp = route.path.split("/");
    const up = pathname.split("/");
    if (rp.length !== up.length) continue;
    const params = {};
    let matched = true;
    for (let i = 0; i < rp.length; i++) {
      if (rp[i].startsWith(":")) {
        params[rp[i].slice(1)] = decodeURIComponent(up[i]);
      } else if (rp[i] !== up[i]) {
        matched = false;
        break;
      }
    }
    if (matched) return { handler: route.handler, params };
  }
  return null;
}

const server = http.createServer((req, res) => {
  const start = Date.now();

  res.json = (data) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  };
  res.status = (code) => { res.statusCode = code; return res; };

  let raw = "";
  req.on("data", chunk => { raw += chunk.toString(); });
  req.on("end", () => {
    if (raw) {
      try { req.body = JSON.parse(raw); }
      catch {
        res.statusCode = 400;
        res.json({ error: { code: "PARSE_ERROR", message: "Request body is not valid JSON", details: [] } });
        return;
      }
    } else {
      req.body = {};
    }

    const match = matchRoute(req.method, req.url);

    res.on("finish", () => {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} -> ${res.statusCode} (${Date.now()-start}ms)`);
    });

    if (!match) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.url} not found`, details: [] } });
      return;
    }

    req.params = match.params;

    try {
      match.handler(req, res, (err) => {
        if (err) errorHandler(err, req, res, () => {});
      });
    } catch (err) {
      errorHandler(err, req, res, () => {});
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Routes loaded: ${routes.length}`);
});
