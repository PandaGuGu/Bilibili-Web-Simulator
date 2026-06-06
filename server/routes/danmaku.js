const { authMiddleware } = require('./auth');
const db = require('../db/db');

const router = require('express').Router();

// 获取视频弹幕
router.get('/:videoId', async (req, res) => {
  const [rows] = await db.query(
    'SELECT * FROM danmaku WHERE video_id = ? ORDER BY time_point ASC',
    [req.params.videoId]
  );
  res.json({ success: true, danmaku: rows });
});

// 发送弹幕
router.post('/', authMiddleware, async (req, res) => {
  const { videoId, content, color = '#FFFFFF', timePoint, mode = 'scroll' } = req.body;
  if (!content?.trim()) return res.json({ success: false, message: '请输入弹幕内容' });
  const [result] = await db.query(
    'INSERT INTO danmaku (video_id, user_id, content, color, time_point, mode) VALUES (?, ?, ?, ?, ?, ?)',
    [videoId, req.user.id, content, color, timePoint, mode]
  );
  // 更新视频弹幕计数
  await db.query('UPDATE videos SET danmaku_count = danmaku_count + 1 WHERE id = ?', [videoId]);
  const [rows] = await db.query('SELECT * FROM danmaku WHERE id = ?', [result.insertId]);
  res.json({ success: true, danmaku: rows[0] });
});

module.exports = router;
