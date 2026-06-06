const db = require('../db/db');
const router = require('express').Router();

// 全站搜索：视频 + 文章
router.get('/', async (req, res) => {
  const { q, type = 'all', sort = 'default', page = 1, limit = 20 } = req.query;
  if (!q?.trim()) {
    return res.json({ success: true, results: [], total: 0 });
  }

  const keyword = `%${q.trim()}%`;
  const offset = (Number(page) - 1) * Number(limit);
  const results = [];

  // 视频排序
  let videoSort = 'v.views DESC';
  if (sort === 'newest') videoSort = 'v.created_at DESC';
  if (sort === 'danmaku') videoSort = 'v.danmaku_count DESC';
  if (sort === 'favorites') videoSort = 'v.favorites DESC';

  if (type === 'all' || type === 'video') {
    const [videos] = await db.query(
      `SELECT v.id, v.title, v.description AS preview, v.cover_url AS thumbnail, v.duration,
              v.category, v.views, v.likes, v.danmaku_count, v.created_at, 'video' AS type,
              u.username, u.avatar AS user_avatar, u.nickname
       FROM videos v JOIN users u ON v.user_id = u.id
       WHERE v.status = 'approved' AND (v.title LIKE ? OR v.description LIKE ? OR v.tags LIKE ?)
       ORDER BY ${videoSort}
       LIMIT ? OFFSET ?`,
      [keyword, keyword, keyword, Number(limit), offset]
    );
    results.push(...videos.map(v => ({ ...v, duration: formatDuration(v.duration) })));
  }

  if (type === 'all' || type === 'article') {
    let articleSort = 'a.views DESC';
    if (sort === 'newest') articleSort = 'a.created_at DESC';

    const [articles] = await db.query(
      `SELECT a.id, a.title, a.summary AS preview, a.cover_url AS thumbnail,
              a.category, a.views, a.likes, a.created_at, 'article' AS type,
              u.username, u.avatar AS user_avatar, u.nickname
       FROM articles a JOIN users u ON a.user_id = u.id
       WHERE a.status = 'approved' AND (a.title LIKE ? OR a.content LIKE ? OR a.summary LIKE ?)
       ORDER BY ${articleSort}
       LIMIT ? OFFSET ?`,
      [keyword, keyword, keyword, Number(limit), offset]
    );
    results.push(...articles);
  }

  // 搜索用户
  if (type === 'all' || type === 'user') {
    const [users] = await db.query(
      `SELECT u.id, u.username, u.nickname AS title, u.signature AS preview,
              u.avatar AS thumbnail, u.level, u.followers_count AS views,
              0 AS likes, 0 AS danmaku_count, u.created_at, 'user' AS type,
              u.username, u.avatar AS user_avatar, u.nickname
       FROM users u
       WHERE u.status = 'active' AND (u.username LIKE ? OR u.nickname LIKE ? OR u.signature LIKE ?)
       ORDER BY u.followers_count DESC
       LIMIT ? OFFSET ?`,
      [keyword, keyword, keyword, Number(limit), offset]
    );
    results.push(...users);
  }

  // 排序
  if (sort === 'default') {
    results.sort((a, b) => (b.views || 0) - (a.views || 0));
  }

  res.json({ success: true, results: results.slice(0, Number(limit)), total: results.length, query: q.trim() });
});

function formatDuration(seconds) {
  if (!seconds) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

module.exports = router;
