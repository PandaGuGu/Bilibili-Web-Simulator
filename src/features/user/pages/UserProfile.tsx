import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import UserDropdown from '@/features/user/components/UserDropdown'
import MessageDropdown from '@/features/user/components/MessageDropdown'
import FeedDropdown from '@/features/user/components/FeedDropdown'
import FavoriteDropdown from '@/features/user/components/FavoriteDropdown'
import HistoryDropdown from '@/features/user/components/HistoryDropdown'
import UploadDropdown from '@/features/user/components/UploadDropdown'
import {
  Search, Video, Edit, CheckCircle2, User as UserIcon,
  Play, ThumbsUp, Eye, MoreHorizontal, Star, Grid,
  Flame, Clock, Heart, Share2, MessageCircle, Download, Bell
} from 'lucide-react'

type TabKey = 'home' | 'feed' | 'video' | 'collection' | 'favorite' | 'bangumi' | 'settings'

export default function UserProfile() {
  const { username } = useParams()
  const currentUser = useStore((state) => state.currentUser)
  const users = useStore((state) => state.users)
  const contents = useStore((state) => state.contents)
  const [activeTab, setActiveTab] = useState<TabKey>('home')

  const profileUser = username ? users.find(u => u.username === username) : users[0]
  const isOwner = currentUser?.username === profileUser?.username

  const userVideos = contents.filter(c => c.author === profileUser?.username && c.type === 'video' && c.status === 'approved')
  const userArticles = contents.filter(c => c.author === profileUser?.username && c.type === 'article' && c.status === 'approved')

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'home',      label: '主页' },
    { key: 'feed',      label: '动态' },
    { key: 'video',     label: '投稿' },
    { key: 'collection',label: '合集和系列' },
    { key: 'favorite',  label: '收藏' },
    { key: 'bangumi',   label: '追番追剧' },
    { key: 'settings',  label: '设置' },
  ]

  // 模拟统计数据
  const stats = {
    following: 157,
    followers: 16,
    likes: 6234,
    views: 15600,
  }

  // 模拟动态 feed
  const userFeeds = [
    {
      id: 1,
      type: 'video',
      time: '6分钟前',
      text: '刚刚发布了新视频！',
      video: { title: '【教学】React 18 新特性详解', cover: userVideos[0]?.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop' },
    },
    {
      id: 2,
      type: 'text',
      time: '2小时前',
      text: '感谢大家的支持，粉丝突破16！我会继续努力的~',
    },
    {
      id: 3,
      type: 'bangumi',
      time: '1天前',
      text: '追番了《鬼灭之刃》最新一季',
    },
    {
      id: 4,
      type: 'article',
      time: '2天前',
      text: '发表了专栏文章',
      article: { title: '2024年度最佳动漫推荐' },
    },
  ]

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">用户不存在</h2>
          <Link to="/" className="text-[#FB7299] hover:text-pink-600">返回首页</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      {/* ========== 顶部导航（与首页一致） ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="flex items-center h-14 justify-between">
            <nav className="hidden md:flex items-center gap-3 text-sm">
              <Link to="/" className="text-gray-800 hover:text-[#FB7299] font-medium">首页</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">番剧</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">直播</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">游戏中心</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">会员购</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">漫画</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">赛事</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299] flex items-center gap-1">
                <Download className="w-4 h-4" />下载客户端
              </Link>
            </nav>

            <div className="flex-1 max-w-[400px] mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索你感兴趣的内容"
                  className="w-full h-10 pl-4 pr-12 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:border-[#FB7299] focus:bg-white transition-all text-gray-800"
                />
                <button className="absolute right-0 top-0 w-12 h-10 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-r-full flex items-center justify-center hover:opacity-90 transition-opacity">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {currentUser ? (
                <UserDropdown
                  currentUser={currentUser}
                  avatar={currentUser.username ? users.find(u => u.username === currentUser.username)?.avatar : undefined}
                />
              ) : (
                <Link to="/login/user" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] flex items-center justify-center group-hover:border-[#FB7299] transition-colors">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">登录</span>
                </Link>
              )}

              <div className="flex items-center gap-3">
                <button className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:border-[#FB7299] transition-colors">
                    <span className="text-gray-700 font-bold text-base group-hover:text-[#FB7299]">大</span>
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">大会员</span>
                </button>

                <MessageDropdown currentUser={currentUser} />

                <FeedDropdown currentUser={currentUser} />

                <FavoriteDropdown currentUser={currentUser} />

                <HistoryDropdown currentUser={currentUser} />

                <Link to="/creation" className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700 group-hover:text-[#FB7299]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C9.5 2 7 3.5 7 6C7 7.5 8 9 9 10.5C9.5 11.25 9.75 12 10 13H14C14.25 12 14.5 11.25 15 10.5C16 9 17 7.5 17 6C17 3.5 14.5 2 12 2Z" />
                      <path d="M10 14H14L15 18H9L10 14Z" />
                      <path d="M11 18L11 20H13L13 18" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">创作中心</span>
                </Link>

                <UploadDropdown currentUser={currentUser} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========== 顶部背景横幅 ========== */}
      <div className="relative h-[200px] bg-gradient-to-r from-[#00a1d6] via-[#5cadff] to-[#FB7299] overflow-hidden mt-16">
        {/* 装饰元素 */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute right-40 bottom-10 w-32 h-32 bg-white/10 rounded-full" />
      </div>

      {/* ========== 用户信息区 ========== */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-start gap-6 -mt-20 pb-0 pt-0">
            {/* 头像 */}
            <div className="relative flex-shrink-0">
              <img
                src={profileUser.avatar}
                alt={profileUser.username}
                className="w-[120px] h-[120px] rounded-full border-4 border-white shadow-lg object-cover"
              />
              {profileUser.status === 'active' && (
                <CheckCircle2 className="absolute bottom-1 right-1 w-6 h-6 text-[#00c0ff] drop-shadow-sm" fill="white" />
              )}
            </div>

            {/* 用户名 + 签名 */}
            <div className="flex-1 pt-3">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">{profileUser.username}</h1>
                <span className="text-xs text-gray-400">UID:{profileUser.id}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1.5">
                这是一个B站模拟用户，欢迎来到我的个人主页~
              </p>
              {/* 统计 */}
              <div className="flex gap-8 mt-3 text-sm">
                <Link to="/feed" className="text-gray-500 hover:text-[#FB7299]">
                  <span className="font-bold text-gray-800">{stats.following}</span> 关注
                </Link>
                <div className="text-gray-500">
                  <span className="font-bold text-gray-800">{stats.followers}</span> 粉丝
                </div>
                <div className="text-gray-500">
                  <span className="font-bold text-gray-800">{stats.likes.toLocaleString()}</span> 获赞
                </div>
                <div className="text-gray-500">
                  <span className="font-bold text-gray-800">{stats.views.toLocaleString()}</span> 播放
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-3">
              {isOwner ? (
                <>
                  <button className="px-6 py-2 bg-[#FB7299] text-white rounded-full text-sm hover:bg-pink-600 transition-colors">
                    编辑资料
                  </button>
                  <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
                    设置
                  </button>
                </>
              ) : (
                <>
                  <button className="px-6 py-2 bg-[#FB7299] text-white rounded-full text-sm hover:bg-pink-600 transition-colors">
                    + 关注
                  </button>
                  <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
                    发消息
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 导航标签 */}
          <div className="flex gap-8 mt-4 ml-[144px]" style={{ maxWidth: 'calc(100% - 144px)' }}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-[#FB7299] text-[#FB7299] font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========== 内容主体 ========== */}
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* ---------- 左侧边栏 ---------- */}
          <aside className="w-[260px] flex-shrink-0 space-y-4">
            {/* 个人信息 */}
            <div className="bg-white rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-3">个人信息</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">UID</span>
                  <span className="text-gray-800">{profileUser.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">注册日期</span>
                  <span className="text-gray-800">{profileUser.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">状态</span>
                  <span className="text-green-600">{profileUser.status === 'active' ? '活跃' : '封禁'}</span>
                </div>
              </div>
            </div>

            {/* 等级 */}
            <div className="bg-white rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-3">会员等级</div>
              <div className="flex items-center gap-3">
                <span className="bg-[#FB7299] text-white text-xs px-2 py-0.5 rounded">Lv.6</span>
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded">正式会员</span>
              </div>
            </div>

            {/* 数据总览 */}
            <div className="bg-white rounded-lg p-4">
              <div className="text-gray-400 text-xs mb-3">数据总览</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">{stats.following}</div>
                  <div className="text-xs text-gray-500">关注数</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">{stats.followers}</div>
                  <div className="text-xs text-gray-500">粉丝数</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">{stats.likes.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">获赞数</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">{stats.views.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">播放数</div>
                </div>
              </div>
            </div>
          </aside>

          {/* ---------- 右侧内容 ---------- */}
          <main className="flex-1 min-w-0">
            <div className="flex gap-8">
              {/* 主内容 */}
              <div className="flex-1 min-w-0">
                {/* ===== 主页 Tab ===== */}
                {activeTab === 'home' && (
                  <div className="space-y-4">
                    {/* 公告 */}
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bell className="w-4 h-4 text-[#FB7299]" />
                        <span className="text-sm font-bold text-gray-800">公告</span>
                      </div>
                      <p className="text-sm text-gray-600">欢迎来到我的主页！这里会分享编程技术、动漫推荐和日常生活的各种内容。</p>
                    </div>

                    {/* 视频列表 */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-base font-bold text-gray-800">投稿视频</h2>
                        <Link to={`/user/${profileUser.username}?tab=video`} className="text-xs text-gray-400 hover:text-[#FB7299]">查看更多 &gt;</Link>
                      </div>
                      {userVideos.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                          {userVideos.slice(0, 3).map((video) => (
                            <Link key={video.id} to={`/video/${video.id}`} className="group">
                              <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                  <Play className="w-10 h-10 text-white" fill="white" />
                                </div>
                              </div>
                              <h3 className="mt-2 text-sm text-gray-800 line-clamp-2 group-hover:text-[#FB7299] transition-colors">{video.title}</h3>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{video.views?.toLocaleString() || 0}</span>
                                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{video.likes?.toLocaleString() || 0}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-gray-400 text-sm">暂无视频</div>
                      )}
                    </div>
                  </div>
                )}

                {/* ===== 动态 Tab ===== */}
                {activeTab === 'feed' && (
                  <div className="space-y-4">
                    {userFeeds.map((feed) => (
                      <div key={feed.id} className="bg-white rounded-lg p-4">
                        {/* 时间 */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-400">{feed.time}</span>
                          <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal className="w-4 h-4" /></button>
                        </div>

                        {/* 内容 */}
                        <p className="text-sm text-gray-700 mb-3">{feed.text}</p>

                        {/* 视频卡片 */}
                        {feed.type === 'video' && feed.video && (
                          <Link to={`/video/${profileUser.id}`} className="block bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                <img src={feed.video.cover} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <Play className="w-8 h-8 text-white" />
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-500 mb-1">{profileUser.username} 投稿了视频</div>
                                <div className="text-sm text-[#FB7299]">{feed.video.title}</div>
                              </div>
                            </div>
                          </Link>
                        )}

                        {/* 番剧卡片 */}
                        {feed.type === 'bangumi' && (
                          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                            📺 {feed.text}
                          </div>
                        )}

                        {/* 专栏卡片 */}
                        {feed.type === 'article' && feed.article && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">{profileUser.username} 发表了专栏</div>
                            <div className="text-sm text-[#FB7299]">{feed.article.title}</div>
                          </div>
                        )}

                        {/* 互动 */}
                        <div className="flex items-center gap-6 mt-3 text-gray-400">
                          <button className="flex items-center gap-1 hover:text-[#FB7299] transition-colors">
                            <Heart className="w-4 h-4" /><span className="text-xs">12</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-[#FB7299] transition-colors">
                            <MessageCircle className="w-4 h-4" /><span className="text-xs">3</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-[#FB7299] transition-colors">
                            <Share2 className="w-4 h-4" /><span className="text-xs">分享</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ===== 投稿 Tab ===== */}
                {activeTab === 'video' && (
                  <div className="space-y-4">
                    {userVideos.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {userVideos.map((video) => (
                          <Link key={video.id} to={`/video/${video.id}`} className="group">
                            <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                <Play className="w-10 h-10 text-white" fill="white" />
                              </div>
                            </div>
                            <h3 className="mt-2 text-sm text-gray-800 line-clamp-2 group-hover:text-[#FB7299] transition-colors">{video.title}</h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                              <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{(video.views || 0).toLocaleString()}</span>
                              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{(video.likes || 0).toLocaleString()}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 text-gray-400">
                        <Video className="w-12 h-12 mx-auto mb-3" />
                        <p>{isOwner ? '还没有投稿过视频' : '该用户暂无视频投稿'}</p>
                        {isOwner && (
                          <Link to="/creation" className="mt-3 inline-block px-6 py-2 bg-[#FB7299] text-white rounded-full text-sm">发布视频</Link>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ===== 合集和系列 Tab ===== */}
                {activeTab === 'collection' && (
                  <div className="text-center py-16 text-gray-400">
                    <Grid className="w-12 h-12 mx-auto mb-3" />
                    <p>暂无合集和系列</p>
                  </div>
                )}

                {/* ===== 收藏 Tab ===== */}
                {activeTab === 'favorite' && (
                  <div className="text-center py-16 text-gray-400">
                    <Star className="w-12 h-12 mx-auto mb-3" />
                    <p>暂无公开收藏夹</p>
                  </div>
                )}

                {/* ===== 追番追剧 Tab ===== */}
                {activeTab === 'bangumi' && (
                  <div className="text-center py-16 text-gray-400">
                    <Flame className="w-12 h-12 mx-auto mb-3" />
                    <p>暂无追番追剧记录</p>
                  </div>
                )}

                {/* ===== 设置 Tab ===== */}
                {activeTab === 'settings' && (
                  <div className="bg-white rounded-lg p-6 space-y-4">
                    <h2 className="font-bold text-gray-800">隐私设置</h2>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer">
                        <span className="text-sm text-gray-700">隐藏我的动态</span>
                        <input type="checkbox" className="accent-[#FB7299] w-4 h-4" />
                      </label>
                      <label className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer">
                        <span className="text-sm text-gray-700">隐藏我的收藏</span>
                        <input type="checkbox" className="accent-[#FB7299] w-4 h-4" />
                      </label>
                      <label className="flex items-center justify-between py-3 border-b border-gray-100 cursor-pointer">
                        <span className="text-sm text-gray-700">隐藏我的追番</span>
                        <input type="checkbox" className="accent-[#FB7299] w-4 h-4" />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* 右侧小栏 — 只在主页/动态tab显示 */}
              {(activeTab === 'home' || activeTab === 'feed') && (
                <div className="w-[200px] flex-shrink-0 space-y-4">
                  {/* 粉丝视角 / 新访客视角 */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                      <span>访客视角</span>
                      <span className="cursor-pointer hover:text-[#FB7299]">粉丝视角 &gt;</span>
                    </div>
                    <p className="text-sm text-gray-600">这是访客看到的你的主页。你可以在这里发布自己的动态。</p>
                  </div>

                  {/* 创作中心入口 */}
                  <Link to="/creation" className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] rounded-lg flex items-center justify-center">
                        <Edit className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-800">创作中心</div>
                        <div className="text-xs text-gray-400">查看详细数据</div>
                      </div>
                    </div>
                  </Link>

                  {/* 公告 */}
                  <div className="bg-white rounded-lg p-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-2">公告</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      欢迎来到个人主页！这是一个B站模拟项目，所有数据均为模拟数据。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* ========== 底部 ========== */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-[1200px] mx-auto px-4 py-6 text-center text-xs text-gray-400">
          © 2024 哔哩哔哩 (゜-゜)つロ 干杯~ All Rights Reserved.
        </div>
      </footer>
    </div>
  )
}
