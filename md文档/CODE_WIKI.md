# Bilibili Web Simulator — Code Wiki

## 项目概述

Bilibili Web Simulator 是一个仿哔哩哔哩视频平台的**全栈项目**，采用 **React 18 + TypeScript** 前端 + **Express + MySQL** 后端，通过双端口分别面向普通用户和管理员。

| 端口 | 访问地址 | 适用对象 |
|------|----------|----------|
| 用户端 | http://localhost:5173/ | 普通用户 |
| 管理端 | http://localhost:5174/ | 超级管理员 |
| API | http://localhost:3001/ | 后端接口 |

> 管理员端口范围 5174–5179 均会被自动识别并跳转至管理员登录页。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 样式框架 | Tailwind CSS |
| 路由管理 | React Router v7 (BrowserRouter) |
| 状态管理 | Zustand + persist (localStorage 兜底) |
| 图标库 | Lucide React |
| 构建工具 | Vite 6 |
| 代码规范 | ESLint + TypeScript ESLint |
| 后端框架 | Express 4 |
| 数据库 | MySQL (mysql2 驱动) |
| 认证 | JWT + bcrypt 密码加密 |
| 跨域 | CORS

---

## 项目结构

```
BilibiliWebSimulator/
├── src/
│   ├── api/
│   │   └── client.ts               # API 客户端（封装 fetch，JWT 鉴权）
│   ├── common/                     # 通用共享层
│   │   ├── components/
│   │   │   └── Empty.tsx           # 空状态占位
│   │   ├── hooks/
│   │   │   └── useTheme.ts         # 主题切换（dark/light）
│   │   └── utils/
│   │       └── utils.ts            # cn() — 合并 Tailwind 类名
│   ├── features/                    # 功能模块（按领域拆分）
│   │   ├── user/                   # ── 用户端模块 ──
│   │   │   ├── components/
│   │   │   │   ├── CommentSection.tsx       # 评论区（发表/回复/点赞/删除）
│   │   │   │   ├── MessageDropdown.tsx     # 消息通知下拉
│   │   │   │   ├── FeedDropdown.tsx        # 动态下拉
│   │   │   │   ├── FavoriteDropdown.tsx    # 收藏下拉
│   │   │   │   ├── HistoryDropdown.tsx     # 历史记录下拉
│   │   │   │   ├── UploadDropdown.tsx      # 上传/投稿下拉
│   │   │   │   ├── UserDropdown.tsx        # 用户菜单下拉
│   │   │   │   ├── Danmaku/
│   │   │   │   │   ├── DanmakuLayer.tsx    # 弹幕渲染层
│   │   │   │   │   └── useDanmakuEngine.ts # 弹幕引擎 Hook
│   │   │   │   └── Player/
│   │   │   │       └── BilibiliPlayer.tsx  # 视频播放器（快捷键/弹幕/画质）
│   │   │   └── pages/
│   │   │       ├── HomePage.tsx         # 首页（无限滚动、Banner、标签导航）
│   │   │       ├── VideoDetail.tsx      # 视频详情 + 弹幕 + 评论
│   │   │       ├── UserLogin.tsx        # 用户登录
│   │   │       ├── UserRegister.tsx     # 用户注册
│   │   │       ├── UserProfile.tsx      # 用户主页（视频/专栏）
│   │   │       ├── CreationCenter.tsx   # 创作中心（数据概览/作品管理）
│   │   │       ├── Messages.tsx         # 私信聊天（会话列表+聊天窗口）
│   │   │       ├── Feed.tsx             # 动态流（关注的UP主更新）
│   │   │       ├── SearchResults.tsx    # 搜索结果（视频/文章/用户）
│   │   │       └── LiveRoom.tsx         # 直播间（聊天+礼物）
│   │   └── admin/                  # ── 管理端模块 ──
│   │       ├── components/
│   │       │   └── Sidebar.tsx      # 管理后台侧边栏
│   │       └── pages/
│   │           ├── AdminLogin.tsx     # 管理员登录
│   │           ├── Dashboard.tsx      # 数据概览 + 内容管理
│   │           ├── Moderation.tsx     # 内容审核（卡片式）
│   │           └── Accounts.tsx       # 用户管理（表格+封禁/解封）
│   ├── store/
│   │   ├── useStore.ts            # 全局 Zustand store（用户/内容/评论）
│   │   └── slices/
│   │       ├── usePlayerStore.ts   # 播放器状态（音量/全屏/倍速）
│   │       ├── useDanmakuStore.ts  # 弹幕开关/不透明度/字号
│   │       └── useLiveStore.ts    # 直播间状态
│   ├── assets/                    # 静态资源
│   ├── App.tsx                    # 根组件（路由 + 端口检测 + ProtectedRoute）
│   ├── main.tsx                   # 应用入口
│   └── index.css                  # Tailwind 全局样式
├── server/                         # ── 后端服务 ──
│   ├── index.js                   # Express 入口（端口 3001）
│   ├── db/
│   │   ├── db.js                  # MySQL 连接池配置
│   │   ├── schema.sql             # 建表 + 种子数据（10 张表）
│   │   └── seed.sql               # 备用重建脚本
│   └── routes/
│       ├── auth.js                # 登录/注册/JWT 认证
│       ├── videos.js              # 视频 CRUD + 审核
│       ├── articles.js            # 文章 CRUD + 审核
│       ├── comments.js            # 评论（含二级回复）
│       ├── danmaku.js             # 弹幕
│       ├── contents.js            # 内容聚合（管理后台）
│       ├── users.js               # 用户管理（封禁/解封）
│       ├── favorites.js           # 收藏
│       ├── history.js             # 观看历史
│       ├── live.js                # 直播间
│       ├── search.js              # 全站搜索
│       ├── messages.js            # 私信
│       └── follows.js             # 关注/取关
├── public/
│   └── favicon.svg
├── package.json                   # 前端依赖
├── server/package.json            # 后端依赖
├── tsconfig.json                  # 路径别名 @/* → ./src/*
├── vite.config.ts                 # Vite 配置
├── tailwind.config.js             # darkMode: class
├── eslint.config.js
├── start-servers.ps1              # 一键启动脚本
├── README.md
└── CODE_WIKI.md
```

