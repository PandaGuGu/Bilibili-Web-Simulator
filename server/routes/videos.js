const { authMiddleware } = require('./auth');
const db = require('../db/db');

const router = require('express').Router();

// 获取视频列表 (前台展示)
router.get('/', async (req, res) => {
  const { status, category, page = 1, limit = 20 } = req.query;
  let sql = `SELECT v.*, u.username, u.avatar as user_avatar, u.nickname
             FROM videos v JOIN users u ON v.user_id = u.id WHERE 1=1`;
  const params = [];
  if (status) { sql += ' AND v.status = ?'; params.push(status); }
  if (category && category !== 'all') { sql += ' AND v.category = ?'; params.push(category); }
  sql += ' ORDER BY v.created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), (Number(page) - 1) * Number(limit));
  const [rows] = await db.query(sql, params);
  res.json({ success: true, videos: rows });
});

// 获取单个视频详情
router.get('/:id', async (req, res) => {
  const [rows] = await db.query(
    `SELECT v.*, u.username, u.avatar as user_avatar, u.nickname, u.signature as user_signature, u.followers_count, u.following_count
     FROM videos v JOIN users u ON v.user_id = u.id WHERE v.id = ?`,
    [req.params.id]
  );
  if (rows.length === 0) return res.json({ success: false, message: '视频不存在' });
  // 增加播放量
  await db.query('UPDATE videos SET views = views + 1 WHERE id = ?', [req.params.id]);
  res.json({ success: true, video: rows[0] });
});

// 审核视频 (管理员)
router.put('/:id/review', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.json({ success: false, message: '无权限' });
  const { status } = req.body;
  await db.query('UPDATE videos SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ success: true });
});

// 点赞/取消点赞 (toggle)
router.post('/:id/like', authMiddleware, async (req, res) => {
  const videoId = req.params.id;
  const userId = req.user.id;
  try {
    // 检查是否已点赞
    const [existing] = await db.query(
      'SELECT 1 FROM video_likes WHERE user_id = ? AND video_id = ?',
      [userId, videoId]
    );
    if (existing.length > 0) {
      // 已点赞 → 取消
      await db.query('DELETE FROM video_likes WHERE user_id = ? AND video_id = ?', [userId, videoId]);
      await db.query('UPDATE videos SET likes = GREATEST(likes - 1, 0) WHERE id = ?', [videoId]);
      return res.json({ success: true, liked: false });
    }
    // 未点赞 → 点赞
    await db.query('INSERT INTO video_likes (user_id, video_id) VALUES (?, ?)', [userId, videoId]);
    await db.query('UPDATE videos SET likes = likes + 1 WHERE id = ?', [videoId]);
    res.json({ success: true, liked: true });
  } catch (err) {
    res.json({ success: false, message: '操作失败' });
  }
});

// 查询点赞状态
router.get('/:id/like/status', authMiddleware, async (req, res) => {
  const [rows] = await db.query(
    'SELECT 1 FROM video_likes WHERE user_id = ? AND video_id = ?',
    [req.user.id, req.params.id]
  );
  res.json({ success: true, liked: rows.length > 0 });
});

// 投币
router.post('/:id/coin', authMiddleware, async (req, res) => {
  const videoId = req.params.id;
  const userId = req.user.id;
  try {
    // 检查是否已投币
    const [existing] = await db.query(
      'SELECT 1 FROM video_coins WHERE user_id = ? AND video_id = ?',
      [userId, videoId]
    );
    if (existing.length > 0) {
      return res.json({ success: false, message: '已对该视频投过币' });
    }
    // 检查用户硬币余额
    const [users] = await db.query('SELECT coins FROM users WHERE id = ?', [userId]);
    if (users.length === 0 || Number(users[0].coins) < 1) {
      return res.json({ success: false, message: '硬币不足' });
    }
    // 扣币 + 投币记录 + 视频币数+1
    await db.query('UPDATE users SET coins = coins - 1 WHERE id = ?', [userId]);
    await db.query('INSERT INTO video_coins (user_id, video_id) VALUES (?, ?)', [userId, videoId]);
    await db.query('UPDATE videos SET coins = coins + 1 WHERE id = ?', [videoId]);
    // 获取最新余额
    const [updated] = await db.query('SELECT coins FROM users WHERE id = ?', [userId]);
    res.json({ success: true, coins: Number(updated[0].coins) });
  } catch (err) {
    res.json({ success: false, message: '投币失败' });
  }
});

// 查询投币状态
router.get('/:id/coin/status', authMiddleware, async (req, res) => {
  const [rows] = await db.query(
    'SELECT 1 FROM video_coins WHERE user_id = ? AND video_id = ?',
    [req.user.id, req.params.id]
  );
  res.json({ success: true, coined: rows.length > 0 });
});

module.exports = router;
