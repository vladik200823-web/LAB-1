const { all, get, run } = require("../db/dbClient");
function escape(s) { return String(s).replace(/'/g, "''"); }
async function getAllComments({ resourceId, userId, sort="id", order="desc", limit=50 }={}) {
  const col = ["id","createdAt"].includes(sort) ? sort : "id";
  const dir = order==="asc" ? "ASC" : "DESC";
  const lim = Number.isFinite(Number(limit)) ? Number(limit) : 50;
  const cond=[];
  if (resourceId) cond.push(`c.resourceId=${Number(resourceId)}`);
  if (userId) cond.push(`c.userId=${Number(userId)}`);
  const where = cond.length ? "WHERE "+cond.join(" AND ") : "";
  return await all(`SELECT c.id,c.resourceId,c.userId,u.name AS userName,c.text,c.createdAt FROM Comments c JOIN Users u ON u.id=c.userId ${where} ORDER BY c.${col} ${dir} LIMIT ${lim};`);
}
async function getCommentById(id) { return await get(`SELECT c.id,c.resourceId,c.userId,u.name AS userName,c.text,c.createdAt FROM Comments c JOIN Users u ON u.id=c.userId WHERE c.id=${Number(id)};`); }
async function createComment(resourceId,userId,text) {
  const now=new Date().toISOString();
  const r=await run(`INSERT INTO Comments (resourceId,userId,text,createdAt) VALUES (${Number(resourceId)},${Number(userId)},"${escape(text)}","${now}");`);
  return await getCommentById(r.lastID);
}
async function updateComment(id,text) {
  const r=await run(`UPDATE Comments SET text="${escape(text)}" WHERE id=${Number(id)};`);
  if (r.changes===0) return null;
  return await getCommentById(id);
}
async function deleteComment(id) { const r=await run(`DELETE FROM Comments WHERE id=${Number(id)};`); return r.changes>0; }
module.exports = { getAllComments, getCommentById, createComment, updateComment, deleteComment };
