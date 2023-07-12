const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("transport_form.db", err => {
  if (err) return console.log(err.message);
  console.log("Connected to the in-memory SQlite database.");
});

db.read = (query, params) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject("Read error: " + err.message);
      else resolve(row);
    });
  });
};

db.write = query => {
  return new Promise((resolve, reject) => {
    db.run(query, err => {
      if (err) reject(err.message);
      else resolve(true);
    });
  });
};

db.readAll = (query, params) => {
  return new Promise((resolve, reject) => {
    if (params == undefined) params = [];
    db.all(query, params, (err, rows) => {
      if (err) reject(err.message);
      else resolve(rows);
    });
  });
};

module.exports = db;

const sigs = ["SIGINT", "SIGTERM", "SIGQUIT"];
sigs.forEach(sig => {
  process.on(sig, () => {
    db.close();
    console.log("Disconnected to the in-memory SQlite database.");
  });
});
