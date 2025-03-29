const express = require('express');
const router = express.Router();
const db = require('../models/db');
const authenticate = require('../middlewares/authMiddleware');

router.get('/', authenticate, (req, res) => {
    db.all('SELECT * FROM inventory', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/', authenticate, (req, res) => {
    const { name, quantity, characteristics } = req.body;
    db.run('INSERT INTO inventory (name, quantity, characteristics) VALUES (?, ?, ?)', 
        [name, quantity, characteristics], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, quantity, characteristics });
    });
});

router.delete('/:id', authenticate, (req, res) => {
    db.run('DELETE FROM inventory WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Item eliminado' });
    });
});

module.exports = router;
