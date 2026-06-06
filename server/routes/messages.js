const { authMiddleware } = require('./auth');
const db = require('../db/db');

const router = require('express').Router();

// 获取会话列表（含已关注用户）
router.get('/conversations', authMiddleware, async (req, res) => {
  const userId = req.user.id;

  // 1. 有消息记录的会话
  const [msgConvs] = await db.query(
    `SELECT other_id, username, nickname, avatar, last_message, last_time, unread_count FROM (
      SELECT DISTINCT
        CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END AS other_id,
        FIRST_VALUE(m.content) OVER (PARTITION BY 
          LEAST(m.sender_id, m.receiver_id), GREATEST(m.sender_id, m.receiver_id)
          ORDER BY m.created_at DESC) AS last_message,
        FIRST_VALUE(m.created_at) OVER (PARTITION BY 
          LEAST(m.sender_id, m.receiver_id), GREATEST(m.sender_id, m.receiver_id)
          ORDER BY m.created_at DESC) AS last_time
      FROM private_messages m
      WHERE ? IN (m.sender_id, m.receiver_id)
    ) AS convs
    JOIN users u ON u.id = convs.other_id
    LEFT JOIN (
      SELECT sender_id, COUNT(*) AS unread_count
      FROM private_messages WHERE receiver_id = ? AND is_read = 0 GROUP BY sender_id
    ) AS unread ON unread.sender_id = convs.other_id
    ORDER BY last_time DESC`,
    [userId, userId, userId]
  );

  const msgUserIds = new Set(msgConvs.map(r => r.other_id));

  // 2. 我关注但还没有私信的用户
  const [followedConvs] = await db.query(
    `SELECT u.id AS other_id, u.username, u.nickname, u.avatar,
            NULL AS last_message, NULL AS last_time, 0 AS unread_count
     FROM follows f JOIN users u ON f.following_id = u.id
     WHERE f.follower_id = ? AND f.following_id NOT IN (${msgUserIds.size > 0 ? Array.from(msgUserIds).join(',') : '0'})
     ORDER BY f.created_at DESC`,
    [userId]
  );

  const conversations = [...msgConvs.map(r => ({ ...r, unread_count: r.unread_count || 0 })), ...followedConvs];
  res.json({ success: true, conversations });
});

// 获取与某用户的私聊历史
router.get('/:otherUserId', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const otherId = Number(req.params.otherUserId);
  const [rows] = await db.query(
    `SELECT m.*, 
            s.username AS sender_name, s.nickname AS sender_nickname, s.avatar AS sender_avatar,
            r.username AS receiver_name, r.nickname AS receiver_nickname
     FROM private_messages m
     JOIN users s ON m.sender_id = s.id
     JOIN users r ON m.receiver_id = r.id
     WHERE (m.sender_id = ? AND m.receiver_id = ?)
        OR (m.sender_id = ? AND m.receiver_id = ?)
     ORDER BY m.created_at ASC
     LIMIT 100`,
    [userId, otherId, otherId, userId]
  );
  // 标记为已读
  await db.query(
    'UPDATE private_messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
    [otherId, userId]
  );
  res.json({ success: true, messages: rows });
});

// 发送消息
router.post('/', authMiddleware, async (req, res) => {
  const { receiverId, content } = req.body;
  if (!content?.trim()) return res.json({ success: false, message: '请输入消息内容' });
  const [result] = await db.query(
    'INSERT INTO private_messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
    [req.user.id, receiverId, content]
  );
  const [rows] = await db.query(
    `SELECT m.*, u.username AS sender_name, u.nickname AS sender_nickname, u.avatar AS sender_avatar
     FROM private_messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?`,
    [result.insertId]
  );
  res.json({ success: true, message: rows[0] });
});

// 获取未读消息数
router.get('/unread/count', authMiddleware, async (req, res) => {
  const [rows] = await db.query(
    'SELECT COUNT(*) AS count FROM private_messages WHERE receiver_id = ? AND is_read = 0',
    [req.user.id]
  );
  res.json({ success: true, count: rows[0].count });
});

module.exports = router;
