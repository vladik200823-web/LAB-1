const { all, get, run } = require("../db/dbClient");
async function getAllRatings({ resourceId, userId, sort="id", order="desc" }={}) {
  const col = ["id","value","createdAt"].includes(sort) ? sort : "id";
  const dir = order==="asc" ? "ASC" : "DESC";
  const cond=[];
  if (resourceId) cond.push(`resourceId=${Number(resourceId)}`);
  if (userId) cond.push(`userId=${Number(userId)}`);
  const where = cond.length ? "WHERE "+cond.join(" AND ") : "";
  return await all(`SELECT id,resourceId,userId,value,createdAt FROM Ratings ${where} ORDER BY ${col} ${dir};`);
}
async function getRatingById(id) { return await get(`SELECT id,resourceId,userId,value,createdAt FROM Ratings WHERE id=${Number(id)};`); }
async function createRating(resourceId,userId,value) {
  const now=new Date().toISOString();
  const r=await run(`INSERT INTO Ratings (resourceId,userId,value,createdAt) VALUES (${Number(resourceId)},${Number(userId)},${Number(value)},"${now}");`);
  return await getRatingById(r.lastID);
}
async function updateRating(id,value) {
  const r=await run(`UPDATE Ratings SET value=${Number(value)} WHERE id=${Number(id)};`);
  if (r.changes===0) return null;
  return await getRatingById(id);
}
async function deleteRating(id) { const r=await run(`DELETE FROM Ratings WHERE id=${Number(id)};`); return r.changes>0; }
module.exports = { getAllRatings, getRatingById, createRating, updateRating, deleteRating };
