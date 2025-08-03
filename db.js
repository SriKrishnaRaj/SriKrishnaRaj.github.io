const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./votes.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(candidate_id) REFERENCES candidates(id)
    )
  `);

  db.get(`SELECT COUNT(*) AS count FROM candidates`, (err, row) => {
    if (err) return console.error(err);
    if (row.count === 0) {
      const stmt = db.prepare(`INSERT INTO candidates (name) VALUES (?)`);
      ['Alice', 'Bob', 'Carol', 'Dave'].forEach(name => stmt.run(name));
      stmt.finalize();
      console.log('Inserted sample candidates');
    }
  });
});

module.exports = db;
