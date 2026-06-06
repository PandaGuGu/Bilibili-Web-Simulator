# Bilibili模拟项目 - Code Wiki

## 项目概述

Bilibili模拟是一个仿哔哩哔哩视频平台的前端项目，采用React 18 + TypeScript开发。项目分为两个端口：
- **普通用户端口 (5173)**：面向普通用户，提供视频浏览、登录注册、个人主页、创作中心等功能
- **管理员端口 (5174)**：面向管理员和审核专员，提供内容审核和用户管理功能

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 样式框架 | Tailwind CSS |
| 路由管理 | React Router v7 |
| 状态管理 | Zustand |
| 图标库 | Lucide React |
| 构建工具 | Vite |
| 代码规范 | ESLint |

---

## 项目结构

```
Bilibili模拟/
├── src/
│   ├── common/                 # 通用共享资源
│   │   ├── components/
│   │   │   └── Empty.tsx     # 空状态组件
│   │   ├── hooks/
│   │   │   └── useTheme.ts   # 主题切换Hook
│   │   └── utils/
│   │       └── utils.ts      # 通用工具函数
│   ├── features/              # 功能模块
│   │   ├── user/             # 用户端模块
│   │   │   └── pages/
│   │   │       ├── HomePage.tsx      # 首页
│   │   │       ├── VideoDetail.tsx   # 视频详情页
│   │   │       ├── UserLogin.tsx     # 用户登录页
│   │   │       ├── UserRegister.tsx  # 用户注册页
│   │   │       ├── UserProfile.tsx   # 用户主页
│   │   │       └── CreationCenter.tsx # 创作中心
│   │   └── admin/            # 管理端模块
│   │       ├── components/
│   │       │   └── Sidebar.tsx       # 管理后台侧边栏
│   │       └── pages/
│   │           ├── AdminLogin.tsx    # 管理员登录页
│   │           ├── Dashboard.tsx      # 管理仪表盘
│   │           ├── Moderation.tsx     # 内容审核页
│   │           └── Accounts.tsx       # 用户管理页
│   ├── store/                     # 状态管理
│   │   └── useStore.ts            # Zustand状态仓库
│   ├── App.tsx                    # 应用根组件
│   ├── main.tsx                   # 应用入口
│   └── index.css                  # 全局样式
├── public/                        # 公共静态资源
├── package.json                   # 项目配置
├── tsconfig.json                  # TypeScript配置
├── vite.config.ts                 # Vite配置
├── tailwind.config.js             # Tailwind配置
└── CODE_WIKI.md                  # 本文档
```

---

## 主要模块职责

### 1. 入口文件

#### [main.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/main.tsx)
- **职责**：React应用入口
- **功能**：
  - 创建React根节点
  - 渲染App组件
  - 使用StrictMode

#### [App.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/App.tsx)
- **职责**：应用路由配置和根组件
- **功能**：
  - 配置React Router路由
  - 定义路由守卫 `ProtectedRoute`
  - 根据端口自动切换默认路径
- **路由列表**：
  | 路径 | 组件 | 权限 |
  |------|------|------|
  | `/` | HomePage | 公开 |
  | `/video/:id` | VideoDetail | 公开 |
  | `/login/user` | UserLogin | 公开 |
  | `/register/user` | UserRegister | 公开 |
  | `/login/admin` | AdminLogin | 公开 |
  | `/dashboard` | Dashboard | 需登录 |
  | `/moderation` | Moderation | 需登录 |
  | `/accounts` | Accounts | 需登录 |
  | `/user/:username` | UserProfile | 公开 |
  | `/creation` | CreationCenter | 需登录 |

---

### 2. 状态管理

#### [useStore.ts](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/store/useStore.ts)
- **职责**：全局状态管理
- **技术**：Zustand
- **状态类型**：
  ```typescript
  interface AppState {
    currentUser: { username: string; role: 'user' | 'admin' | 'moderator' } | null;
    users: User[];
    contents: Content[];
    login: (username: string, password: string, role: 'user' | 'admin' | 'moderator') => boolean;
    logout: () => void;
    register: (username: string, email: string, password: string) => boolean;
    approveContent: (id: number) => void;
    rejectContent: (id: number) => void;
    banUser: (id: number) => void;
    unbanUser: (id: number) => void;
  }
  ```

- **数据类型**：
  ```typescript
  type UserStatus = 'active' | 'banned' | 'pending';

  interface User {
    id: number;
    username: string;
    email: string;
    avatar: string;
    status: UserStatus;
    createdAt: string;
    password: string;
  }

  type ContentType = 'video' | 'comment' | 'article';
  type ContentStatus = 'pending' | 'approved' | 'rejected';

  interface Content {
    id: number;
    title: string;
    type: ContentType;
    status: ContentStatus;
    author: string;
    authorAvatar: string;
    submittedAt: string;
    thumbnail?: string;
    preview: string;
  }
  ```

- **Mock数据**：
  - 6个预置用户（包含admin用户，密码123456）
  - 5条预置内容（视频、评论、文章各类型）

