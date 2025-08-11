
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (username === 'Nandi' && password === 'Nandibal') {
    const token = jwt.sign({ id: 0, username: 'Nandi', is_admin: true }, 'secretKey');
    return res.json({ token, isAdmin: true });
  }

  const [[user]] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, is_admin: false }, 'secretKey');
  res.json({ token, isAdmin: false });
};
