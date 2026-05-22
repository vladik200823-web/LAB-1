const { all, get, run } = require("../db/dbClient");
function escape(s) { return String(s).replace(/'/g, "''"); }
async function getAllUsers({ sort="id", order="desc", role }={}) {
  const col = ["id","name","email","createdAt"].includes(sort) ? sort : "id";
  const dir = order==="asc" ? "ASC" : "DESC";
  const where = role ? `WHERE role="${escape(role)}"` : "";
  return await all(`SELECT id,name,email,role,createdAt FROM Users ${where} ORDER BY ${col} ${dir};`);
}
async function getUserById(id) { return await get(`SELECT id,name,email,role,createdAt FROM Users WHERE id=${Number(id)};`); }
async function createUser(name,email,role) {
  const now = new Date().toISOString();
  const r = await run(`INSERT INTO Users (name,email,role,createdAt) VALUES ("${escape(name)}","${escape(email)}","${escape(role)}","${now}");`);
  return await getUserById(r.lastID);
}
async function updateUser(id,{name,email,role}) {
  const u = await getUserById(id); if (!u) return null;
  const n=name!==undefined?escape(name):escape(u.name);
  const e=email!==undefined?escape(email):escape(u.email);
  const r=role!==undefined?escape(role):escape(u.role);
  const res = await run(`UPDATE Users SET name="${n}",email="${e}",role="${r}" WHERE id=${Number(id)};`);
  if (res.changes===0) return null;
  return await getUserById(id);
}
async function deleteUser(id) { const r=await run(`DELETE FROM Users WHERE id=${Number(id)};`); return r.changes>0; }
module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
