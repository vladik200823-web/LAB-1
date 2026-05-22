const { db } = require("./db");
function all(sql) {
  console.log("[SQL]", sql.trim());
  return new Promise((resolve, reject) => { db.all(sql, (err, rows) => (err ? reject(err) : resolve(rows))); });
}
function get(sql) {
  console.log("[SQL]", sql.trim());
  return new Promise((resolve, reject) => { db.get(sql, (err, row) => (err ? reject(err) : resolve(row))); });
}
function run(sql) {
  console.log("[SQL]", sql.trim());
  return new Promise((resolve, reject) => {
    db.run(sql, function(err) { if (err) return reject(err); resolve({ lastID: this.lastID, changes: this.changes }); });
  });
}
module.exports = { all, get, run };
