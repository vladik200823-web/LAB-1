// src/server.js
// Точка входу. Підіймає HTTP-сервер на чистому Node.js (без express).
// Реалізує мінімальний "мікро-фреймворк": парсинг JSON, routing, middleware.

const http = require('http');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const registerRoutes = require('./routes/index');

const PORT = process.env.PORT || 3000;

// ── Мінімальний app-об'єкт (імітує express-стиль без залежностей) ──────────

function createApp() {
  const routes = []; // { method, path, handler }
  const middlewares = [];

  // Реєструємо middleware (для use без path)
  function use(fn) {
    middlewares.push(fn);
  }

  // Реєструємо маршрут
  function addRoute(method, path, handler) {
    routes.push({ method: method.toUpperCase(), path, handler });
  }

  const app = {
    use,
    get:    (p, h) => addRoute('GET', p, h),
    post:   (p, h) => addRoute('POST', p, h),
    put:    (p, h) => addRoute('PUT', p, h),
    delete: (p, h) => addRoute('DELETE', p, h),
  };

  // Матчінг маршруту з витяганням :params
  function matchRoute(method, url) {
    const [pathname] = url.split('?');
    for (const route of routes) {
      if (route.method !== method) continue;
      const routeParts = route.path.split('/');
      const urlParts   = pathname.split('/');
      if (routeParts.length !== urlParts.length) continue;

      const params = {};
      let matched = true;
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          params[routeParts[i].slice(1)] = decodeURIComponent(urlParts[i]);
        } else if (routeParts[i] !== urlParts[i]) {
          matched = false;
          break;
        }
      }
      if (matched) return { handler: route.handler, params };
    }
    return null;
  }

  // Допоміжні методи відповіді (імітація express res)
  function buildRes(nodeRes) {
    nodeRes.json = (data) => {
      nodeRes.setHeader('Content-Type', 'application/json');
      nodeRes.end(JSON.stringify(data));
    };
    nodeRes.status = (code) => {
      nodeRes.statusCode = code;
      return nodeRes;
    };
    return nodeRes;
  }

  // Головний обробник запитів
  function handleRequest(req, res) {
    buildRes(res);

    // Читаємо тіло запиту
    let rawBody = '';
    req.on('data', chunk => { rawBody += chunk.toString(); });
    req.on('end', () => {
      // Парсимо JSON body
      if (rawBody) {
        try {
          req.body = JSON.parse(rawBody);
        } catch {
          res.status(400).json({
            error: {
              code: 'PARSE_ERROR',
              message: 'Request body is not valid JSON',
              details: [],
            },
          });
          return;
        }
      } else {
        req.body = {};
      }

      // Запускаємо middleware-ланцюжок
      let mwIndex = 0;
      const nextMw = () => {
        if (mwIndex < middlewares.length) {
          middlewares[mwIndex++](req, res, nextMw);
        } else {
          dispatchRoute();
        }
      };

      function dispatchRoute() {
        const match = matchRoute(req.method, req.url);

        if (!match) {
          // 404-handler (останній в routes/index.js)
          const catchAll = routes.find(r => r.method === 'USE');
          if (catchAll) {
            catchAll.handler(req, res, () => {});
          } else {
            res.status(404).json({
              error: {
                code: 'NOT_FOUND',
                message: `Route ${req.method} ${req.url} not found`,
                details: [],
              },
            });
          }
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
      }

      nextMw();
    });
  }

  return { app, handleRequest };
}

// ── Ініціалізація ─────────────────────────────────────────────────────────

const { app, handleRequest } = createApp();

// Підключаємо logger як middleware
app.use(logger);

// Реєструємо всі маршрути
registerRoutes(app);

// Стартуємо сервер
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`\n🚀 Сервер запущено: http://localhost:${PORT}`);
  console.log(`   Маршрути:`);
  console.log(`   GET/POST   /api/users`);
  console.log(`   GET/PUT/DELETE /api/users/:id`);
  console.log(`   GET/POST   /api/resources`);
  console.log(`   GET/PUT/DELETE /api/resources/:id`);
  console.log(`   GET/POST   /api/ratings`);
  console.log(`   GET/PUT/DELETE /api/ratings/:id`);
  console.log(`   GET/POST   /api/comments`);
  console.log(`   GET/PUT/DELETE /api/comments/:id\n`);
});
