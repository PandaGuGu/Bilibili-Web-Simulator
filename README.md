# Bilibili Web Simulator v6.1

全栈 B 站模拟平台 — React 18 + TypeScript + Vite + Tailwind CSS + Express + MySQL

**在线仓库**: [github.com/PandaGuGu/Bilibili-Web-Simulator](https://github.com/PandaGuGu/Bilibili-Web-Simulator)

## 架构

```
src/
├── api/            # API 客户端（fetch封装）
├── assets/         # 静态资源
├── components/     # 公共组件（播放器、弹幕、下拉菜单等）
├── pages/          # 所有页面（35+路由）
│   ├── HomePage.tsx       首页（轮播+下拉菜单+无限滚动）
│   ├── VideoDetail.tsx    视频详情
│   ├── Messages.tsx       私信（分类+聊天+设置）
│   ├── UserProfile.tsx    个人空间（风景图背景）
│   ├── AccountCenter.tsx  账户中心（勋章+安全）
│   ├── RelationshipPage.tsx 关注/粉丝
│   ├── SuperAdmin.tsx     超级管理员数据面板
│   └── ...
├── router/         # 路由配置
├── store/          # Zustand 状态管理
├── utils/          # 工具函数
├── App.tsx         # 应用入口（路由+认证恢复）
└── main.tsx        # React入口

server/
├── index.js        # Express 入口（端口3001）
├── db/             # MySQL 数据库 schema + seed
└── routes/         # REST API（15个路由文件）
```

## 运行

```bash
# 前端
npx vite --port 5173 --host

# API 服务
node server/index.js
```

| 服务 | 端口 |
|------|------|
| 用户前台 | 5173 |
| API | 3001 |

## 数据库

**MySQL 8.0** (`bilibili_db`)，用户：`root / 123456`

### 表结构（8张表）

| 表 | 说明 |
|---|---|
| users | 用户（4人，含super_admin） |
| videos | 视频（10条） |
| articles | 文章（6篇） |
| comments | 评论（11条） |
| danmaku | 弹幕（14条） |
| follows | 关注关系（支持分组） |
| private_messages | 私信 |
| live_rooms | 直播间（4个） |

### 用户（密码统一 123456）

| ID | 用户名 | 角色 | 说明 |
|----|--------|------|------|
| 1 | admin | super_admin | 可访问 /admin/super 操控全部数据 |
| 2 | tech_reviewer | UP主 | 3视频+2文章（科技区） |
| 3 | bilibili_user_01 | 普通用户 | 3视频+2文章（生活区） |
| 4 | game_master | UP主 | 4视频+2文章（游戏区） |

## 路由一览（35+ 页面）

### 核心页面
| 路由 | 页面 |
|---|---|
| `/` | 首页（轮播+下拉菜单+视频网格+无限滚动） |
| `/video/:id` | 视频详情 |
| `/messages/:username` | 私信（我的消息/回复/@/赞/系统+消息设置） |
| `/user/:username` | 个人空间（风景图背景+标签导航） |
| `/user/:username/following` | 关注列表 |
| `/user/:username/followers` | 粉丝列表 |
| `/account/home` | 账户中心（勋章+安全+每日奖励） |
| `/feed` | 动态 |
| `/favorites` | 收藏 |
| `/history` | 历史记录 |
| `/creation` | 创作中心 |
| `/vip` | 大会员 |
| `/search` | 全站搜索 |
| `/admin/super` | 超级管理员后台（全表CRUD） |

### 分区页 / 频道 / 认证（同上）

## 技术栈

- **前端**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router v6
- **后端**: Express.js, MySQL 8.0, JWT, bcrypt
- **UI**: Lucide Icons, Tailwind utilities

## 功能特性

- 🎬 视频播放 + 弹幕系统 + 评论区
- 💬 私信（三栏：分类+会话+聊天，消息设置面板）
- 👥 关注/粉丝系统 + 关系页（分组管理）
- 👤 个人空间（风景图背景 + 标签导航）
- 🏠 账户中心（勋章/安全/每日奖励）
- 🛡️ 超级管理员数据管理后台
- 🔍 全站搜索（视频/文章/用户）
- 📺 直播房间（播放器+聊天+礼物）
- 🛒 大会员页面（套餐+特权）
- 🎨 26 个分类页面对齐 B 站真实分区
- 🔔 消息红点系统（轮询未读数）
- 🎬 首页轮播（左右箭头+圆点+2.5s自动切换）
- 📡 无限滚动视频网格（每次加载3行）

## 版本历史

| 版本 | 日期 | 内容 |
|---|---|---|
| v1 | 2026-06-06 | 全栈基础架构，8表数据库 |
| v2-v4 | 2026-06-06~07 | 导航页+分区+真实数据+目录重构 |
| v5.x | 2026-06-07 | 消息红点+分类通知+封面修复+网格key冲突 |
| v6.0 | 2026-06-07 | 首页悬浮菜单、轮播箭头、个人主页白字主题 |
| v6.1 | 2026-06-07 | 🚀个人空间+关系页+账户中心+超级管理员后台 |
