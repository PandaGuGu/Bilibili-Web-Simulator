const { authMiddleware } = require('./auth');
const db = require('../db/db');

const router = require('express').Router();

// 关注
router.post('/:userId', authMiddleware, async (req, res) => {
  const followingId = Number(req.params.userId);
  if (req.user.id === followingId) return res.json({ success: false, message: '不能关注自己' });
  try {
    await db.query('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [req.user.id, followingId]);
    // 更新计数
    await db.query('UPDATE users SET followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = ?) WHERE id = ?', [followingId, followingId]);
    await db.query('UPDATE users SET following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = ?) WHERE id = ?', [req.user.id, req.user.id]);
    res.json({ success: true, following: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.json({ success: false, message: '已关注' });
    res.json({ success: false, message: '操作失败' });
  }
});

// 取消关注
router.delete('/:userId', authMiddleware, async (req, res) => {
  const followingId = Number(req.params.userId);
  await db.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, followingId]);
  await db.query('UPDATE users SET followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = ?) WHERE id = ?', [followingId, followingId]);
  await db.query('UPDATE users SET following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = ?) WHERE id = ?', [req.user.id, req.user.id]);
  res.json({ success: true, following: false });
});

// 检查关注状态
router.get('/:userId/status', authMiddleware, async (req, res) => {
  const followingId = Number(req.params.userId);
  const [rows] = await db.query('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, followingId]);
  res.json({ success: true, following: rows.length > 0 });
});

module.exports = router;