---

## 路由配置

由 [App.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/App.tsx) 统一管理。

### 路由表

| 路径 | 页面组件 | 访问权限 | 说明 |
|------|----------|----------|------|
| `/` | HomePage | 公开 | 管理员端口自动重定向到 `/login/admin` |
| `/video/:id` | VideoDetail | 公开 | 使用 URL 参数 `id` 展示视频内容 + 弹幕 + 评论 |
| `/login/user` | UserLogin | 公开 | 普通用户登录入口 |
| `/register/user` | UserRegister | 公开 | 用户注册 |
| `/login/admin` | AdminLogin | 管理员端口 | 非管理员端口重定向至 `/` |
| `/dashboard` | Dashboard | 需登录 | 管理后台数据概览 |
| `/moderation` | Moderation | 需登录 | 内容审核 |
| `/accounts` | Accounts | 需登录 | 用户管理 |
| `/user/:username` | UserProfile | 公开 | 用户个人主页 |
| `/creation` | CreationCenter | 需登录 | 创作中心 |
| `/messages` | Messages | 需登录 | 私信列表 |
| `/messages/:username` | Messages | 需登录 | 私信对话 |
| `/feed` | Feed | 需登录 | 动态/关注更新 |
| `/search` | SearchResults | 公开 | 全站搜索（视频/文章/用户） |
| `/live/:id` | LiveRoom | 公开 | 直播间 |

### 端口检测逻辑

```typescript
const port = window.location.port;
const isAdminPort = port >= '5174' && port < '5180';
```

