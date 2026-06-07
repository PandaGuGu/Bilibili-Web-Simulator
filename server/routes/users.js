const { authMiddleware } = require('./auth');
const db = require('../db/db');

const router = require('express').Router();

// 获取用户公开统计（无需登录）
router.get('/:username/stats', async (req, res) => {
  try {
    const { username } = req.params;
    const [users] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (users.length === 0) return res.json({ success: false, message: '用户不存在' });
    const userId = users[0].id;

    const [[{ following }]] = await db.query('SELECT COUNT(*) as following FROM follows WHERE follower_id = ?', [userId]);
    const [[{ followers }]] = await db.query('SELECT COUNT(*) as followers FROM follows WHERE following_id = ?', [userId]);
    const [[viewsResult]] = await db.query('SELECT COALESCE(SUM(views), 0) as totalViews FROM videos WHERE user_id = ? AND status = ?', [userId, 'approved']);
    const [[likesResult]] = await db.query('SELECT COALESCE(SUM(likes), 0) as totalLikes FROM videos WHERE user_id = ? AND status = ?', [userId, 'approved']);

    res.json({
      success: true,
      stats: {
        following: Number(following),
        followers: Number(followers),
        totalViews: Number(viewsResult.totalViews),
        totalLikes: Number(likesResult.totalLikes),
      }
    });
  } catch (err) {
    res.json({ success: false, message: '获取统计失败' });
  }
});

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
