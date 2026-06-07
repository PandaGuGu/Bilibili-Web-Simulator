const { authMiddleware } = require('./auth');
const db = require('../db/db');

const router = require('express').Router();

// 关注
router.post('/:userId', authMiddleware, async (req, res) => {
  const followingId = Number(req.params.userId);
  if (req.user.id === followingId) return res.json({ success: false, message: '不能关注自己' });
  try {
    await db.query('INSERT INTO follows (follower_id, following_id, group_name) VALUES (?, ?, ?)', [req.user.id, followingId, '默认']);
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

// 获取某用户的关注列表
router.get('/:userId/followings', async (req, res) => {
  const userId = Number(req.params.userId);
  const page = Number(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const [rows] = await db.query(
    `SELECT u.id, u.username, u.nickname, u.avatar, u.signature, u.followers_count, u.level,
            f.group_name, f.created_at as follow_time
     FROM follows f JOIN users u ON f.following_id = u.id
     WHERE f.follower_id = ? ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM follows WHERE follower_id = ?', [userId]);
  res.json({ success: true, list: rows, total: total, page, limit });
});

// 获取某用户的粉丝列表
router.get('/:userId/followers', async (req, res) => {
  const userId = Number(req.params.userId);
  const page = Number(req.query.page) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;
  const [rows] = await db.query(
    `SELECT u.id, u.username, u.nickname, u.avatar, u.signature, u.followers_count, u.level,
            f.created_at as follow_time
     FROM follows f JOIN users u ON f.follower_id = u.id
     WHERE f.following_id = ? ORDER BY f.created_at DESC LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );
  // 如果已登录，标记哪些粉丝也是自己关注的人
  const isFollowingIds = new Set();
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.replace('Bearer ', '');
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('./auth');
      const user = jwt.verify(token, JWT_SECRET);
      const [followed] = await db.query('SELECT following_id FROM follows WHERE follower_id = ?', [user.id]);
      followed.forEach(f => isFollowingIds.add(f.following_id));
    } catch {}
  }
  rows.forEach(r => { r.is_following = isFollowingIds.has(r.id); });
  const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM follows WHERE following_id = ?', [userId]);
  res.json({ success: true, list: rows, total: total, page, limit });
});

// 修改关注分组
router.put('/:userId/group', authMiddleware, async (req, res) => {
  const followingId = Number(req.params.userId);
  const { groupName } = req.body;
  await db.query('UPDATE follows SET group_name = ? WHERE follower_id = ? AND following_id = ?', [groupName, req.user.id, followingId]);
  res.json({ success: true });
});

module.exports = router;
