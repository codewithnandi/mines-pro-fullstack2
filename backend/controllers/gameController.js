
const db = require('../db');

exports.play = async (req, res) => {
  const { amount, selectedTiles } = req.body;
  const userId = req.user.id;
  const adminId = 0; // Simulated admin ID for balance tracking

  if (selectedTiles.length < 1 || selectedTiles.length > 25) {
    return res.status(400).json({ error: 'Invalid tile selection' });
  }

  try {
    await db.query('START TRANSACTION');

    await db.query('UPDATE users SET balance = balance - ? WHERE id = ?', [amount, userId]);

    const mineTile = Math.floor(Math.random() * 25);
    const win = !selectedTiles.includes(mineTile);
    const winAmount = win ? amount * 2 : 0;

    if (win) {
      await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [winAmount, userId]);
    }

    // Update admin balance accordingly
    const adminBalanceChange = win ? -winAmount + amount : amount;
    await db.query('UPDATE users SET balance = balance + ? WHERE username = ?', [adminBalanceChange, 'Nandi']);

    await db.query('INSERT INTO games (user_id, result, amount_bet, amount_won) VALUES (?, ?, ?, ?)',
      [userId, win ? 'win' : 'loss', amount, winAmount]);

    await db.query('COMMIT');

    res.json({ win, amountWon: winAmount, mineTile });
  } catch (err) {
    await db.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
