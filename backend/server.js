const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const db = new sqlite3.Database('./inventory.db');

app.use(cors());
app.use(express.json());

const SECRET_KEY = 'udg_virtual_2025'; 

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    quantity INTEGER,
    characteristics TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) return res.status(400).json({ error: 'Usuario ya existe' });
        res.json({ message: 'Usuario registrado con éxito' });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    });
});

const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'Acceso denegado' });
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.user = decoded;
        next();
    });
};

app.get('/inventory', authenticate, (req, res) => {
    db.all('SELECT * FROM inventory', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/inventory', authenticate, (req, res) => {
    const { name, quantity, characteristics } = req.body;
    db.run('INSERT INTO inventory (name, quantity, characteristics) VALUES (?, ?, ?)', [name, quantity, characteristics], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        db.run('INSERT INTO logs (action, details) VALUES (?, ?)', ['Add', `Added ${name}`]);
        res.json({ id: this.lastID, name, quantity, characteristics });
    });
});

app.delete('/inventory/:id', authenticate, (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM inventory WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        db.run('INSERT INTO logs (action, details) VALUES (?, ?)', ['Delete', `Deleted item ${id}`]);
        res.json({ message: 'Item eliminado' });
    });
});

app.get('/logs', authenticate, (req, res) => {
    db.all('SELECT * FROM logs', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.listen(3000, () => console.log('Servidor corriendo en puerto 3000'));
