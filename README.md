# Bilibili Web Simulator v6.8

全栈 B 站模拟平台 — React 18 + TypeScript + Vite + Tailwind CSS + Express + MySQL

**仓库**: [github.com/PandaGuGu/Bilibili-Web-Simulator](https://github.com/PandaGuGu/Bilibili-Web-Simulator)

---

## 架构

```
src/
├── api/            # API 客户端（fetch封装，JWT认证）
├── components/     # 公共组件（播放器、弹幕、下拉菜单等）
├── pages/          # 所有页面
│   ├── HomePage.tsx          首页（轮播+下拉菜单+无限滚动）
│   ├── VideoDetail.tsx       视频详情
│   ├── UserProfile.tsx       个人空间（投稿子分类+真实统计）
│   ├── AccountCenter.tsx     账户中心（勋章+安全）
│   ├── DataManage.tsx        后台数据管理（7表CRUD）
│   ├── Dashboard.tsx         管理后台（审核+搜索）
│   └── ...
├── store/          # Zustand 状态管理
└── App.tsx         # 应用入口（路由+认证恢复）

server/
├── index.js        # Express 入口（端口3001）
├── db/             # MySQL schema + seed
└── routes/         # REST API（15个路由文件）
```

## 快速启动

```bash
# 前端
npx vite --port 5173 --host

# 管理后台
npx vite --port 5174 --host

# API 服务
node server/index.js
```

| 服务 | 端口 | 地址 |
|------|------|------|
| 用户前台 | 5173 | http://localhost:5173 |
| 管理后台 | 5174 | http://localhost:5174 |
| API | 3001 | http://localhost:3001 |

## 数据库

**MySQL 8.0**，数据库 `bilibili_db`，用户：`root / 123456`

### 表结构（12张表）

| 表 | 说明 |
|---|---|
| users | 用户（4人，含super_admin） |
| videos | 视频 |
| articles | 文章 |
| comments | 评论 |
| danmaku | 弹幕 |
| follows | 关注关系（支持分组） |
| private_messages | 私信 |
| live_rooms | 直播间 |
| favorites | 收藏夹 |
| watch_history | 观看历史 |
| video_likes | 视频点赞追踪 |
| video_coins | 视频投币追踪 |
| comment_likes | 评论点赞追踪 |

### 用户（密码统一 123456）

| ID | 用户名 | 角色 | 说明 |
|----|--------|------|------|
| 1 | admin | super_admin | 超级管理员 |
| 2 | tech_reviewer | UP主 | 科技区 |
| 3 | bilibili_user_01 | 普通用户 | 生活区 |
| 4 | game_master | UP主 | 游戏区 |

## 功能特性

### 用户端
- 🎬 首页：视频轮播 + 分类导航 + 无限滚动视频网格
- 🎥 视频详情 + 弹幕系统 + 评论区 + **点赞/投币/收藏**
- 👤 个人空间：风景图背景 + 投稿管理（视频/图文/音频子分类）+ **收藏展示**
- 📊 用户统计：关注/粉丝/播放/获赞 全部实时数据库统计
- 🪙 **投币系统**：每日1币，投后不可撤回
- 🖼️ **头像上传**：本地上传（JPG/PNG/GIF/WebP）
- 💬 私信系统
- 🔍 全站搜索
- 📺 直播间
- 🛒 大会员页面
- 🎨 26 个分类页面对齐 B 站真实分区
- 📡 导航栏下拉菜单：用户、消息、动态、收藏、历史（全部接入真实API）

### 管理端
- 📊 数据总览 + 内容审核（类型/状态双重筛选）
- 👥 用户管理（封禁/解封）
- 📝 内容审核（视频/文章/评论审批）
- 📺 直播管理
- 🗄️ **后台数据管理** (`/dashboard/Datamanage`) — 7张表完整CRUD

### 超级管理员
- `/admin/super` — 暗色面板，全表数据操控

## 版本历史

| 版本 | 日期 | 内容 |
|------|------|------|
| v1 | 2026-06-06 | 全栈基础架构，8表数据库 |
| v2 | 2026-06-06 | localStorage 回滚 |
| v3 | 2026-06-07 | 导航页+大会员+收藏+历史+真实视频数据 |
| v4 | 2026-06-07 | 目录重构（features→pages+components+router），14个新分区页，API 容错修复 |
| v5.x | 2026-06-07 | 消息红点 + 封面修复 + 网格key冲突 |
| v6.0-v6.1 | 2026-06-07 | 悬浮菜单 + 轮播箭头 + 个人空间 + 超级管理员后台 |
| v6.2 | 2026-06-07 | 文档整理 + 服务器启动包 + 数据库修复 |
| v6.3 | 2026-06-07 | DataManage 后台数据管理 + z-index修复 + AdminLogin角色修复 |
| v6.4 | 2026-06-07 | 下拉菜单真实化（Feed/History）+ Dashboard搜索修复 |
| v6.5 | 2026-06-07 | 收藏真实化 + 投稿子分类（视频/图文/音频）+ 收藏面板底部固定 |
| v6.6 | 2026-06-07 | 用户统计API（关注/粉丝/播放/获赞实时数据）+ README根目录 |
| v6.7 | 2026-06-08 | 点赞toggle+投币系统+收藏夹弹窗+评论点赞取消+头像上传+个人空间收藏展示+4人互关种子 |
| v6.8 | 2026-06-08 | 稳定性修复：后端反复崩溃+页面白屏（TS声明顺序）+Vite缓存清理+启动错误报告 |

## 技术栈

- **前端**: React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router v6, Lucide Icons
- **后端**: Express.js, MySQL 8.0, JWT, bcrypt
- **部署**: 服务器启动脚本 + 启动说明文档
