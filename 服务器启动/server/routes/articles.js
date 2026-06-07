const { authMiddleware } = require('./auth');
const db = require('../db/db');

const router = require('express').Router();

router.get('/', async (req, res) => {
  const [rows] = await db.query(
    `SELECT a.*, u.username, u.avatar as user_avatar, u.nickname
     FROM articles a JOIN users u ON a.user_id = u.id
     WHERE a.status = 'approved' ORDER BY a.created_at DESC LIMIT 20`
  );
  res.json({ success: true, articles: rows });
});

router.get('/:id', async (req, res) => {
  const [rows] = await db.query(
    `SELECT a.*, u.username, u.avatar as user_avatar, u.nickname
     FROM articles a JOIN users u ON a.user_id = u.id WHERE a.id = ?`,
    [req.params.id]
  );
  if (rows.length === 0) return res.json({ success: false, message: '文章不存在' });
  await db.query('UPDATE articles SET views = views + 1 WHERE id = ?', [req.params.id]);
  res.json({ success: true, article: rows[0] });
});

router.put('/:id/review', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.json({ success: false, message: '无权限' });
  await db.query('UPDATE articles SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
  res.json({ success: true });
});

module.exports = router;
