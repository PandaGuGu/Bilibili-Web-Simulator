const { authMiddleware } = require('./auth');
const db = require('../db/db');

const router = require('express').Router();

// 获取用户列表 (管理后台)
router.get('/', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.json({ success: false, message: '无权限' });
  const { status, search } = req.query;
  let sql = 'SELECT id, username, email, avatar, nickname, status, role, level, coins, created_at FROM users WHERE 1=1';
  const params = [];
  if (status && status !== 'all') { sql += ' AND status = ?'; params.push(status); }
  if (search) { sql += ' AND (username LIKE ? OR nickname LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  sql += ' ORDER BY id ASC';
  const [rows] = await db.query(sql, params);
  res.json({ success: true, users: rows });
});

// 封禁/解封用户
router.put('/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.json({ success: false, message: '无权限' });
  const { status } = req.body;
  await db.query('UPDATE users SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ success: true });
});

module.exports = router;
