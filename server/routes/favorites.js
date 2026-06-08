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

// 获取用户的收藏夹列表
router.get('/folders', authMiddleware, async (req, res) => {
  const [rows] = await db.query(
    'SELECT DISTINCT folder_name FROM favorites WHERE user_id = ? ORDER BY folder_name',
    [req.user.id]
  );
  const folders = rows.length > 0 ? rows.map(r => r.folder_name) : ['默认收藏夹'];
  res.json({ success: true, folders });
});

// 添加收藏
router.post('/', authMiddleware, async (req, res) => {
  const { videoId, articleId, folderName = '默认收藏夹' } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO favorites (user_id, video_id, article_id, folder_name) VALUES (?, ?, ?, ?)',
      [req.user.id, videoId || null, articleId || null, folderName]
    );
    // 更新视频收藏计数
    if (videoId) {
      await db.query('UPDATE videos SET favorites = favorites + 1 WHERE id = ?', [videoId]);
    }
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.json({ success: false, message: '已收藏' });
    }
    res.json({ success: false, message: '收藏失败' });
  }
});

// 取消收藏
router.delete('/:id', authMiddleware, async (req, res) => {
  // 先查到 video_id
  const [rows] = await db.query('SELECT video_id FROM favorites WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (rows.length > 0 && rows[0].video_id) {
    await db.query('UPDATE videos SET favorites = GREATEST(favorites - 1, 0) WHERE id = ?', [rows[0].video_id]);
  }
  await db.query('DELETE FROM favorites WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ success: true });
});

// 查询视频收藏状态
router.get('/check/:videoId', authMiddleware, async (req, res) => {
  const [rows] = await db.query(
    'SELECT id, folder_name FROM favorites WHERE user_id = ? AND video_id = ?',
    [req.user.id, req.params.videoId]
  );
  res.json({ success: true, favorited: rows.length > 0, id: rows[0]?.id, folder: rows[0]?.folder_name });
});

module.exports = router;