---

### 3. 页面组件

#### 用户端页面

##### [HomePage.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/features/user/pages/HomePage.tsx)
- **职责**：B站风格首页
- **功能**：
  - 全屏通栏顶部导航栏（功能入口、搜索、用户区）
  - 二级分类标签导航
  - Banner横幅区域
  - 核心内容陈列区（2行×3列视频卡片）
  - 无限滚动视频网格（5列×多行）
  - 回到顶部按钮
  - 登录弹窗
  - 换一换随机刷新功能
- **关键技术**：
  - Intersection Observer实现无限滚动
  - 响应式布局（1400px最大宽度）
  - 粉蓝渐变主题色（#FB7299）

##### [VideoDetail.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/features/user/pages/VideoDetail.tsx)
- **职责**：视频详情页面
- **功能**：
  - 视频播放器区域
  - UP主信息展示
  - 互动按钮（点赞、投币、收藏、分享）
  - 视频简介
  - 相关推荐视频列表
  - 评论区（占位）

##### [UserLogin.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/features/user/pages/UserLogin.tsx)
- **职责**：普通用户登录
- **功能**：
  - 用户名/密码输入
  - 密码显示/隐藏切换
  - 记住我选项
  - 表单验证
  - 登录成功后跳转首页
- **主题**：粉蓝渐变背景

##### [UserRegister.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/features/user/pages/UserRegister.tsx)
- **职责**：普通用户注册
- **功能**：
  - 用户名、邮箱、密码、确认密码输入
  - 表单验证（密码匹配、邮箱格式、密码长度）
  - 注册成功后跳转登录页
- **主题**：粉蓝渐变背景

##### [UserProfile.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/features/user/pages/UserProfile.tsx)
- **职责**：用户个人主页
- **功能**：
  - 用户信息展示（头像、昵称、等级、UID）
  - 标签页导航（视频、动态、相册、收藏）
  - 视频列表展示
  - 动态列表展示
  - 相册网格展示
  - 收藏列表展示
  - 关注、发消息等操作按钮
- **布局**：渐变背景头部 + 白色内容区

##### [CreationCenter.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/features/user/pages/CreationCenter.tsx)
- **职责**：创作者管理中心
- **功能**：
  - 数据概览（播放、点赞、粉丝、互动率）
  - 播放趋势图表
  - 作品管理列表
  - 投稿管理
  - 消息中心
  - 快捷入口（上传视频、内容编辑、素材库、设置）
  - 创作激励计划卡片
  - 成长数据展示
  - 帮助与建议
- **布局**：左右分栏布局

#### 管理员端页面

##### [AdminLogin.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/features/admin/pages/AdminLogin.tsx)
- **职责**：管理员登录
- **功能**：
  - 角色切换（超级管理员/审核专员）
  - 硬编码账号验证
  - 深色主题（slate渐变）
- **默认账号**：
  | 角色 | 账号 | 密码 |
  |------|------|------|
  | 超级管理员 | 3256829664 | Lzf060701 |
  | 审核专员 | 160846834 | Lzf060701 |

##### [Dashboard.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/features/admin/pages/Dashboard.tsx)
- **职责**：管理后台仪表盘
- **功能**：
  - 数据统计卡片（待审核/已通过/活跃用户/总用户）
  - 内容类型分布条形图
  - 最近活动时间线
  - 趋势对比指标
- **布局**：使用Sidebar组件

##### [Moderation.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/features/admin/pages/Moderation.tsx)
- **职责**：内容审核
- **功能**：
  - 内容搜索（标题/预览）
  - 状态筛选（全部/待审核/已通过/已驳回）
  - 类型筛选（全部/视频/评论/文章）
  - 内容卡片展示（缩略图、类型图标、状态标签）
  - 审核操作（通过/驳回按钮）
- **布局**：使用Sidebar组件

##### [Accounts.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/features/admin/pages/Accounts.tsx)
- **职责**：用户管理
- **功能**：
  - 用户搜索（用户名/邮箱）
  - 状态筛选（全部/活跃/已封禁/待审核）
  - 用户表格展示（头像、用户名、邮箱、状态、注册时间）
  - 封禁/解封操作
- **布局**：使用Sidebar组件

---

### 4. 组件

#### [Sidebar.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/features/admin/components/Sidebar.tsx)
- **职责**：管理后台侧边栏
- **功能**：
  - Logo和角色信息展示
  - 导航菜单（数据概览、内容审核、用户管理）
  - 当前用户信息
  - 退出登录按钮
- **样式**：白色背景，粉色渐变选中状态

#### [Empty.tsx](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/common/components/Empty.tsx)
- **职责**：空状态占位组件
- **功能**：简单的"Empty"文字展示

---

### 5. Hooks

#### [useTheme.ts](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/common/hooks/useTheme.ts)
- **职责**：主题切换
- **功能**：
  - 检测系统主题偏好
  - localStorage持久化
  - 切换light/dark主题
  - 切换时更新document.classList