- 端口在 5174 ～ 5179 范围内自动判断为「管理员端口」
- 管理员端口访问 `/` 跳转到 `/login/admin`，限制普通端口的用户登录页访问

### 路由守卫

```typescript
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useStore((state) => state.currentUser);
  if (!currentUser) {
    return <Navigate to="/login/user" replace />;
  }
  return <>{children}</>;
}
```

---

## 状态管理

[useStore.ts](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/store/useStore.ts) — Zustand + `persist` 中间件，数据自动同步至 localStorage，key 为 `bilibili-storage`。

### 数据模型

```typescript
type UserStatus = 'active' | 'banned' | 'pending';
type ContentType = 'video' | 'comment' | 'article';
type ContentStatus = 'pending' | 'approved' | 'rejected';

interface User {
  id: number; username: string; email: string;
  avatar: string; status: UserStatus;
  createdAt: string; password: string;
}

interface Content {
  id: number; title: string; type: ContentType;
  status: ContentStatus; author: string; authorAvatar: string;
  submittedAt: string; thumbnail?: string; preview: string;
  views?: number; likes?: number;
}

interface Comment {
  id: number; contentId: number; author: string;
  authorAvatar: string; text: string;
  createdAt: string; likes: number;
}
```

### Store 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `login` | username, password, role | `boolean` | 校验用户密码和状态，成功则设置 currentUser |
| `logout` | — | `void` | 清除 currentUser |
| `register` | username, email, password | `boolean` | 创建新用户，默认 pending 状态 |
| `approveContent` | id | `void` | 将内容状态设为 approved |
| `rejectContent` | id | `void` | 将内容状态设为 rejected |
| `banUser` | id | `void` | 封禁用户 |
| `unbanUser` | id | `void` | 解封用户 |
| `addContent` | content (不含 id) | `void` | 新增内容 |
| `updateContent` | id, updates | `void` | 更新内容字段 |
| `deleteContent` | id | `void` | 删除内容 |
| `addComment` | comment (不含 id) | `void` | 新增评论 |
| `deleteComment` | id | `void` | 删除评论 |
| `getUserByUsername` | username | `User \| undefined` | 按用户名查找用户 |
| `getContentById` | id | `Content \| undefined` | 按 ID 查找内容 |
| `getCommentsByContentId` | contentId | `Comment[]` | 获取某内容的所有评论 |

### 预置数据（Zustand 兜底，仅当 API 不可用时使用）

**用户：7 条**

| ID | 用户名 | 密码 | 状态 | 说明 |
|----|--------|------|------|------|
| 1 | bilibili_user_01 | 123456 | active | 普通用户 |
| 2 | video_creator | 123456 | active | 普通用户 |
| 3 | anime_fan | 123456 | banned | 已封禁 |
| 4 | tech_reviewer | 123456 | active | 普通用户 |
| 5 | music_lover | 123456 | pending | 待审核 |
| 6 | admin1 | 123456 | active | 超级管理员 |
| 7 | admin2 | 123456 | active | 审核专员 |

**内容：8 条**（视频、评论、文章，状态含 approved / pending / rejected）

**评论：3 条**（关联 contentId 1、2）

---

## 页面组件详解

### 用户端

#### HomePage.tsx

- **职责**：仿 B 站首页
- **布局**：顶部通栏导航 → 二级分类标签 → Banner + 视频卡片网格 → 无限滚动视频区域 → 回到顶部按钮
- **关键交互**：
  - 登录弹窗（点击头像触发）
  - "换一换"随机刷新技术区
  - Intersection Observer 实现无限滚动
  - 头像点击 → `/user/:username`
  - 创作中心/投稿 → `/creation`

#### VideoDetail.tsx

- **职责**：视频播放页
- **功能**：UP 主信息、点赞/投币/收藏/分享、视频简介、相关推荐列表

#### UserLogin.tsx

