const { authMiddleware } = require('./auth');
const db = require('../db/db');

const router = require('express').Router();

// 直播间列表
router.get('/', async (req, res) => {
  const [rows] = await db.query(
    `SELECT r.*, u.username, u.avatar as user_avatar, u.nickname
     FROM live_rooms r JOIN users u ON r.user_id = u.id
     ORDER BY FIELD(r.status, 'living', 'preview', 'ended'), r.created_at DESC`
  );
  res.json({ success: true, rooms: rows });
});

// 管理后台直播间列表
router.get('/all', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.json({ success: false, message: '无权限' });
  const [rows] = await db.query(
    `SELECT r.*, u.username, u.avatar as user_avatar
     FROM live_rooms r JOIN users u ON r.user_id = u.id ORDER BY r.id DESC`
  );
  res.json({ success: true, rooms: rows });
});

module.exports = router;
