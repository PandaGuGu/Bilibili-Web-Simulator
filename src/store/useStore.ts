import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserStatus = 'active' | 'banned' | 'pending';

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  status: UserStatus;
  createdAt: string;
  password: string;
}

export type ContentType = 'video' | 'comment' | 'article';
export type ContentStatus = 'pending' | 'approved' | 'rejected';

export interface Content {
  id: number;
  title: string;
  type: ContentType;
  status: ContentStatus;
  author: string;
  authorAvatar: string;
  submittedAt: string;
  thumbnail?: string;
  preview: string;
  views?: number;
  likes?: number;
}

export interface Comment {
  id: number;
  contentId: number;
  author: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  likes: number;
}

interface AppState {
  currentUser: { username: string; role: 'user' | 'admin' | 'moderator'; avatar?: string; nickname?: string } | null;
  users: User[];
  contents: Content[];
  comments: Comment[];
  login: (username: string, password: string, role: 'user' | 'admin' | 'moderator') => boolean;
  logout: () => void;
  setCurrentUser: (user: { username: string; role: 'user' | 'admin' | 'moderator'; avatar?: string; nickname?: string }) => void;
  register: (username: string, email: string, password: string) => boolean;
  approveContent: (id: number) => void;
  rejectContent: (id: number) => void;
  banUser: (id: number) => void;
  unbanUser: (id: number) => void;
  addContent: (content: Omit<Content, 'id'>) => void;
  updateContent: (id: number, updates: Partial<Content>) => void;
  deleteContent: (id: number) => void;
  addComment: (comment: Omit<Comment, 'id'>) => void;
  deleteComment: (id: number) => void;
  getUserByUsername: (username: string) => User | undefined;
  getContentById: (id: number) => Content | undefined;
  getCommentsByContentId: (contentId: number) => Comment[];
}

