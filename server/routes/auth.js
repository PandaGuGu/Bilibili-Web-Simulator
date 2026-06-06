const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db/db');

const JWT_SECRET = 'bilibili_simulator_jwt_secret_2026';

const router = require('express').Router();

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.json({ success: false, message: '请填写所有必填字段' });
    }
    const [existing] = await db.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existing.length > 0) {
      return res.json({ success: false, message: '用户名或邮箱已被注册' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash, nickname, status) VALUES (?, ?, ?, ?, ?)',
      [username, email, hash, username, 'active']
    );
    const token = jwt.sign({ id: result.insertId, username, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      user: { id: result.insertId, username, email, role: 'user', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' },
      token,
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: '注册失败' });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.json({ success: false, message: '用户名或密码错误' });
    const user = rows[0];
    if (user.status === 'banned') return res.json({ success: false, message: '账号已被封禁' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.json({ success: false, message: '用户名或密码错误' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      success: true,
      user: {
        id: user.id, username: user.username, email: user.email,
        avatar: user.avatar, nickname: user.nickname,
        role: user.role, status: user.status, level: user.level,
        coins: user.coins, signature: user.signature,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: '登录失败' });
  }
});

// 获取当前用户
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, avatar, nickname, signature, status, role, level, exp, coins, followers_count, following_count, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.json({ success: false, message: '用户不存在' });
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: '获取用户信息失败' });
  }
});

// Auth middleware
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.json({ success: false, message: '请先登录' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.json({ success: false, message: '登录已过期' });
  }
}

module.exports = { router, authMiddleware, JWT_SECRET };
