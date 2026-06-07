-- ========== Bilibili 模拟站 - 数据库重建脚本 ==========
-- 4个用户: admin / tech_reviewer / bilibili_user_01 / game_master

-- 用户表
CREATE TABLE users (
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
CREATE TABLE videos (
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
CREATE TABLE articles (
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
CREATE TABLE comments (
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
  INDEX idx_parent (parent_id)
) ENGINE=InnoDB;

-- 弹幕表
CREATE TABLE danmaku (
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
CREATE TABLE live_rooms (
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
CREATE TABLE favorites (
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
CREATE TABLE watch_history (
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
CREATE TABLE follows (
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
CREATE TABLE private_messages (
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

-- =============================
-- 四个用户 (密码 123456)
-- =============================
INSERT INTO users (id, username, email, password_hash, nickname, signature, role, level, coins, followers_count, avatar) VALUES
(1, 'admin', 'admin@bilibili.com', '$2b$10$placeholder', 'admin', '系统管理员', 'admin', 6, 9999, 0, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'),
(2, 'tech_reviewer', 'tech@bilibili.com', '$2b$10$placeholder', '科技评测师', '专注数码产品评测与科技前沿', 'user', 5, 2300, 12500, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'),
(3, 'bilibili_user_01', 'user01@bilibili.com', '$2b$10$placeholder', '哔哩用户01', '热爱分享美好生活', 'user', 4, 520, 3400, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'),
(4, 'game_master', 'game@bilibili.com', '$2b$10$placeholder', '游戏大师', '游戏直播/攻略/实况，每周更新', 'user', 5, 8900, 56700, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop');

-- =============================
-- tech_reviewer (id=2) 的视频和文章
-- =============================
INSERT INTO videos (id, user_id, title, description, cover_url, duration, category, status, views, likes, coins, favorites, shares, danmaku_count) VALUES
(1, 2, '【教程】React 18 新特性详解', 'React 18带来了许多令人兴奋的新特性，包括并发渲染、自动批处理、Suspense改进等。本教程将带你深入了解每个新特性，并通过实际项目演示如何使用。', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop', 1800, 'tech', 'approved', 123000, 8234, 4560, 3200, 890, 456),
(2, 2, '编程入门：从零开始学Python', '适合零基础的Python编程入门教程。从环境搭建到第一个项目，手把手教你掌握Python编程。', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop', 2400, 'tech', 'approved', 87000, 5123, 2340, 1500, 430, 320),
(3, 2, '数码产品开箱评测：旗舰手机大对比', '最新款旗舰手机深度评测，外观、性能、拍照全面对比，帮你做出最明智的购买决策。', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=225&fit=crop', 1500, 'tech', 'pending', 0, 0, 0, 0, 0, 0);

INSERT INTO articles (id, user_id, title, content, cover_url, summary, category, status, views, likes) VALUES
(1, 2, '2024年度最佳数码产品推荐', '本文将为大家盘点2024年最值得购买的数码产品，从手机到笔记本，从耳机到相机，全方位覆盖。', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=225&fit=crop', '2024年最值得入手的数码产品都在这里！', 'tech', 'approved', 89000, 5432),
(2, 2, '深入理解TypeScript类型系统', 'TypeScript的类型系统是它最强大的特性之一。本文从基础到高级，全面解析类型系统的奥秘。', 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=225&fit=crop', '掌握TypeScript类型系统，提升代码质量。', 'tech', 'approved', 45000, 3210);

-- =============================
-- bilibili_user_01 (id=3) 的视频和文章
-- =============================
INSERT INTO videos (id, user_id, title, description, cover_url, duration, category, status, views, likes, coins, favorites, shares, danmaku_count) VALUES
(4, 3, '美食制作：正宗红烧肉教程', '正宗红烧肉的做法，肥而不腻，入口即化！手把手教你复刻妈妈的味道。', 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=225&fit=crop', 900, 'food', 'approved', 156000, 12300, 6780, 4300, 1200, 567),
(5, 3, 'VLOG：周末逛吃上海一日游', '周末和朋友一起逛吃上海，打卡网红餐厅和隐藏小店，超多美食分享！', 'https://images.unsplash.com/photo-1534260164206-2a3a4a72891d?w=400&h=225&fit=crop', 1200, 'life', 'approved', 67000, 4567, 2100, 1200, 340, 210),
(6, 3, '旅行日记：云南大理五日游', '苍山洱海，风花雪月。记录在大理五天的美好时光，附详细攻略。', 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&h=225&fit=crop', 1800, 'travel', 'pending', 0, 0, 0, 0, 0, 0);

INSERT INTO articles (id, user_id, title, content, cover_url, summary, category, status, views, likes) VALUES
(3, 3, '一周音乐推荐：治愈系歌单', '精选治愈系歌曲推荐，适合学习、工作、放松时聆听。', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=225&fit=crop', '让音乐治愈你的心灵。', 'music', 'approved', 34000, 2345),
(4, 3, '养猫新手攻略：从选猫到日常护理', '想养猫但不知道从何下手？这篇攻略覆盖选猫、饮食、健康、日常护理全流程。', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=225&fit=crop', '新手养猫全攻略，从入门到精通。', 'life', 'approved', 78000, 6543);

-- =============================
-- game_master (id=4) 的视频和文章
-- =============================
INSERT INTO videos (id, user_id, title, description, cover_url, duration, category, status, views, likes, coins, favorites, shares, danmaku_count) VALUES
(7, 4, '黑神话：悟空 全流程实况', '国产3A大作黑神话悟空全流程实况解说，高能操作集锦，每周更新。', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=225&fit=crop', 7200, 'game', 'approved', 456000, 23400, 12300, 8900, 3400, 8920),
(8, 4, '【直播回放】原神深渊12层满星攻略', '深渊12层满星通关全过程，含阵容搭配、操作技巧、圣遗物推荐。', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=225&fit=crop', 3600, 'game', 'approved', 234000, 15600, 8900, 5670, 2100, 5670),
(9, 4, '新游试玩：幻兽帕鲁初体验', '最近爆火的幻兽帕鲁开荒实况，第一视角带你体验这个神奇的世界！', 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b26?w=400&h=225&fit=crop', 2100, 'game', 'approved', 345000, 18900, 10200, 7200, 2800, 6780),
(10, 4, 'LOL精彩操作集锦 #12', '本期英雄联盟精彩操作：极限反杀、完美团战、逆风翻盘，热血沸腾！', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop', 600, 'game', 'pending', 0, 0, 0, 0, 0, 0);

INSERT INTO articles (id, user_id, title, content, cover_url, summary, category, status, views, likes) VALUES
(5, 4, '2024年度最佳游戏推荐：十大必玩神作', '从独立游戏到3A大作，盘点2024年最值得玩的十款游戏。', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&h=225&fit=crop', '2024年最值得玩的游戏都在这里了！', 'game', 'approved', 234000, 15600),
(6, 4, '游戏外设选购指南：键盘鼠标耳机怎么选', '机械键盘、电竞鼠标、游戏耳机，一篇讲透如何选择最适合自己的游戏外设。', 'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=400&h=225&fit=crop', '花最少的钱买到最适合的游戏装备。', 'game', 'approved', 67000, 4321);

-- =============================
-- 评论数据
-- =============================
INSERT INTO comments (id, video_id, user_id, content, likes) VALUES
(1, 1, 3, '讲解得非常清楚！React 18的并发模式终于搞明白了，感谢UP主！', 234),
(2, 1, 4, '期待后续更新，希望能讲讲Suspense在实际项目中的应用场景。', 156),
(3, 2, 3, '作为一个Python新手，这个教程帮了我大忙！三连支持！', 189),
(4, 7, 2, '黑神话的画面真的太震撼了，国产游戏之光！每一帧都是壁纸。', 567),
(5, 7, 3, '这一段BOSS战操作太秀了，UP主太强了，我死了十几次都没过！', 321),
(6, 8, 2, '按照UP的圣遗物搭配试了一下，真的满星了！太强了！', 198),
(7, 4, 4, '昨天按这个方子做了一次，老婆孩子都说好吃！已收藏！', 145),
(8, 9, 3, '这游戏也太有意思了吧，看完马上买了，根本停不下来！', 234);

-- 子评论(回复)
INSERT INTO comments (id, video_id, user_id, parent_id, reply_to_user_id, content, likes) VALUES
(9, 1, 2, 1, 3, '感谢支持！Suspense的内容已经在准备了，下一期就讲。', 89),
(10, 7, 4, 4, 2, '确实，这画面水平完全超出了我的预期！', 56),
(11, 7, 3, 5, 4, '哈哈哈哈多练练就好，这BOSS其实有套路的。', 34);

-- =============================
-- 弹幕数据
-- =============================
INSERT INTO danmaku (video_id, user_id, content, color, time_point) VALUES
(1, 3, '太强了！', '#FF6B6B', 15.5),
(1, 4, '666666', '#00D2FF', 30.0),
(1, 2, '学到了', '#FFD700', 45.2),
(2, 3, '新手报到', '#00FF88', 10.0),
(2, 2, '讲得真好', '#FFFFFF', 25.5),
(4, 4, '看饿了！', '#FF6B6B', 60.0),
(4, 2, '收藏了', '#FFD700', 120.0),
(7, 2, '前方高能!!!', '#FF4444', 120.0),
(7, 3, '这波操作天秀', '#FFD700', 180.5),
(7, 4, '哈哈哈太搞笑了', '#00D2FF', 250.0),
(8, 3, '学到了', '#00FF88', 45.0),
(8, 2, '这才是真大佬', '#FFD700', 180.0),
(9, 3, '开头就笑死', '#FF6B6B', 10.0),
(9, 2, '好玩好玩', '#00D2FF', 300.0);

-- =============================
-- 直播间（tech_reviewer 和 game_master）
-- =============================
INSERT INTO live_rooms (user_id, title, cover_url, status, stream_key, pull_url, started_at, max_viewer_count, current_viewer_count, like_count, duration) VALUES
(2, '前端开发实战直播', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=225&fit=crop', 'living', 'stream_key_abc', 'https://live.example.com/stream1', '2026-06-06 14:00:00', 2300, 1250, 5400, 3600),
(2, 'Python后端开发教程直播', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop', 'preview', NULL, NULL, NULL, 0, 0, 0, 0),
(4, '游戏实况：黑神话悟空', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=225&fit=crop', 'ended', 'stream_key_ghi', 'https://live.example.com/stream3', '2026-06-05 20:00:00', 8500, 0, 23400, 12600),
(4, '原神深渊竞速挑战', 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=225&fit=crop', 'preview', NULL, NULL, NULL, 0, 0, 0, 0);

SELECT 'OK' AS status;