- **职责**：普通用户登录
- **验证**：用户名 + 密码 → 调用 `api.login()` → 服务端校验 → 返回 JWT → 存 sessionStorage → 跳转首页
- **特性**：密码显示/隐藏、加载动画、错误提示

#### UserRegister.tsx

- **职责**：用户注册
- **校验**：密码一致性、邮箱格式、密码长度 ≥ 6
- **流程**：调用 `api.register()` → 注册成功页面 → 2 秒后跳转登录

#### UserProfile.tsx

- **职责**：用户个人主页
- **布局**：渐变头部 + 用户信息 → 标签导航（视频/专栏/评论）
- **数据联动**：从 store 中筛选该用户的作品和评论，支持空状态提示
- **智能按钮**：自己看自己显示「编辑资料」，看别人显示「+ 关注」

#### CreationCenter.tsx

- **职责**：创作者工作台
- **布局**：左侧主内容 + 右侧边栏
- **标签页**：数据概览 / 作品管理 / 投稿管理 / 消息中心
- **功能**：快捷入口卡片、统计面板、作品列表、上传弹窗、成长数据

### 管理端

#### AdminLogin.tsx

- **职责**：管理员登录
- **验证**：通过 API `/api/auth/login` 登录，服务端校验 role 权限
- **主题**：深色 slate 渐变

#### Dashboard.tsx

- **职责**：管理后台首页
- **统计面板**：6 项（待审核/已通过/已驳回/活跃用户/总用户/评论总数）
- **图表**：内容类型分布 + 最近提交时间线
- **内容管理表格**：支持搜索、类型筛选、审核（通过/驳回/下架）、删除

#### Moderation.tsx

- **职责**：内容审核
- **筛选**：状态（全部/待审核/已通过/已驳回）+ 类型（全部/视频/评论/文章）
- **展示**：卡片式布局，含缩略图、类型图标、状态标签、操作按钮

#### Accounts.tsx

- **职责**：用户管理
- **筛选**：搜索 + 状态筛选
- **展示**：表格（头像/用户名/邮箱/状态/注册时间）
- **操作**：封禁 / 解封

#### Messages.tsx

- **职责**：私信聊天
- **布局**：左侧会话列表 + 右侧聊天窗口
- **数据源**：API `/api/messages/conversations`、`/api/messages/:userId`
- **功能**：实时聊天、未读标记、已关注用户会话、空状态提示

#### Feed.tsx

- **职责**：动态/关注流
- **功能**：展示关注 UP 主的最新视频和文章更新
- **布局**：时间线式卡片列表

#### SearchResults.tsx

- **职责**：全站搜索
- **功能**：搜索视频/文章/用户，支持分类筛选 + 排序 + 分页
- **数据源**：API `/api/search`

#### LiveRoom.tsx

- **职责**：直播间
- **功能**：视频流嵌入、聊天区、观众列表、礼物效果
- **数据源**：API `/api/live`

### 用户端组件

#### CommentSection.tsx
- 评论列表（含二级回复/嵌套）
- 发表评论/回复、点赞、删除（软删除）
- 加载更多、排序（时间/热门）、空状态

#### MessageDropdown.tsx
- 导航栏消息图标下拉，显示未读消息数

#### BilibiliPlayer.tsx
- HTML5 视频播放器封装
- 快捷键：空格（暂停）、←→（快进快退）、↑↓（音量）、F（全屏）、M（静音）
- 弹幕层集成

#### DanmakuLayer.tsx + useDanmakuEngine.ts
- Canvas 弹幕渲染引擎（滚动/顶部/底部三种模式）
- 弹幕开关、不透明度、字号、速度控制

### Store Slices

#### usePlayerStore.ts
- 播放器状态：音量(0-100)、静音、全屏、播放倍速(0.5x–2x)

#### useDanmakuStore.ts
- 弹幕开关、不透明度、字号、速度

#### useLiveStore.ts
- 直播间状态：聊天消息、在线观众数

