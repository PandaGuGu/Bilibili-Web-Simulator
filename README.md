# Bilibili Web Simulator

## 项目简介

Bilibili Web Simulator 是一个仿哔哩哔哩视频平台的前端模拟项目，采用 **React 18 + TypeScript** 开发，覆盖用户端和管理端双场景。

> **用户端口** → http://localhost:5173/  
> **管理端口** → http://localhost:5174/

---

## 核心功能

### 用户端

- **首页** - 全屏通栏导航、二级分类标签、Banner 横幅、视频卡片网格、无限滚动加载
- **视频详情页** - 播放器、UP 主信息、互动按钮（点赞/投币/收藏/分享）、评论区
- **用户主页** - 用户信息展示、视频/专栏/评论分类标签页、数据联动真实 store
- **创作中心** - 数据概览、作品管理、投稿管理、消息中心、上传弹窗
- **登录/注册** - 密码验证、表单校验、加载动画、错误提示

### 管理端

- **管理员登录** - 双角色切换（超级管理员 / 审核专员），深色主题
- **数据概览** - 6 项统计卡片、内容类型分布、最近活动
- **内容管理** - 搜索、筛选、审核（通过/驳回）、删除内容
- **内容审核** - 状态/类型筛选，卡片式展示
- **用户管理** - 搜索、状态筛选、封禁/解封

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 样式框架 | Tailwind CSS |
| 路由管理 | React Router v7 |
| 状态管理 | Zustand（带 persist 持久化） |
| 图标库 | Lucide React |
| 构建工具 | Vite |
| 代码规范 | ESLint |

---

## 项目结构

```
BilibiliWebSimulator/
├── src/
│   ├── common/
│   │   ├── components/      Empty.tsx
│   │   ├── hooks/           useTheme.ts
│   │   └── utils/           utils.ts
│   ├── features/
│   │   ├── user/
│   │   │   └── pages/       HomePage, VideoDetail, UserLogin,
│   │   │                    UserRegister, UserProfile, CreationCenter
│   │   └── admin/
│   │       ├── components/  Sidebar
│   │       └── pages/       AdminLogin, Dashboard, Moderation, Accounts
│   ├── store/               useStore.ts (Zustand + persist)
│   ├── assets/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── eslint.config.js
├── .gitignore
├── README.md
└── CODE_WIKI.md
```

---

## 快速开始

```bash
# 安装依赖
npm install

# 启动用户端
npm run dev:user
# → http://localhost:5173/

# 启动管理端
npm run dev:admin
# → http://localhost:5174/

# 代码检查
npm run lint

# 类型检查
npm run check

# 生产构建
npm run build
```

---

## 默认账号

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

## 路由对照

| 路径 | 组件 | 权限 |
|------|------|------|
| `/` | HomePage | 公开（管理员端口自动跳转登录） |
| `/video/:id` | VideoDetail | 公开 |
| `/login/user` | UserLogin | 公开 |
| `/register/user` | UserRegister | 公开 |
| `/login/admin` | AdminLogin | 管理员端口访问 |
| `/dashboard` | Dashboard | 需登录 |
| `/moderation` | Moderation | 需登录 |
| `/accounts` | Accounts | 需登录 |
| `/user/:username` | UserProfile | 公开 |
| `/creation` | CreationCenter | 需登录 |

---

## 项目特点

1. **双端口架构** — 用户端和管理端通过不同端口分离
2. **B 站风格 UI** — 粉蓝渐变主题、卡片式布局、圆润设计
3. **响应式布局** — 最大 1400px，适配多屏幕
4. **数据持久化** — Zustand persist 自动同步 localStorage
5. **路由守卫** — 敏感页面自动跳转登录
6. **无限滚动** — Intersection Observer 实现视频流懒加载
7. **用户主页** — 视频 / 专栏 / 评论数据联动
8. **创作中心** — 创作者工作台，数据统计 + 作品管理
9. **内容管理** — 管理端完整的审核/下架/删除工作流

---

## GitHub 仓库

**https://github.com/PandaGuGu/Bilibili-Web-Simulator**
