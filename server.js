const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Fetch all candidates
app.get('/api/candidates', (req, res) => {
  db.all(`SELECT id, name FROM candidates`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Cast a vote
app.post('/api/vote', (req, res) => {
  const { candidateId } = req.body;
  if (!candidateId) {
    return res.status(400).json({ error: 'candidateId is required' });
  }
  db.run(
    `INSERT INTO votes (candidate_id) VALUES (?)`,
    [candidateId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, voteId: this.lastID });
    }
  );
});

// Get vote results
app.get('/api/results', (req, res) => {
  db.all(
    `SELECT c.id, c.name, COUNT(v.id) AS votes
     FROM candidates c
     LEFT JOIN votes v ON c.id = v.candidate_id
     GROUP BY c.id`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
