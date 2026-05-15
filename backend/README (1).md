# Backend — Каталог навчальних ресурсів (Лаб. 2)

REST API на чистому Node.js (без фреймворків). Дані зберігаються в пам'яті.

---

## Запуск

```bash
cd backend
node src/server.js
# або з авто-перезапуском (Node 18+):
node --watch src/server.js
```

Сервер стартує на **http://localhost:3000**

---

## Структура проєкту

```
backend/
├── src/
│   ├── server.js              # Точка входу, HTTP-сервер
│   ├── db/
│   │   └── inMemory.js        # In-memory "БД" з seed-даними
│   ├── routes/
│   │   └── index.js           # Реєстрація всіх маршрутів
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── resource.controller.js
│   │   ├── rating.controller.js
│   │   └── comment.controller.js
│   ├── services/
│   │   ├── user.service.js
│   │   ├── resource.service.js
│   │   ├── rating.service.js
│   │   └── comment.service.js
│   ├── dto/
│   │   ├── user.dto.js
│   │   ├── resource.dto.js
│   │   ├── rating.dto.js
│   │   └── comment.dto.js
│   └── middleware/
│       ├── AppError.js        # Базовий клас помилок
│       ├── logger.js          # Логування запитів
│       ├── errorHandler.js    # Централізований error handler
│       └── validate.js        # Допоміжні функції валідації
└── package.json
```

---

## API Endpoints

### Users

| Метод  | URL               | Опис               | Статус |
|--------|-------------------|--------------------|--------|
| GET    | /api/users        | Список всіх        | 200    |
| GET    | /api/users/:id    | Один за id         | 200/404|
| POST   | /api/users        | Створити           | 201    |
| PUT    | /api/users/:id    | Оновити            | 200/404|
| DELETE | /api/users/:id    | Видалити           | 204/404|

**POST /api/users** — тіло:
```json
{ "name": "Іван Франко", "email": "ivan@example.com", "role": "user" }
```
`role`: `admin` | `user` | `moderator`

---

### Resources

| Метод  | URL                  | Опис    | Статус |
|--------|----------------------|---------|--------|
| GET    | /api/resources       | Список  | 200    |
| GET    | /api/resources/:id   | Один    | 200/404|
| POST   | /api/resources       | Створити| 201    |
| PUT    | /api/resources/:id   | Оновити | 200/404|
| DELETE | /api/resources/:id   | Видалити| 204/404|

**POST /api/resources** — тіло:
```json
{
  "title": "MDN Web Docs",
  "url": "https://developer.mozilla.org",
  "category": "programming",
  "description": "Документація для веб-розробників",
  "authorId": 1
}
```
`category`: `programming` | `math` | `design` | `languages` | `science` | `business` | `other`

---

### Ratings

**POST /api/ratings** — тіло:
```json
{ "resourceId": 1, "userId": 2, "value": 5 }
```
`value`: ціле число від 1 до 5. Один юзер — один рейтинг на ресурс.

---

### Comments

**POST /api/comments** — тіло:
```json
{ "resourceId": 1, "userId": 2, "text": "Чудовий курс!" }
```

---

## Формат помилок

Всі помилки мають єдиний формат:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      { "field": "email", "message": "\"email\" must be a valid email" }
    ]
  }
}
```

Коди помилок: `VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `INVALID_PARAM`, `PARSE_ERROR`, `INTERNAL_ERROR`

---

## Логування

Кожен запит виводить у консоль:
```
[2024-03-01T10:00:00.000Z] POST /api/users → 201 (3ms)
[2024-03-01T10:00:01.000Z] GET /api/users/999 → 404 (1ms)
```

---

## Швидке тестування (curl)

```bash
# Отримати всіх юзерів
curl http://localhost:3000/api/users

# Створити юзера
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Тарас","email":"taras@test.com","role":"user"}'

# Отримати ресурс за id
curl http://localhost:3000/api/resources/1

# Видалити коментар
curl -X DELETE http://localhost:3000/api/comments/1

# Тест 404
curl http://localhost:3000/api/users/999

# Тест валідації
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"X","email":"bad","role":"god"}'
```