---

## 后端 API

### 启动方式

```bash
cd server
npm install
npm start          # node index.js (端口 3001)
# 或
npm run dev        # node --watch index.js (热重载)
```

### 数据库

- **类型**：MySQL
- **数据库名**：`bilibili_db`
- **连接配置**：`server/db/db.js` (host: localhost, user: root, password: 123456)
- **表数量**：10 张（users, videos, articles, comments, danmaku, live_rooms, favorites, watch_history, follows, private_messages）

### API 路由

| 前缀 | 文件 | 核心功能 |
|------|------|----------|
| `/api/auth` | routes/auth.js | 注册/登录/JWT 认证 (secret: `bilibili_simulator_jwt_secret_2026`, 7天) |
| `/api/videos` | routes/videos.js | 视频列表/详情/点赞/审核 |
| `/api/articles` | routes/articles.js | 文章列表/详情/审核 |
| `/api/comments` | routes/comments.js | 评论列表/发表/点赞/删除（含二级回复） |
| `/api/danmaku` | routes/danmaku.js | 弹幕列表/发送 |
| `/api/contents` | routes/contents.js | 内容聚合（管理后台审核用） |
| `/api/users` | routes/users.js | 用户列表/封禁解封（管理员权限） |
| `/api/favorites` | routes/favorites.js | 收藏列表/添加/取消 |
| `/api/history` | routes/history.js | 观看历史记录/更新 |
| `/api/live` | routes/live.js | 直播间列表 |
| `/api/search` | routes/search.js | 全站搜索（视频/文章/用户） |
| `/api/messages` | routes/messages.js | 私信会话/聊天/未读数 |
| `/api/follows` | routes/follows.js | 关注/取关/关注状态 |
| `/api/health` | — | 健康检查 |

### 启动后密码初始化

服务器启动时会调用 `initPasswords()` 将所有用户密码统一重置为 `123456` 的 bcrypt 哈希。

---

## 组件

### Sidebar.tsx（管理端）

- Logo + 角色信息
- 导航菜单：数据概览 → `/dashboard`、内容审核 → `/moderation`、用户管理 → `/accounts`
- 退出登录按钮
- 粉色渐变选中态

### Empty.tsx（通用）

- 使用 `cn()` 合并类名
- 简单的 "Empty" 占位文字

---

## Hooks

### useTheme.ts

- 检测 `prefers-color-scheme`
- localStorage 持久化主题偏好
- 切换时更新 `<html>` 的 `class`
- 主题值：`light` / `dark`

---

## 工具函数

### utils.ts

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]): string;
```

用于安全合并 Tailwind CSS 类名，避免类名冲突。

---

## 依赖关系图

```
main.tsx
 └─ App.tsx
     ├─ ProtectedRoute (守卫)
     ├─ HomePage ───── useStore, api
     ├─ VideoDetail ─── useStore, api, BilibiliPlayer, CommentSection, DanmakuLayer
     ├─ UserLogin ───── api, useStore
     ├─ UserRegister ─── api
     ├─ UserProfile ──── useStore, api
     ├─ CreationCenter ─ useStore, api
     ├─ Messages ─────── api, useStore
     ├─ Feed ─────────── api, useStore
     ├─ SearchResults ─── api, useStore
     ├─ LiveRoom ─────── api, useStore, useLiveStore
     ├─ AdminLogin ───── api, useStore
     ├─ Dashboard ────── api, useStore
     │   └─ Sidebar ──── useStore
     ├─ Moderation ───── api, useStore
     │   └─ Sidebar
     └─ Accounts ─────── api, useStore
         └─ Sidebar
```

---

## 配置说明

### Vite

- sourcemap: `hidden`
- Babel：`react-dev-locator`
- 别名：`vite-tsconfig-paths`

### TypeScript

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "paths": { "@/*": ["./src/*"] },
    "strict": false
  }
}
```

### Tailwind

