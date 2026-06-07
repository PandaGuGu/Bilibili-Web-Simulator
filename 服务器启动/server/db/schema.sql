-- ========== Bilibili 模拟站 数据库 Schema ==========
-- 密码 123456 的 bcrypt 哈希值
SET @pwd_hash = '$2b$10$dGhlUXRNb2NrVHJlZU5vMOUGF5C7MV.XLVo9vSPt5NhGYh6v7KkOm';

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(500) DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  nickname VARCHAR(50) DEFAULT NULL,
  signature VARCHAR(200) DEFAULT NULL,
  status ENUM('active','banned','pending') DEFAULT 'active',
  role ENUM('user','admin','moderator') DEFAULT 'user',
  level INT DEFAULT 1,
  exp INT DEFAULT 0,
  coins DECIMAL(10,1) DEFAULT 0,
  followers_count INT DEFAULT 0,
  following_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_role (role)
) ENGINE=InnoDB;

-- 视频表
CREATE TABLE IF NOT EXISTS videos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  cover_url VARCHAR(500),
  video_url VARCHAR(500),
  duration INT DEFAULT 0,
  category VARCHAR(50) DEFAULT 'other',
  tags VARCHAR(500) DEFAULT '',
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  coins INT DEFAULT 0,
  favorites INT DEFAULT 0,
  shares INT DEFAULT 0,
  danmaku_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_views (views),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- 文章表
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  cover_url VARCHAR(500),
  summary VARCHAR(500),
  category VARCHAR(50) DEFAULT 'other',
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  favorites INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  video_id INT DEFAULT NULL,
  article_id INT DEFAULT NULL,
  user_id INT NOT NULL,
  parent_id INT DEFAULT NULL,
  reply_to_user_id INT DEFAULT NULL,
  content TEXT NOT NULL,
  likes INT DEFAULT 0,
  status ENUM('normal','deleted','pinned') DEFAULT 'normal',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
  INDEX idx_video (video_id),
  INDEX idx_user (user_id),
  INDEX idx_parent (parent_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- 弹幕表
CREATE TABLE IF NOT EXISTS danmaku (
  id INT AUTO_INCREMENT PRIMARY KEY,
  video_id INT NOT NULL,
  user_id INT NOT NULL,
  content VARCHAR(200) NOT NULL,
  color VARCHAR(7) DEFAULT '#FFFFFF',
  font_size INT DEFAULT 25,
  mode ENUM('scroll','top','bottom') DEFAULT 'scroll',
  time_point DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_video_time (video_id, time_point)
) ENGINE=InnoDB;

-- 直播间表
CREATE TABLE IF NOT EXISTS live_rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  cover_url VARCHAR(500),
  status ENUM('preview','living','ended') DEFAULT 'preview',
  stream_key VARCHAR(100),
  pull_url VARCHAR(500),
  started_at DATETIME DEFAULT NULL,
  ended_at DATETIME DEFAULT NULL,
  max_viewer_count INT DEFAULT 0,
  current_viewer_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  duration INT DEFAULT 0,
  is_recorded TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- 收藏表
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  video_id INT DEFAULT NULL,
  article_id INT DEFAULT NULL,
  folder_name VARCHAR(50) DEFAULT 'default_folder',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  UNIQUE KEY uk_user_video (user_id, video_id),
  UNIQUE KEY uk_user_article (user_id, article_id)
) ENGINE=InnoDB;

-- 观看历史表
CREATE TABLE IF NOT EXISTS watch_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  video_id INT NOT NULL,
  progress INT DEFAULT 0,
  watched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  INDEX idx_user_time (user_id, watched_at),
  UNIQUE KEY uk_user_video (user_id, video_id)
) ENGINE=InnoDB;

-- 关注表
CREATE TABLE IF NOT EXISTS follows (
  id INT AUTO_INCREMENT PRIMARY KEY,
  follower_id INT NOT NULL,
  following_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_follower (follower_id),
  INDEX idx_following (following_id),
  UNIQUE KEY uk_follow (follower_id, following_id)
) ENGINE=InnoDB;

-- 私信表
CREATE TABLE IF NOT EXISTS private_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_sender (sender_id),
  INDEX idx_receiver (receiver_id),
  INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ========== 种子数据 ==========

