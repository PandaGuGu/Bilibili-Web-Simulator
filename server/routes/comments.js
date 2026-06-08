const { authMiddleware } = require('./auth');
const db = require('../db/db');

const router = require('express').Router();

// 获取视频/文章的评论列表
router.get('/:contentType/:contentId', async (req, res) => {
  const { contentType, contentId } = req.params;
  const { sort = 'time', page = 1, limit = 20 } = req.query;
  const col = contentType === 'video' ? 'video_id' : 'article_id';

  // 一级评论
  let orderSql = 'c.created_at DESC';
  if (sort === 'hot') orderSql = 'c.likes DESC, c.created_at DESC';

  const [rows] = await db.query(
    `SELECT c.*, u.username, u.avatar as user_avatar, u.nickname, u.level
     FROM comments c JOIN users u ON c.user_id = u.id
     WHERE c.${col} = ? AND c.parent_id IS NULL AND c.status != 'deleted'
     ORDER BY ${orderSql}
     LIMIT ? OFFSET ?`,
    [contentId, Number(limit), (Number(page) - 1) * Number(limit)]
  );

  // 获取每个评论的回复
  const commentIds = rows.map(r => r.id);
  let replies = [];
  if (commentIds.length > 0) {
    const [replyRows] = await db.query(
      `SELECT c.*, u.username, u.avatar as user_avatar, u.nickname, u.level,
              ru.username as reply_username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN users ru ON c.reply_to_user_id = ru.id
       WHERE c.parent_id IN (?) AND c.status != 'deleted'
       ORDER BY c.created_at ASC`,
      [commentIds]
    );
    replies = replyRows;
  }

  // 组装回复到对应评论下
  const result = rows.map(r => ({
    ...r,
    replies: replies.filter(re => re.parent_id === r.id),
  }));

  // 总评论数
  const [countRows] = await db.query(
    `SELECT COUNT(*) as total FROM comments WHERE ${col} = ? AND status != 'deleted'`,
    [contentId]
  );

  res.json({ success: true, comments: result, total: countRows[0].total });
});

// 发表评论
router.post('/', authMiddleware, async (req, res) => {
  const { videoId, articleId, content, parentId, replyToUserId } = req.body;
  if (!content?.trim()) return res.json({ success: false, message: '请输入评论内容' });

  const [result] = await db.query(
    'INSERT INTO comments (video_id, article_id, user_id, parent_id, reply_to_user_id, content) VALUES (?, ?, ?, ?, ?, ?)',
    [videoId || null, articleId || null, req.user.id, parentId || null, replyToUserId || null, content]
  );

  const [rows] = await db.query(
    `SELECT c.*, u.username, u.avatar as user_avatar, u.nickname, u.level
     FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?`,
    [result.insertId]
  );

  res.json({ success: true, comment: rows[0] });
});

// 点赞评论 (toggle)
router.post('/:id/like', authMiddleware, async (req, res) => {
  const commentId = req.params.id;
  const userId = req.user.id;
  try {
    const [existing] = await db.query(
      'SELECT 1 FROM comment_likes WHERE user_id = ? AND comment_id = ?',
      [userId, commentId]
    );
    if (existing.length > 0) {
      // 取消点赞
      await db.query('DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?', [userId, commentId]);
      await db.query('UPDATE comments SET likes = GREATEST(likes - 1, 0) WHERE id = ?', [commentId]);
      return res.json({ success: true, liked: false });
    }
    // 点赞
    await db.query('INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)', [userId, commentId]);
    await db.query('UPDATE comments SET likes = likes + 1 WHERE id = ?', [commentId]);
    res.json({ success: true, liked: true });
  } catch (err) {
    res.json({ success: false, message: '操作失败' });
  }
});

// 删除评论 (作者或管理员)
router.delete('/:id', authMiddleware, async (req, res) => {
  const [rows] = await db.query('SELECT user_id FROM comments WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.json({ success: false, message: '评论不存在' });
  if (rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
    return res.json({ success: false, message: '无权限' });
  }
  await db.query('UPDATE comments SET status = "deleted" WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