- `darkMode: 'class'`
- 扫描 `index.html` 和 `src/**/*.{ts,tsx}`

---

## 运行方式

```bash
# 1. 安装前端依赖
npm install

# 2. 安装后端依赖
cd server && npm install && cd ..

# 3. 启动 API 服务器 (端口 3001)
cd server && node index.js &

# 4. 启动用户端 → localhost:5173
npm run dev:user

# 5. 启动管理端 → localhost:5174
npm run dev:admin

# 或使用一键启动脚本
.\start-servers.ps1

# 代码检查
npm run check          # TypeScript 类型检查
npm run lint           # ESLint 代码检查
npm run build          # 生产构建
```

> 启动前请确保 MySQL 服务已运行，`bilibili_db` 数据库已创建（首次运行会自动建表）。

---

## API 客户端

`src/api/client.ts` —— 封装 fetch，自动附带 JWT Token，统一错误处理。

```typescript
const API_BASE = 'http://localhost:3001/api';

// Token 存储：sessionStorage（优先）或 localStorage
function getToken(): string

// 通用请求函数
async function request(path, options): Promise<any>

export const api = {
  // Auth
  login(username, password),
  register(username, email, password),
  getMe(),

  // Videos
  getVideos(params?),      // 支持 status, category, page, limit
  getVideo(id),
  reviewVideo(id, status),
  likeVideo(id),

  // Articles
  getArticles(),
  getArticle(id),
  reviewArticle(id, status),

  // Comments
  getComments(contentType, contentId, params?),
  postComment(data),        // { videoId?, articleId?, content, parentId?, replyToUserId? }
  likeComment(id),
  deleteComment(id),

  // Danmaku
  getDanmaku(videoId),
  sendDanmaku(data),

  // Contents (admin)
  getAllContents(),

  // Users (admin)
  getUsers(params?),
  updateUser(id, data),

  // Favorites
  getFavorites(),
  addFavorite(data),
  removeFavorite(id),

  // History
  getHistory(),
  recordHistory(videoId, progress),

  // Live
  getLiveRooms(),
  getLiveRoomsAll(),        // 管理员用，含 ended

  // Search
  search({ q, type?, sort? }),

  // Messages
  getConversations(),
  getMessages(otherUserId),
  sendMessage(receiverId, content),
  getUnreadCount(),

  // Follows
  follow(userId),
  unfollow(userId),
  checkFollow(userId),
}
```

---

## 默认账号

> 以下为 MySQL 数据库预置账号，密码统一为 `123456`。

### 管理员

| 角色 | 账号 | 密码 |
|------|------|------|
| 超级管理员 | `admin` | `123456` |

### 预置普通用户

| 用户名 | 密码 | 状态 |
|--------|------|------|
| bilibili_user_01 | 123456 | 活跃 |
| tech_reviewer | 123456 | 活跃 |
| game_master | 123456 | 活跃 |

---

## 关键实现细节

### 密码验证

```typescript
login: (username, password, role) => {
  const state = get();
  const user = state.users.find(
    u => u.username === username && u.password === password
  );
  if (user && user.status === 'active') {
    set({ currentUser: { username, role } });
    return true;
  }
  return false;  // 状态为 banned 或密码错误均返回 false
}
```

### 无限滚动（Intersection Observer）

```typescript
const observerRef = useRef<IntersectionObserver | null>(null);
const sentinelRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  observerRef.current = new IntersectionObserver(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !isLoadingMore) {
        loadMoreRows();
      }
    },
    { threshold: 0.1 }
  );
  if (sentinelRef.current) {
    observerRef.current.observe(sentinelRef.current);
  }
}, [isLoadingMore]);
```

### 数据持久化（Zustand persist）

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ... state 和方法定义
    }),
    { name: 'bilibili-storage' }  // localStorage key
  )
);
```

---

## 仓库地址

**https://github.com/PandaGuGu/Bilibili-Web-Simulator**