const defaultUsers: User[] = [
  { id: 1, username: 'bilibili_user_01', email: 'user01@bilibili.com', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', status: 'active', createdAt: '2024-01-15', password: '123456' },
  { id: 2, username: 'video_creator', email: 'creator@example.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', status: 'active', createdAt: '2024-02-20', password: '123456' },
  { id: 3, username: 'anime_fan', email: 'anime@example.com', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', status: 'banned', createdAt: '2024-03-10', password: '123456' },
  { id: 4, username: 'tech_reviewer', email: 'tech@example.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', status: 'active', createdAt: '2024-04-05', password: '123456' },
  { id: 5, username: 'music_lover', email: 'music@example.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', status: 'pending', createdAt: '2024-05-12', password: '123456' },
  { id: 6, username: 'admin1', email: 'admin1@example.com', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', status: 'active', createdAt: '2024-06-06', password: '123456' },
  { id: 7, username: 'admin2', email: 'admin2@example.com', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', status: 'active', createdAt: '2024-06-06', password: '123456' },
];

const defaultContents: Content[] = [
  { id: 1, title: '【教程】React 18 新特性详解', type: 'video', status: 'approved', author: 'tech_reviewer', authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', submittedAt: '2024-06-01', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop', preview: '这是一个关于 React 18 新特性的详细教程视频...', views: 123000, likes: 8234 },
  { id: 2, title: '这个UP主的视频太精彩了！', type: 'comment', status: 'approved', author: 'anime_fan', authorAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', submittedAt: '2024-06-02', preview: '强烈推荐大家看这个视频，内容非常棒！', views: 89000, likes: 5123 },
  { id: 3, title: '2024年度最佳动漫推荐', type: 'article', status: 'approved', author: 'bilibili_user_01', authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', submittedAt: '2024-06-03', thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=225&fit=crop', preview: '本文将为大家推荐2024年最值得一看的动漫作品...', views: 156000, likes: 9876 },
  { id: 4, title: '编程入门：从零开始学Python', type: 'video', status: 'approved', author: 'video_creator', authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', submittedAt: '2024-06-04', thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop', preview: '适合零基础的Python编程入门教程...', views: 87000, likes: 5123 },
  { id: 5, title: '每日音乐分享', type: 'comment', status: 'approved', author: 'music_lover', authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', submittedAt: '2024-06-05', preview: '今天给大家分享一首很好听的歌曲...', views: 34000, likes: 2345 },
  { id: 6, title: '美食制作：红烧肉教程', type: 'video', status: 'pending', author: 'video_creator', authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop', submittedAt: '2024-06-06', thumbnail: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=225&fit=crop', preview: '正宗红烧肉的做法，一学就会！', views: 0, likes: 0 },
  { id: 7, title: '数码产品开箱评测', type: 'video', status: 'pending', author: 'tech_reviewer', authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', submittedAt: '2024-06-07', thumbnail: 'https://images.unsplash.com/photo-1500000000000?w=400&h=225&fit=crop', preview: '最新款手机深度测评...', views: 0, likes: 0 },
  { id: 8, title: '健身训练计划分享', type: 'article', status: 'rejected', author: 'anime_fan', authorAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', submittedAt: '2024-06-08', thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=225&fit=crop', preview: '科学的健身计划，收藏！', views: 0, likes: 0 },
];

const defaultComments: Comment[] = [
  { id: 1, contentId: 1, author: 'anime_fan', authorAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop', text: '讲解得非常清楚！', createdAt: '2024-06-01', likes: 234 },
  { id: 2, contentId: 1, author: 'music_lover', authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop', text: '学到了很多新东西', createdAt: '2024-06-02', likes: 156 },
  { id: 3, contentId: 2, author: 'tech_reviewer', authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', text: '确实很精彩！', createdAt: '2024-06-03', likes: 89 },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: defaultUsers,
      contents: defaultContents,
      comments: defaultComments,
      
      login: (username, password, role) => {
        const state = get();
        const user = state.users.find(u => u.username === username && u.password === password);
        if (user && user.status === 'active') {
          set({ currentUser: { username, role } });
          return true;
        } else if (user && user.status === 'banned') {
          return false;
        }
        return false;
      },
      
      logout: () => {
        sessionStorage.removeItem('bilibili-token');
        set({ currentUser: null });
      },
      setCurrentUser: (user) => set({ currentUser: user }),
      
      register: (username, email, password) => {
        const state = get();
        const userExists = state.users.some(u => u.username === username);
        if (userExists) {
          return false;
        }
        const newUser: User = {
          id: state.users.length + 1,
          username,
          email,
          avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000000)}?w=100&h=100&fit=crop`,
          status: 'pending',
          createdAt: new Date().toISOString().split('T')[0],
          password,
        };
        set({ users: [...state.users, newUser] });
        return true;
      },
      
      approveContent: (id) => set((state) => ({
        contents: state.contents.map((c) => c.id === id ? { ...c, status: 'approved' as ContentStatus } : c),
      })),
      
      rejectContent: (id) => set((state) => ({
        contents: state.contents.map((c) => c.id === id ? { ...c, status: 'rejected' as ContentStatus } : c),
      })),
      
      banUser: (id) => set((state) => ({
        users: state.users.map((u) => u.id === id ? { ...u, status: 'banned' as UserStatus } : u),
      })),
      
      unbanUser: (id) => set((state) => ({
        users: state.users.map((u) => u.id === id ? { ...u, status: 'active' as UserStatus } : u),
      })),
      
      addContent: (content) => set((state) => ({
        contents: [...state.contents, { ...content, id: state.contents.length + 1 }],
      })),
      
      updateContent: (id, updates) => set((state) => ({
        contents: state.contents.map((c) => c.id === id ? { ...c, ...updates } : c),
      })),
      
      deleteContent: (id) => set((state) => ({
        contents: state.contents.filter((c) => c.id !== id),
      })),
      
      addComment: (comment) => set((state) => ({
        comments: [...state.comments, { ...comment, id: state.comments.length + 1 }],
      })),
      
      deleteComment: (id) => set((state) => ({
        comments: state.comments.filter((c) => c.id !== id),
      })),
      
      getUserByUsername: (username) => {
        return get().users.find(u => u.username === username);
      },
      
      getContentById: (id) => {
        return get().contents.find(c => c.id === id);
      },
      
      getCommentsByContentId: (contentId) => {
        return get().comments.filter(c => c.contentId === contentId);
      },
    }),
    {
      name: 'bilibili-storage',
    }
  )
);
