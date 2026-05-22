const { all, get, run } = require("../db/dbClient");
function escape(s) { return String(s).replace(/'/g, "''"); }
async function getAllResources({ sort="id", order="desc", category, authorId, limit=50 }={}) {
  const col = ["id","title","category","createdAt"].includes(sort) ? sort : "id";
  const dir = order==="asc" ? "ASC" : "DESC";
  const lim = Number.isFinite(Number(limit)) ? Number(limit) : 50;
  const cond = [];
  if (category) cond.push(`r.category="${escape(category)}"`);
  if (authorId) cond.push(`r.authorId=${Number(authorId)}`);
  const where = cond.length ? "WHERE "+cond.join(" AND ") : "";
  return await all(`SELECT r.id,r.title,r.url,r.category,r.description,r.authorId,u.name AS authorName,r.createdAt FROM Resources r JOIN Users u ON u.id=r.authorId ${where} ORDER BY r.${col} ${dir} LIMIT ${lim};`);
}
async function getResourceById(id) { return await get(`SELECT r.id,r.title,r.url,r.category,r.description,r.authorId,u.name AS authorName,r.createdAt FROM Resources r JOIN Users u ON u.id=r.authorId WHERE r.id=${Number(id)};`); }
async function createResource(title,url,category,description,authorId) {
  const now=new Date().toISOString();
  const r=await run(`INSERT INTO Resources (title,url,category,description,authorId,createdAt) VALUES ("${escape(title)}","${escape(url)}","${escape(category)}","${escape(description)}",${Number(authorId)},"${now}");`);
  return await getResourceById(r.lastID);
}
async function updateResource(id,{title,url,category,description}) {
  const res=await getResourceById(id); if (!res) return null;
  const t=title!==undefined?escape(title):escape(res.title);
  const u=url!==undefined?escape(url):escape(res.url);
  const c=category!==undefined?escape(category):escape(res.category);
  const d=description!==undefined?escape(description):escape(res.description);
  const r=await run(`UPDATE Resources SET title="${t}",url="${u}",category="${c}",description="${d}" WHERE id=${Number(id)};`);
  if (r.changes===0) return null;
  return await getResourceById(id);
}
async function deleteResource(id) { const r=await run(`DELETE FROM Resources WHERE id=${Number(id)};`); return r.changes>0; }
async function getAvgRatingByCategory() { return await all(`SELECT r.category, COUNT(rt.id) AS totalRatings, ROUND(AVG(rt.value),2) AS avgRating FROM Resources r LEFT JOIN Ratings rt ON rt.resourceId=r.id GROUP BY r.category ORDER BY avgRating DESC;`); }
module.exports = { getAllResources, getResourceById, createResource, updateResource, deleteResource, getAvgRatingByCategory };
