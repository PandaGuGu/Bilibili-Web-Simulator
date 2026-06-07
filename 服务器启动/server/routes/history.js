const { authMiddleware } = require('./auth');
const db = require('../db/db');

const router = require('express').Router();

// 获取观看历史
router.get('/', authMiddleware, async (req, res) => {
  const [rows] = await db.query(
    `SELECT h.*, v.title, v.cover_url, v.duration
     FROM watch_history h JOIN videos v ON h.video_id = v.id
     WHERE h.user_id = ? ORDER BY h.watched_at DESC LIMIT 50`,
    [req.user.id]
  );
  res.json({ success: true, history: rows });
});

// 记录/更新观看进度
router.post('/', authMiddleware, async (req, res) => {
  const { videoId, progress } = req.body;
  await db.query(
    'INSERT INTO watch_history (user_id, video_id, progress) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE progress = ?, watched_at = NOW()',
    [req.user.id, videoId, progress || 0, progress || 0]
  );
  res.json({ success: true });
});

module.exports = router;
