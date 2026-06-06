const { authMiddleware } = require('./auth');
const db = require('../db/db');

const router = require('express').Router();

// 获取收藏列表
router.get('/', authMiddleware, async (req, res) => {
  const [rows] = await db.query(
    `SELECT f.*, v.title as video_title, v.cover_url as video_cover
     FROM favorites f LEFT JOIN videos v ON f.video_id = v.id
     WHERE f.user_id = ? ORDER BY f.created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, favorites: rows });
});

// 添加收藏
router.post('/', authMiddleware, async (req, res) => {
  const { videoId, articleId, folderName = 'default_folder' } = req.body;
  try {
    await db.query(
      'INSERT INTO favorites (user_id, video_id, article_id, folder_name) VALUES (?, ?, ?, ?)',
      [req.user.id, videoId || null, articleId || null, folderName]
    );
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.json({ success: false, message: '已收藏' });
    }
    res.json({ success: false, message: '收藏失败' });
  }
});

// 取消收藏
router.delete('/:id', authMiddleware, async (req, res) => {
  await db.query('DELETE FROM favorites WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ success: true });
});

module.exports = router;
