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
    `SELECT v.*, u.username, u.avatar as user_avatar, u.nickname, u.signature as user_signature
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

// 点赞视频
router.post('/:id/like', authMiddleware, async (req, res) => {
  await db.query('UPDATE videos SET likes = likes + 1 WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
