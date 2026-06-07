const { authMiddleware } = require('./auth');
const db = require('../db/db');

const router = require('express').Router();

// 所有内容 (管理后台审核用)
router.get('/all', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.json({ success: false, message: '无权限' });

  const videos = await db.query(
    `SELECT v.id, v.title, 'video' as type, v.status, v.cover_url as thumbnail, v.description as preview,
            v.views, v.likes, v.created_at as submittedAt,
            u.username as author, u.avatar as authorAvatar
     FROM videos v JOIN users u ON v.user_id = u.id`
  );

  const articles = await db.query(
    `SELECT a.id, a.title, 'article' as type, a.status, a.cover_url as thumbnail, a.summary as preview,
            a.views, a.likes, a.created_at as submittedAt,
            u.username as author, u.avatar as authorAvatar
     FROM articles a JOIN users u ON a.user_id = u.id`
  );

  const comments = await db.query(
    `SELECT c.id, LEFT(c.content,50) as title, 'comment' as type,
            CASE WHEN c.status='normal' THEN 'approved' WHEN c.status='deleted' THEN 'rejected' ELSE 'pending' END as status,
            NULL as thumbnail, c.content as preview,
            c.likes, 0 as views, c.created_at as submittedAt,
            u.username as author, u.avatar as authorAvatar
     FROM comments c JOIN users u ON c.user_id = u.id`
  );

  const all = [
    ...videos[0].map(v => ({ ...v, submittedAt: formatDate(v.submittedAt) })),
    ...articles[0].map(a => ({ ...a, submittedAt: formatDate(a.submittedAt) })),
    ...comments[0].map(c => ({ ...c, submittedAt: formatDate(c.submittedAt) })),
  ].sort((a, b) => b.id - a.id);

  res.json({ success: true, contents: all });
});

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

module.exports = router;
