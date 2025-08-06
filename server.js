const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// DB init
const db = new sqlite3.Database('./database.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    type TEXT,
    target TEXT,
    paid INTEGER DEFAULT 0,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`);
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Register
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], function (err) {
    if (err) return res.status(400).json({ error: 'Пользователь уже существует' });
    res.json({ success: true, userId: this.lastID });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (row) res.json({ success: true, userId: row.id });
    else res.status(400).json({ error: 'Неверный email или пароль' });
  });
});

// Add service
app.post('/api/add-service', (req, res) => {
  const { userId, type, target } = req.body;
  db.run('INSERT INTO services (userId, type, target) VALUES (?, ?, ?)', [userId, type, target], function (err) {
    if (err) return res.status(500).json({ error: 'Ошибка при добавлении' });
    res.json({ success: true, serviceId: this.lastID });
  });
});

// Get user services
app.get('/api/services/:userId', (req, res) => {
  db.all('SELECT * FROM services WHERE userId = ?', [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Ошибка получения' });
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
});
