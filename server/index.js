const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db/db');

const { router: authRouter } = require('./routes/auth');
const usersRouter = require('./routes/users');
const videosRouter = require('./routes/videos');
const articlesRouter = require('./routes/articles');
const commentsRouter = require('./routes/comments');
const danmakuRouter = require('./routes/danmaku');
const contentsRouter = require('./routes/contents');
const favoritesRouter = require('./routes/favorites');
const historyRouter = require('./routes/history');
const liveRouter = require('./routes/live');
const searchRouter = require('./routes/search');
const messagesRouter = require('./routes/messages');
const followsRouter = require('./routes/follows');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 路由
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/videos', videosRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/danmaku', danmakuRouter);
app.use('/api/contents', contentsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/history', historyRouter);
app.use('/api/live', liveRouter);
app.use('/api/search', searchRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/follows', followsRouter);
app.use('/api/admin', adminRouter);

// 确保追踪表存在
async function ensureTables() {
  await db.query(`CREATE TABLE IF NOT EXISTS video_likes (
    user_id INT NOT NULL, video_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, video_id)
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS video_coins (
    user_id INT NOT NULL, video_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, video_id)
  )`);
  await db.query(`CREATE TABLE IF NOT EXISTS comment_likes (
    user_id INT NOT NULL, comment_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, comment_id)
  )`);
  console.log('Trace tables ready (video_likes, video_coins, comment_likes)');
}

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Bilibili API Server is running', time: new Date().toISOString() });
});

// 初始化：确保密码是正确 bcrypt hash
async function initPasswords() {
  const hash = await bcrypt.hash('123456', 10);
  await db.query('UPDATE users SET password_hash = ?', [hash]);
  console.log('All user passwords have been re-hashed with proper bcrypt.');
}

app.listen(PORT, async () => {
  console.log(`Bilibili API Server running on http://localhost:${PORT}`);
  try {
    await ensureTables();
    await initPasswords();
  } catch (err) {
    console.error('Init error:', err.message);
  }
});
