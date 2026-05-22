// src/db/initDb.js
const { run } = require("./dbClient");

async function initDb() {
  // Вмикаємо підтримку зовнішніх ключів (у SQLite вимкнено за замовчуванням)
  await run("PRAGMA foreign_keys = ON;");

  // 1. Users — батьківська таблиця
  await run(`
    CREATE TABLE IF NOT EXISTS Users (
      id        INTEGER PRIMARY KEY,
      name      TEXT    NOT NULL,
      email     TEXT    NOT NULL UNIQUE,
      role      TEXT    NOT NULL DEFAULT 'user'
                        CHECK (role IN ('admin', 'user', 'moderator')),
      createdAt TEXT    NOT NULL
    );
  `);

  // 2. Resources — основна доменна сутність (залежить від Users)
  await run(`
    CREATE TABLE IF NOT EXISTS Resources (
      id          INTEGER PRIMARY KEY,
      title       TEXT    NOT NULL,
      url         TEXT    NOT NULL UNIQUE,
      category    TEXT    NOT NULL
                          CHECK (category IN (
                            'programming','math','design',
                            'languages','science','business','other'
                          )),
      description TEXT    NOT NULL,
      authorId    INTEGER NOT NULL,
      createdAt   TEXT    NOT NULL,
      FOREIGN KEY (authorId) REFERENCES Users(id) ON DELETE CASCADE
    );
  `);

  // 3. Ratings — залежить від Users та Resources
  await run(`
    CREATE TABLE IF NOT EXISTS Ratings (
      id         INTEGER PRIMARY KEY,
      resourceId INTEGER NOT NULL,
      userId     INTEGER NOT NULL,
      value      INTEGER NOT NULL CHECK (value >= 1 AND value <= 5),
      createdAt  TEXT    NOT NULL,
      UNIQUE (resourceId, userId),
      FOREIGN KEY (resourceId) REFERENCES Resources(id) ON DELETE CASCADE,
      FOREIGN KEY (userId)     REFERENCES Users(id)     ON DELETE CASCADE
    );
  `);

  // 4. Comments — залежить від Users та Resources
  await run(`
    CREATE TABLE IF NOT EXISTS Comments (
      id         INTEGER PRIMARY KEY,
      resourceId INTEGER NOT NULL,
      userId     INTEGER NOT NULL,
      text       TEXT    NOT NULL,
      createdAt  TEXT    NOT NULL,
      FOREIGN KEY (resourceId) REFERENCES Resources(id) ON DELETE CASCADE,
      FOREIGN KEY (userId)     REFERENCES Users(id)     ON DELETE CASCADE
    );
  `);

  console.log("DB schema initialized");
}

module.exports = { initDb };