---

### 6. 工具库

#### [utils.ts](file:///c:/Users/Administrator/Desktop/Bilibili模拟/src/common/utils/utils.ts)
- **职责**：通用工具函数
- **导出函数**：
  ```typescript
  function cn(...inputs: ClassValue[]): string
  ```
  - 合并clsx和tailwind-merge
  - 用于组合Tailwind CSS类名

---

## 依赖关系图

```
main.tsx
    └── App.tsx
            ├── ReactRouter (BrowserRouter/Routes/Route)
            │       ├── HomePage.tsx
            │       │       └── useStore (login, contents, currentUser)
            │       ├── VideoDetail.tsx
            │       │       └── useStore (currentUser)
            │       ├── UserLogin.tsx
            │       │       └── useStore (login)
            │       ├── UserRegister.tsx
            │       │       └── useStore (register)
            │       ├── UserProfile.tsx
            │       │       ├── useStore (currentUser, users)
            │       │       └── Link (to /creation, /video/:id)
            │       ├── CreationCenter.tsx
            │       │       ├── useStore (currentUser, contents)
            │       │       └── Link (to /user/:username)
            │       ├── AdminLogin.tsx
            │       │       └── useStore (login)
            │       ├── Dashboard.tsx
            │       │       ├── Sidebar.tsx
            │       │       │       └── useStore (currentUser, logout)
            │       │       └── useStore (users, contents)
            │       ├── Moderation.tsx
            │       │       ├── Sidebar.tsx
            │       │       └── useStore (contents, approveContent, rejectContent)
            │       └── Accounts.tsx
            │               ├── Sidebar.tsx
            │               └── useStore (users, banUser, unbanUser)
            │
            └── useStore (zustand store)
                    └── 状态：currentUser, users, contents
```

---

## 配置说明

### Vite配置 ([vite.config.ts](file:///c:/Users/Administrator/Desktop/Bilibili模拟/vite.config.ts))
```typescript
export default defineConfig({
  build: {
    sourcemap: 'hidden',  // 隐藏sourcemap
  },
  plugins: [
    react({
      babel: {
        plugins: ['react-dev-locator'],
      },
    }),
    traeBadgePlugin({...}),  // Trae Solo徽章插件
    tsconfigPaths(),          // TypeScript路径别名
  ],
})
```

### TypeScript配置 ([tsconfig.json](file:///c:/Users/Administrator/Desktop/Bilibili模拟/tsconfig.json))
- 路径别名：`@/*` → `./src/*`
- 目标：ES2020
- 严格模式：关闭（`strict: false`）

### Tailwind配置 ([tailwind.config.js](file:///c:/Users/Administrator/Desktop/Bilibili模拟/tailwind.config.js))
- darkMode：`class`
- 内容：index.html和src下所有文件

---

## 运行方式

### 安装依赖
```bash
npm install
```

### 开发模式

**普通用户端口 (5173)**：
```bash
npm run dev:user
# 访问：http://localhost:5173/
```

**管理员端口 (5174)**：
```bash
npm run dev:admin
# 访问：http://localhost:5174/
```

### 构建生产版本
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

### TypeScript类型检查
```bash
npm run check
```

---

## 默认账号

### 普通用户

| 用户名 | 密码 | 状态 |
|--------|------|------|
| admin | 123456 | 活跃 |
| bilibili_user_01 | 123456 | 活跃 |
| video_creator | 123456 | 活跃 |
| anime_fan | 123456 | 已封禁 |
| tech_reviewer | 123456 | 活跃 |
| music_lover | 123456 | 待审核 |

### 管理员账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 超级管理员 | 3256829664 | Lzf060701 |
| 审核专员 | 160846834 | Lzf060701 |

---

## 关键实现细节

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

### 无限滚动实现
使用Intersection Observer监听底部sentinel元素：
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

### 端口检测与默认路由
```typescript
const port = window.location.port;
const isAdminPort = port === '5174';
const defaultPath = isAdminPort ? '/login/admin' : '/';
```

### 密码验证
登录时验证用户名和密码：
```typescript
login: (username, password, role) => {
  const state = get();
  const user = state.users.find(u => u.username === username && u.password === password);
  if (user) {
    set({ currentUser: { username, role } });
    return true;
  }
  return false;
}
```

---

## 项目特点

1. **双端口架构**：用户端和管理端分离，通过不同端口访问
2. **B站风格UI**：粉色主题、卡片式布局、圆润设计
3. **响应式设计**：最大1400px宽度，适配多屏幕
4. **状态管理**：使用Zustand进行全局状态管理
5. **密码验证**：用户系统支持密码验证（admin/123456）
6. **路由守卫**：需要登录的页面受保护，未登录重定向
7. **无限滚动**：视频列表支持无限加载
8. **用户主页**：完整的用户个人主页，支持视频、动态、相册、收藏等标签页
9. **创作中心**：创作者管理中心，支持数据统计、作品管理、消息中心等功能
