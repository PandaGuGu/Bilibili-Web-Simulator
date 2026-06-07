# Bilibili Web Simulator v4

全栈 B 站模拟平台 — React 18 + TypeScript + Vite + Tailwind CSS + Express + MySQL

## 架构

```
src/
├── api/            # API 客户端（fetch封装）
├── assets/         # 静态资源
├── components/     # 公共组件（播放器、弹幕、下拉菜单等）
├── pages/          # 所有页面（30+路由）
│   ├── HomePage.tsx       首页
│   ├── VideoDetail.tsx    视频详情
│   ├── Messages.tsx       私信消息
│   ├── Feed.tsx           动态
│   ├── VipPage.tsx        大会员
│   ├── HistoryPage.tsx    历史记录
│   ├── FavoritesPage.tsx  收藏
│   ├── CategoryPage.tsx   26个分区（通用模板）
│   ├── LiveRoom.tsx       直播间
│   └── ...
├── router/         # 路由配置
├── store/          # Zustand 状态管理
│   ├── index.ts    # 用户/内容/评论
│   ├── danmaku.ts  # 弹幕引擎
│   ├── player.ts   # 播放器状态
│   └── live.ts     # 直播状态
├── utils/          # 工具函数
├── styles/         # 全局样式
├── App.tsx         # 应用入口（路由+认证恢复）
└── main.tsx        # React入口

server/
├── index.js        # Express 入口（端口3001）
├── db/             # MySQL 数据库 schema + seed
└── routes/         # REST API（14个路由文件）
```

## 运行

```bash
# 前端
cd Bilibili模拟 && npx vite --port 5173 --host

# 管理后台
npx vite --port 5174 --host

# API 服务
cd Bilibili模拟/server && node index.js
```

| 服务 | 端口 |
|------|------|
| 用户前台 | 5173 |
| 管理后台 | 5174 |
| API | 3001 |

## 数据库

**MySQL 8.0** (`bilibili_db`)，用户：`root / 123456`

### 表结构（8张表）

| 表 | 说明 |
|---|---|
| users | 用户（4人） |
| videos | 视频（10条） |
| articles | 文章（6篇） |
| comments | 评论（11条） |
| danmaku | 弹幕（14条） |
| follows | 关注关系（9条） |
| private_messages | 私信（14条预设） |
| live_rooms | 直播间（4个） |

### 用户（密码统一 123456）

| ID | 用户名 | 昵称 | 角色 | 等级 | 粉丝 | 关注 |
|----|--------|------|------|------|------|------|
| 1 | admin | admin | 管理员 | Lv6 | 3 | 0 |
| 2 | tech_reviewer | 科技评测师 | UP主 | Lv5 | 2 | 3 |
| 3 | bilibili_user_01 | 哔哩用户01 | 普通用户 | Lv4 | 2 | 3 |
| 4 | game_master | 游戏大师 | UP主 | Lv5 | 2 | 3 |

## 路由一览（30+ 页面）

### 核心页面
| 路由 | 页面 |
|---|---|
| `/` | 首页（风景Banner+分类按钮+视频网格+2.5s轮播） |
| `/video/:id` | 视频详情（播放器+弹幕+评论+UP主信息+关注） |
| `/messages/:username` | 私信（三栏：分类+会话+聊天） |
| `/feed` | 动态 |
| `/search` | 全站搜索（视频/专栏/用户） |
| `/favorites` | 收藏 |
| `/history` | 历史记录 |
| `/creation` | 创作中心 |
| `/vip` | 大会员 |

### B站真实一级分区（20个）
| 路由 | 分区 | 路由 | 分区 |
|---|---|---|---|
| `/anime` | 动画·番剧 | `/game` | 游戏 |
| `/guochuang` | 国创 | `/music` | 音乐 |
| `/dance` | 舞蹈 | `/knowledge` | 知识 |
| `/tech` | 科技 | `/sports` | 运动 |
| `/car` | 汽车 | `/life` | 生活 |
| `/food` | 美食 | `/animal` | 动物圈 |
| `/kichiku` | 鬼畜 | `/fashion` | 时尚 |
| `/entertainment` | 娱乐 | `/movie` | 影视·电影·电视剧 |
| `/documentary` | 纪录片 | `/columns` | 专栏 |

### 其他频道
| 路由 | 页面 |
|---|---|
| `/live` | 直播列表 |
| `/live/:id` | 直播间 |
| `/comic` | 漫画 |
| `/esports` | 赛事 |
| `/classroom` | 课堂 |
| `/events` | 活动 |
| `/community` | 社区中心 |
| `/gaokao` | 高考季 |

### 认证
| 路由 | 说明 |
|---|---|
| `/login/user` | 用户登录 |
| `/register/user` | 用户注册 |
| `/login/admin` | 管理后台登录（仅5174端口） |
| `/dashboard` | 管理后台 |
| `/admin/accounts` | 用户管理 |
| `/admin/moderation` | 内容审核 |

## 技术栈

- **前端**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router v6
- **后端**: Express.js, MySQL 8.0, JWT, bcrypt
- **认证**: JWT token（sessionStorage 单标签隔离）

## 功能特性

- 🎬 视频播放 + 弹幕系统 + 评论区
- 💬 私信（三栏布局，500字限制，表情/图片按钮）
- 👥 关注/粉丝系统
- 🔍 全站搜索（视频/文章/用户）
- 📺 直播房间（播放器+聊天+礼物）
- 🛒 大会员页面（套餐+特权）
- 📊 管理后台（用户管理+内容审核）
- 🎨 26 个分类页面对齐 B 站真实分区

## 版本历史

| 版本 | 日期 | 内容 |
|---|---|---|
| v1 | 2026-06-06 | 全栈基础架构，8表数据库 |
| v2 | 2026-06-06 | localStorage 回滚 |
| v3 | 2026-06-07 | 导航页+大会员+收藏+历史+真实视频数据 |
| v4 | 2026-06-07 | 目录重构（features→pages+components+router），14个新分区页，API 容错修复 |
