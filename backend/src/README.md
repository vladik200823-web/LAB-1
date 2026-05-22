# Backend — Каталог навчальних ресурсів (Лаб. 3 — SQLite)

REST API на Node.js + Express + SQLite. Дані зберігаються у файлі `data/app.db`.

---

## Запуск

```bash
cd backend
npm install
npm start
# або з авто-перезапуском:
node --watch src/server.js
```

Сервер стартує на **http://localhost:3000**

При першому запуску автоматично створюється файл `data/app.db` та всі таблиці.

## Заповнення тестовими даними (seed)

```bash
npm run seed
```

Додає: 3 користувачі, 4 ресурси, 4 рейтинги, 4 коментарі.

---

## Схема БД

### Таблиці та зв'язки

```
Users
  id INTEGER PRIMARY KEY
  name TEXT NOT NULL
  email TEXT NOT NULL UNIQUE
  role TEXT NOT NULL CHECK (role IN ('admin','user','moderator'))
  createdAt TEXT NOT NULL

Resources
  id INTEGER PRIMARY KEY
  title TEXT NOT NULL
  url TEXT NOT NULL UNIQUE
  category TEXT NOT NULL CHECK (category IN (...))
  description TEXT NOT NULL
  authorId INTEGER NOT NULL → Users(id) ON DELETE CASCADE
  createdAt TEXT NOT NULL

Ratings
  id INTEGER PRIMARY KEY
  resourceId INTEGER NOT NULL → Resources(id) ON DELETE CASCADE
  userId INTEGER NOT NULL → Users(id) ON DELETE CASCADE
  value INTEGER NOT NULL CHECK (value >= 1 AND value <= 5)
  createdAt TEXT NOT NULL
  UNIQUE (resourceId, userId)

Comments
  id INTEGER PRIMARY KEY
  resourceId INTEGER NOT NULL → Resources(id) ON DELETE CASCADE
  userId INTEGER NOT NULL → Users(id) ON DELETE CASCADE
  text TEXT NOT NULL
  createdAt TEXT NOT NULL
```

### Зв'язки
- `Users` → `Resources` (1:N) — один автор, багато ресурсів
- `Resources` → `Ratings` (1:N) — один ресурс, багато рейтингів
- `Resources` → `Comments` (1:N) — один ресурс, багато коментарів
- `Users` → `Ratings` (1:N) — один юзер, багато рейтингів
- `Users` → `Comments` (1:N) — один юзер, багато коментарів

### Обмеження цілісності
- `NOT NULL` — всі обов'язкові поля
- `UNIQUE` — `Users.email`, `Resources.url`, `(Ratings.resourceId, Ratings.userId)`
- `CHECK` — `Users.role`, `Resources.category`, `Ratings.value (1–5)`
- `FOREIGN KEY` з `ON DELETE CASCADE` — при видаленні ресурсу видаляються його рейтинги та коментарі

---

## API Endpoints

### Users
| Метод | URL | Опис |
|-------|-----|------|
| GET | /api/users | Список (фільтр: ?role=admin, сортування: ?sort=name&order=asc) |
| GET | /api/users/:id | Один за id |
| POST | /api/users | Створити |
| PUT | /api/users/:id | Оновити |
| DELETE | /api/users/:id | Видалити |

### Resources
| Метод | URL | Опис |
|-------|-----|------|
| GET | /api/resources | Список (фільтр: ?category=programming&authorId=1&limit=10) |
| GET | /api/resources/stats | Середній рейтинг по категоріях (агрегація) |
| GET | /api/resources/:id | Один за id (з ім'ям автора — JOIN) |
| POST | /api/resources | Створити |
| PUT | /api/resources/:id | Оновити |
| DELETE | /api/resources/:id | Видалити |

### Ratings
| Метод | URL | Опис |
|-------|-----|------|
| GET | /api/ratings | Список (фільтр: ?resourceId=1&userId=2) |
| GET | /api/ratings/:id | Один за id |
| POST | /api/ratings | Створити |
| PUT | /api/ratings/:id | Оновити |
| DELETE | /api/ratings/:id | Видалити |

### Comments
| Метод | URL | Опис |
|-------|-----|------|
| GET | /api/comments | Список (фільтр: ?resourceId=1&limit=5&sort=createdAt&order=asc) |
| GET | /api/comments/:id | Один за id |
| POST | /api/comments | Створити |
| PUT | /api/comments/:id | Оновити |
| DELETE | /api/comments/:id | Видалити |

---

## Приклади запитів (curl)

```bash
# Отримати всіх користувачів
curl http://localhost:3000/api/users

# Фільтрація + сортування
curl "http://localhost:3000/api/resources?category=programming&sort=title&order=asc&limit=5"

# Запит з WHERE + ORDER + LIMIT
curl "http://localhost:3000/api/comments?resourceId=1&sort=createdAt&order=desc&limit=3"

# Агрегація: середній рейтинг по категоріях
curl http://localhost:3000/api/resources/stats

# Створити користувача
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Ivan Franko","email":"ivan@example.com","role":"user"}'

# Помилка валідації (400)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Ivan"}'

# Конфлікт унікальності (409)
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"olena@example.com","role":"user"}'

# 404
curl http://localhost:3000/api/users/999
```
