# Bilibili Web Simulator — Code Wiki

## 项目概述

Bilibili Web Simulator 是一个仿哔哩哔哩视频平台的前端项目，采用 **React 18 + TypeScript** 开发，通过双端口分别面向普通用户和管理员。

| 端口 | 访问地址 | 适用对象 |
|------|----------|----------|
| 用户端 | http://localhost:5173/ | 普通用户 |
| 管理端 | http://localhost:5174/ | 超级管理员 / 审核专员 |

> 管理员端口范围 5174–5179 均会被自动识别并跳转至管理员登录页。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 样式框架 | Tailwind CSS |
| 路由管理 | React Router v7 (BrowserRouter) |
| 状态管理 | Zustand + persist (localStorage) |
| 图标库 | Lucide React |
| 构建工具 | Vite 6 |
| 代码规范 | ESLint + TypeScript ESLint |

---

## 项目结构

```
BilibiliWebSimulator/
├── src/
│   ├── common/                     # 通用共享层
│   │   ├── components/
│   │   │   └── Empty.tsx         # 空状态占位
│   │   ├── hooks/
│   │   │   └── useTheme.ts       # 主题切换（dark/light）
│   │   └── utils/
│   │       └── utils.ts          # cn() — 合并 Tailwind 类名
│   ├── features/                   # 功能模块（按领域拆分）
│   │   ├── user/                  # ── 用户端模块 ──
│   │   │   └── pages/
│   │   │       ├── HomePage.tsx         # 首页（无限滚动、Banner、标签导航）
│   │   │       ├── VideoDetail.tsx      # 视频详情 + 评论
│   │   │       ├── UserLogin.tsx        # 用户登录
│   │   │       ├── UserRegister.tsx     # 用户注册
│   │   │       ├── UserProfile.tsx      # 用户主页（视频/专栏/评论）
│   │   │       └── CreationCenter.tsx   # 创作中心
│   │   └── admin/                 # ── 管理端模块 ──
│   │       ├── components/
│   │       │   └── Sidebar.tsx    # 管理后台侧边栏
│   │       └── pages/
│   │           ├── AdminLogin.tsx     # 管理员登录
│   │           ├── Dashboard.tsx      # 数据概览 + 内容管理
│   │           ├── Moderation.tsx     # 内容审核（卡片式）
│   │           └── Accounts.tsx       # 用户管理（表格）
│   ├── store/
│   │   └── useStore.ts            # 全局状态（Zustand + persist）
│   ├── assets/                    # 静态资源
│   ├── App.tsx                    # 根组件（路由 + 端口检测 + ProtectedRoute）
│   ├── main.tsx                   # 应用入口
│   └── index.css                  # Tailwind 全局样式
├── public/
│   └── favicon.svg
├── package.json
├── tsconfig.json                  # 路径别名 @/* → ./src/*
├── vite.config.ts                 # Vite 配置（React Babel 插件、tsconfigPaths）
├── tailwind.config.js             # darkMode: class
├── eslint.config.js
├── .gitignore
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
| `/video/:id` | VideoDetail | 公开 | 使用 URL 参数 `id` 展示视频内容 |
| `/login/user` | UserLogin | 公开 | 普通用户登录入口 |
| `/register/user` | UserRegister | 公开 | 用户注册 |
| `/login/admin` | AdminLogin | 管理员端口 | 非管理员端口重定向至 `/` |
| `/dashboard` | Dashboard | 需登录 | 管理后台数据概览 |
| `/moderation` | Moderation | 需登录 | 内容审核 |
| `/accounts` | Accounts | 需登录 | 用户管理 |
| `/user/:username` | UserProfile | 公开 | 用户个人主页 |
| `/creation` | CreationCenter | 需登录 | 创作中心 |

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

### 预置数据

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
- **验证**：用户名 + 密码 → 调用 `useStore.login()` → 跳转首页
- **特性**：密码显示/隐藏、记住我、加载动画、错误提示

#### UserRegister.tsx

- **职责**：用户注册
- **校验**：密码一致性、邮箱格式、密码长度 ≥ 6
- **流程**：调用 `useStore.register()` → 注册成功页面 → 2 秒后跳转登录

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
- **角色切换**：超级管理员 / 审核专员
- **验证**：硬编码校验 `admin1` / `admin2`，密码 `123456`
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
     ├─ HomePage ─── useStore (login, contents, currentUser)
     ├─ VideoDetail ─ useStore (currentUser)
     ├─ UserLogin ─── useStore (login)
     ├─ UserRegister ─ useStore (register)
     ├─ UserProfile ── useStore (users, contents, comments)
     ├─ CreationCenter ─ useStore (currentUser, contents)
     ├─ AdminLogin ─── useStore (login)
     ├─ Dashboard ──── useStore (users, contents, comments)
     │                 approveContent, rejectContent, deleteContent
     │   └─ Sidebar ── useStore (currentUser, logout)
     ├─ Moderation ─── useStore (contents, approveContent, rejectContent)
     │   └─ Sidebar
     └─ Accounts ───── useStore (users, banUser, unbanUser)
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
npm install            # 安装依赖
npm run dev:user       # 启动用户端 → localhost:5173
npm run dev:admin      # 启动管理端 → localhost:5174
npm run check          # TypeScript 类型检查
npm run lint           # ESLint 代码检查
npm run build          # 生产构建
```

---

## 默认账号

### 管理员

| 角色 | 账号 | 密码 |
|------|------|------|
| 超级管理员 | `admin1` | `123456` |
| 审核专员 | `admin2` | `123456` |

### 预置普通用户

| 用户名 | 密码 | 状态 |
|--------|------|------|
| bilibili_user_01 | 123456 | 活跃 |
| video_creator | 123456 | 活跃 |
| anime_fan | 123456 | 已封禁 |
| tech_reviewer | 123456 | 活跃 |
| music_lover | 123456 | 待审核 |

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