-- 7个真实用户 (密码都是 123456)
INSERT INTO users (username, email, password_hash, avatar, nickname, status, role, level, coins) VALUES
('admin', 'admin@bilibili.com', @pwd_hash, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', 'admin', 'active', 'admin', 6, 9999),
('bilibili_user_01', 'user01@bilibili.com', @pwd_hash, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', 'user01', 'active', 'user', 4, 520),
('tech_reviewer', 'tech@bilibili.com', @pwd_hash, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', 'tech', 'active', 'user', 5, 2300),
('anime_fan', 'anime@bilibili.com', @pwd_hash, 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', 'anime', 'banned', 'user', 2, 120),
('music_lover', 'music@bilibili.com', @pwd_hash, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', 'music', 'pending', 'user', 1, 0),
('game_master', 'game@bilibili.com', @pwd_hash, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', 'game', 'active', 'user', 5, 8900),
('artist_dream', 'artist@bilibili.com', @pwd_hash, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', 'artist', 'active', 'user', 3, 450);

-- 6个种子视频
INSERT INTO videos (user_id, title, description, cover_url, duration, category, status, views, likes, danmaku_count) VALUES
(3, '【教程】React 18 新特性详解', 'React 18带来了许多令人兴奋的新特性，包括并发渲染、自动批处理、Suspense改进等。', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop', 1800, 'tech', 'approved', 123000, 8234, 456),
(3, '编程入门：从零开始学Python', '适合零基础的Python编程入门教程。', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop', 2400, 'tech', 'approved', 87000, 5123, 320),
(2, '美食制作：红烧肉教程', '正宗红烧肉的做法，肥而不腻！', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=225&fit=crop', 900, 'food', 'pending', 0, 0, 0),
(3, '数码产品开箱评测', '最新款旗舰手机深度评测。', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=225&fit=crop', 1500, 'tech', 'pending', 0, 0, 0),
(6, '黑神话：悟空 全流程实况', '国产3A大作全流程实况解说。', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=225&fit=crop', 7200, 'game', 'approved', 456000, 23400, 8920),
(7, '数字绘画入门：从线条到色彩', '绘画工具推荐和基础技巧讲解。', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=225&fit=crop', 1200, 'art', 'approved', 56000, 3456, 210);

-- 3篇种子文章
INSERT INTO articles (user_id, title, content, cover_url, summary, category, status, views, likes) VALUES
(2, '2024年度最佳动漫推荐', '本文将为大家推荐2024年最值得一看的动漫作品。', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=225&fit=crop', '2024年最值得追的动漫都在这里了！', 'anime', 'approved', 156000, 9876),
(4, '健身训练计划分享', '科学的健身计划分享。', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=225&fit=crop', '30天科学健身计划！', 'life', 'rejected', 0, 0),
(5, '一周音乐推荐：治愈系歌单', '精选治愈系歌曲推荐。', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=225&fit=crop', '让音乐治愈心灵。', 'music', 'approved', 34000, 2345);

-- 种子评论
INSERT INTO comments (video_id, user_id, content, likes) VALUES
(1, 2, '讲解得非常清楚！React 18的并发模式终于搞明白了', 234),
(1, 5, '期待后续更新，希望能讲讲Suspense在实际项目中的应用', 156),
(2, 4, '作为一个Python新手，这个教程帮了我大忙！', 189),
(5, 1, '黑神话的画面真的太震撼了，国产游戏之光！', 567),
(5, 3, '这一段BOSS战操作太秀了，UP主太强了', 321),
(5, 5, '已三连，希望多录一些国产游戏的内容', 198),
(6, 2, '刚买了数位板，这个教学来得太及时了！', 145);

-- 种子弹幕
INSERT INTO danmaku (video_id, user_id, content, color, time_point) VALUES
(1, 2, '太强了！', '#FF6B6B', 15.5),
(1, 5, '666666', '#00D2FF', 30.0),
(1, 3, '学到了', '#FFD700', 45.2),
(2, 4, '新手报到', '#00FF88', 10.0),
(2, 1, '讲得真好', '#FFFFFF', 25.5),
(5, 6, '前方高能!!!', '#FF4444', 120.0),
(5, 2, '这波操作天秀', '#FFD700', 180.5),
(5, 3, '哈哈哈', '#00D2FF', 250.0);

-- 种子直播间
INSERT INTO live_rooms (user_id, title, cover_url, status, stream_key, pull_url, started_at, max_viewer_count, current_viewer_count, like_count, duration) VALUES
(3, '前端开发实战直播', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=225&fit=crop', 'living', 'stream_key_abc', 'https://live.example.com/stream1', '2026-06-06 14:00:00', 2300, 1250, 5400, 3600),
(7, 'AI绘画创作过程分享', 'https://images.unsplash.com/photo-1547954575-855750c57bd3?w=400&h=225&fit=crop', 'preview', 'stream_key_def', 'https://live.example.com/stream2', NULL, 0, 0, 0, 0),
(6, '游戏实况：黑神话悟空', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=225&fit=crop', 'ended', 'stream_key_ghi', 'https://live.example.com/stream3', '2026-06-05 20:00:00', 8500, 0, 23400, 12600),
(4, 'Python后端开发教程', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop', 'preview', NULL, NULL, NULL, 0, 0, 0, 0);
