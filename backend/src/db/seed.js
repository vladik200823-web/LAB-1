const { initDb } = require("./initDb");
const { run } = require("./dbClient");
async function seed() {
  await initDb();
  const now = new Date().toISOString();
  await run(`INSERT OR IGNORE INTO Users (name,email,role,createdAt) VALUES ("Olena Koval","olena@example.com","admin","${now}");`);
  await run(`INSERT OR IGNORE INTO Users (name,email,role,createdAt) VALUES ("Mykhailo Bondar","mykhailo@example.com","user","${now}");`);
  await run(`INSERT OR IGNORE INTO Users (name,email,role,createdAt) VALUES ("Iryna Petrenko","iryna@example.com","moderator","${now}");`);
  await run(`INSERT OR IGNORE INTO Resources (title,url,category,description,authorId,createdAt) VALUES ("CS50 by Harvard","https://cs50.harvard.edu","programming","Best intro CS course",1,"${now}");`);
  await run(`INSERT OR IGNORE INTO Resources (title,url,category,description,authorId,createdAt) VALUES ("The Odin Project","https://www.theodinproject.com","programming","Free web dev curriculum",2,"${now}");`);
  await run(`INSERT OR IGNORE INTO Resources (title,url,category,description,authorId,createdAt) VALUES ("Khan Academy","https://www.khanacademy.org","math","Free math courses",1,"${now}");`);
  await run(`INSERT OR IGNORE INTO Ratings (resourceId,userId,value,createdAt) VALUES (1,2,5,"${now}");`);
  await run(`INSERT OR IGNORE INTO Ratings (resourceId,userId,value,createdAt) VALUES (2,1,4,"${now}");`);
  await run(`INSERT OR IGNORE INTO Comments (resourceId,userId,text,createdAt) VALUES (1,2,"Great course!","${now}");`);
  await run(`INSERT OR IGNORE INTO Comments (resourceId,userId,text,createdAt) VALUES (2,1,"Excellent curriculum.","${now}");`);
  await run(`INSERT OR IGNORE INTO Notes (ownerUserId,title,content,createdAt) VALUES (1,"Нотатка Olena","Секретна нотатка користувача Olena","${now}");`);
  await run(`INSERT OR IGNORE INTO Notes (ownerUserId,title,content,createdAt) VALUES (2,"Нотатка Mykhailo","Приватний запис Mykhailo","${now}");`);
  await run(`INSERT OR IGNORE INTO Notes (ownerUserId,title,content,createdAt) VALUES (1,"Ще одна нотатка Olena","Другий секретний запис","${now}");`);
  console.log("Seed completed");
  process.exit(0);
}
seed().catch((err) => { console.error("Seed error:", err); process.exit(1); });
