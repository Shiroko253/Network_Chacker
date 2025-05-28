// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const db = new sqlite3.Database('network.db');

app.use(cors());
app.use(express.json());

// 初始化資料表
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS disconnects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    error TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS fluctuations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT,
    latency REAL
  )`);
});

// API - 記錄斷線
app.post('/api/record-disconnect', (req, res) => {
  const { timestamp, error } = req.body;
  db.run('INSERT INTO disconnects (timestamp, error) VALUES (?, ?)', [timestamp, error]);
  res.sendStatus(200);
});

// API - 記錄波動
app.post('/api/record-fluctuation', (req, res) => {
  const { timestamp, latency } = req.body;
  db.run('INSERT INTO fluctuations (timestamp, latency) VALUES (?, ?)', [timestamp, latency]);
  res.sendStatus(200);
});

app.listen(3001, () => console.log('後端伺服器啟動於 http://localhost:3001'));
