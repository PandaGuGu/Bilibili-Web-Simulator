const { authMiddleware } = require('./auth');
const db = require('../db/db');
const router = require('express').Router();

// 超级管理员权限检查
function superAdminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.json({ success: false, message: '需要超级管理员权限' });
  }
  next();
}

// 获取所有表数据概览
router.get('/overview', authMiddleware, superAdminOnly, async (req, res) => {
  const [users] = await db.query('SELECT COUNT(*) as count FROM users');
  const [videos] = await db.query('SELECT COUNT(*) as count FROM videos');
  const [articles] = await db.query('SELECT COUNT(*) as count FROM articles');
  const [comments] = await db.query('SELECT COUNT(*) as count FROM comments');
  const [follows] = await db.query('SELECT COUNT(*) as count FROM follows');
  const [messages] = await db.query('SELECT COUNT(*) as count FROM private_messages');
  const [live_rooms] = await db.query('SELECT COUNT(*) as count FROM live_rooms');
  res.json({ success: true, counts: { users: users[0].count, videos: videos[0].count, articles: articles[0].count, comments: comments[0].count, follows: follows[0].count, messages: messages[0].count, live_rooms: live_rooms[0].count } });
});

// 获取所有用户
router.get('/users', authMiddleware, superAdminOnly, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM users ORDER BY id');
  res.json({ success: true, data: rows });
});

// 更新用户
router.put('/users/:id', authMiddleware, superAdminOnly, async (req, res) => {
  const { id } = req.params;
  const { nickname, signature, role, status, level, coins } = req.body;
  await db.query('UPDATE users SET nickname=?, signature=?, role=?, status=?, level=?, coins=? WHERE id=?',
    [nickname, signature, role, status, level, coins, id]);
  res.json({ success: true });
});

// 获取所有视频
router.get('/videos', authMiddleware, superAdminOnly, async (req, res) => {
  const [rows] = await db.query('SELECT v.*, u.username FROM videos v JOIN users u ON v.user_id=u.id ORDER BY v.id');
  res.json({ success: true, data: rows });
});

// 更新视频
router.put('/videos/:id', authMiddleware, superAdminOnly, async (req, res) => {
  const { title, description, category, status, views, likes } = req.body;
  await db.query('UPDATE videos SET title=?, description=?, category=?, status=?, views=?, likes=? WHERE id=?',
    [title, description, category, status, views, likes, req.params.id]);
  res.json({ success: true });
});

// 删除视频
router.delete('/videos/:id', authMiddleware, superAdminOnly, async (req, res) => {
  await db.query('DELETE FROM videos WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// 获取所有文章
router.get('/articles', authMiddleware, superAdminOnly, async (req, res) => {
  const [rows] = await db.query('SELECT a.*, u.username FROM articles a JOIN users u ON a.user_id=u.id ORDER BY a.id');
  res.json({ success: true, data: rows });
});

// 更新文章
router.put('/articles/:id', authMiddleware, superAdminOnly, async (req, res) => {
  const { title, summary, category, status, views, likes } = req.body;
  await db.query('UPDATE articles SET title=?, summary=?, category=?, status=?, views=?, likes=? WHERE id=?',
    [title, summary, category, status, views, likes, req.params.id]);
  res.json({ success: true });
});

// 获取所有评论
router.get('/comments', authMiddleware, superAdminOnly, async (req, res) => {
  const [rows] = await db.query('SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id=u.id ORDER BY c.id');
  res.json({ success: true, data: rows });
});

// 删除评论
router.delete('/comments/:id', authMiddleware, superAdminOnly, async (req, res) => {
  await db.query('DELETE FROM comments WHERE id=?', [req.params.id]);
  res.json({ success: true });
});

// 获取所有关注关系
router.get('/follows', authMiddleware, superAdminOnly, async (req, res) => {
  const [rows] = await db.query(
    `SELECT f.*, fu.username as follower_name, f2.username as following_name
     FROM follows f JOIN users fu ON f.follower_id=fu.id JOIN users f2 ON f.following_id=f2.id ORDER BY f.id`);
  res.json({ success: true, data: rows });
});

// 获取所有直播间
router.get('/live-rooms', authMiddleware, superAdminOnly, async (req, res) => {
  const [rows] = await db.query('SELECT r.*, u.username FROM live_rooms r JOIN users u ON r.user_id=u.id ORDER BY r.id');
  res.json({ success: true, data: rows });
});

// 获取所有私信
router.get('/messages', authMiddleware, superAdminOnly, async (req, res) => {
  const [rows] = await db.query(
    'SELECT m.*, s.username as sender_name, r.username as receiver_name FROM private_messages m JOIN users s ON m.sender_id=s.id JOIN users r ON m.receiver_id=r.id ORDER BY m.id');
  res.json({ success: true, data: rows });
});

module.exports = router;
