// src/repositories/resourcesRepo.js
const { all, get, run } = require("../db/dbClient");

function escape(s) {
  return String(s).replace(/'/g, "''");
}

async function getAllResources({ sort = "id", order = "desc", category, authorId, limit = 50 } = {}) {
  const allowedSort = ["id", "title", "category", "createdAt"];
  const col = allowedSort.includes(sort) ? sort : "id";
  const dir = order === "asc" ? "ASC" : "DESC";
  const lim = Number.isFinite(Number(limit)) ? Number(limit) : 50;

  const conditions = [];
  if (category) conditions.push(`r.category = '${escape(category)}'`);
  if (authorId)  conditions.push(`r.authorId = ${Number(authorId)}`);
  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  // JOIN з Users — повертаємо ім'я автора
  return await all(`
    SELECT r.id, r.title, r.url, r.category, r.description,
           r.authorId, u.name AS authorName, r.createdAt
    FROM Resources r
    JOIN Users u ON u.id = r.authorId
    ${where}
    ORDER BY r.${col} ${dir}
    LIMIT ${lim};
  `);
}

async function getResourceById(id) {
  return await get(`
    SELECT r.id, r.title, r.url, r.category, r.description,
           r.authorId, u.name AS authorName, r.createdAt
    FROM Resources r
    JOIN Users u ON u.id = r.authorId
    WHERE r.id = ${Number(id)};
  `);
}

async function createResource(title, url, category, description, authorId) {
  const now = new Date().toISOString();
  const result = await run(`
    INSERT INTO Resources (title, url, category, description, authorId, createdAt)
    VALUES (
      '${escape(title)}',
      '${escape(url)}',
      '${escape(category)}',
      '${escape(description)}',
      ${Number(authorId)},
      '${now}'
    );
  `);
  return await getResourceById(result.lastID);
}

async function updateResource(id, { title, url, category, description }) {
  const res = await getResourceById(id);
  if (!res) return null;

  const newTitle       = title       !== undefined ? escape(title)       : escape(res.title);
  const newUrl         = url         !== undefined ? escape(url)         : escape(res.url);
  const newCategory    = category    !== undefined ? escape(category)    : escape(res.category);
  const newDescription = description !== undefined ? escape(description) : escape(res.description);

  const result = await run(`
    UPDATE Resources
    SET title='${newTitle}', url='${newUrl}',
        category='${newCategory}', description='${newDescription}'
    WHERE id = ${Number(id)};
  `);
  if (result.changes === 0) return null;
  return await getResourceById(id);
}

async function deleteResource(id) {
  const result = await run(`DELETE FROM Resources WHERE id = ${Number(id)};`);
  return result.changes > 0;
}

// Агрегація: середній рейтинг по категоріях
async function getAvgRatingByCategory() {
  return await all(`
    SELECT r.category,
           COUNT(rt.id)       AS totalRatings,
           ROUND(AVG(rt.value), 2) AS avgRating
    FROM Resources r
    LEFT JOIN Ratings rt ON rt.resourceId = r.id
    GROUP BY r.category
    ORDER BY avgRating DESC;
  `);
}

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getAvgRatingByCategory,
};
