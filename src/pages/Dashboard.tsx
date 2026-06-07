import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/index'
import { useLiveStore, type LiveRoom } from '@/store/live'
import { api } from '@/api/client'
import { videoLink } from '@/utils/tracking'
import MessageDropdown from '@/components/MessageDropdown'
import FeedDropdown from '@/components/FeedDropdown'
import FavoriteDropdown from '@/components/FavoriteDropdown'
import HistoryDropdown from '@/components/HistoryDropdown'
import UploadDropdown from '@/components/UploadDropdown'
import {
  ChartBar, Video, Eye, ThumbsUp, Users, TrendingUp, MessageSquare,
  Clock, CheckCircle2, XCircle, AlertCircle, Play, Radio, Calendar,
  Search, Bell, Download, Settings, MoreHorizontal, Edit, UserCheck,
  UserX, Trash2, Plus, Folder, Star, Heart, FileText, ExternalLink,
  Filter, RotateCcw, FileVideo, MessageCircle, BookOpen, Database
} from 'lucide-react'

interface ContentItem {
  id: number
  title: string
  type: 'video' | 'article' | 'comment'
  status: 'pending' | 'approved' | 'rejected'
  author: string
  authorAvatar: string
  submittedAt: string
  thumbnail?: string
  preview: string
  views?: number
  likes?: number
}

export default function Dashboard() {
  const currentUser = useStore((s) => s.currentUser)
  const users = useStore((s) => s.users)
  const logout = useStore((s) => s.logout)
  const banUser = useStore((s) => s.banUser)
  const unbanUser = useStore((s) => s.unbanUser)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const liveRooms = useLiveStore((s) => s.liveRooms)
  const updateLiveRoom = useLiveStore((s) => s.updateLiveRoom)
  const deleteLiveRoom = useLiveStore((s) => s.deleteLiveRoom)
  const [apiContents, setApiContents] = useState<ContentItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'video' | 'article' | 'comment'>('all')
  const [contentStatusFilter, setContentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    async function loadContents() {
      const res = await api.getAllContents()
      if (res.success) setApiContents(res.contents)
    }
    loadContents()
  }, [])

  const handleApprove = async (c: ContentItem) => {
    if (c.type === 'comment') return
    const res = c.type === 'video'
      ? await api.reviewVideo(c.id, 'approved')
      : await api.reviewArticle(c.id, 'approved')
    if (res.success) {
      setApiContents(prev => prev.map(item => item.id === c.id ? { ...item, status: 'approved' as const } : item))
    }
  }

  const handleReject = async (c: ContentItem) => {
    if (c.type === 'comment') return
    const res = c.type === 'video'
      ? await api.reviewVideo(c.id, 'rejected')
      : await api.reviewArticle(c.id, 'rejected')
    if (res.success) {
      setApiContents(prev => prev.map(item => item.id === c.id ? { ...item, status: 'rejected' as const } : item))
    }
  }

  const handleBan = async (userId: number) => {
    const res = await api.updateUser(userId, { status: 'banned' })
    if (res.success) banUser(userId)
  }

  const handleUnban = async (userId: number) => {
    const res = await api.updateUser(userId, { status: 'active' })
    if (res.success) unbanUser(userId)
  }

  const stats = {
    totalUsers: users.length,
    totalVideos: apiContents.filter(c => c.type === 'video').length || 6,
    totalViews: '1,256,340',
    todayViews: '+2,345',
    pendingCount: apiContents.filter(c => c.status === 'pending').length,
    bannedCount: users.filter(u => u.status === 'banned').length,
    livingCount: liveRooms.filter(r => r.status === 'living').length,
    totalLikes: '89,200',
  }

  const tabs = [
    { id: 'overview', label: '数据总览', icon: ChartBar },
    { id: 'users', label: '用户管理', icon: Users },
    { id: 'content', label: '内容审核', icon: FileText },
    { id: 'live', label: '直播管理', icon: Radio },
    { id: 'messages', label: '消息中心', icon: MessageSquare },
  ]

  const pendingContents = apiContents.filter(c => c.status === 'pending')
  const allContents = apiContents

  const statusTag = (s: string) => {
    const m: Record<string, { cls: string; text: string; icon: JSX.Element }> = {
      approved: { cls: 'text-green-600 bg-green-50', text: '已通过', icon: <CheckCircle2 className="w-3 h-3" /> },
      pending: { cls: 'text-yellow-600 bg-yellow-50', text: '审核中', icon: <Clock className="w-3 h-3" /> },
      rejected: { cls: 'text-red-600 bg-red-50', text: '未通过', icon: <XCircle className="w-3 h-3" /> },
    }
    const v = m[s] || m.approved
    return <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${v.cls}`}>{v.icon}{v.text}</span>
  }

  const liveStatusTag = (s: string) => {
    const m: Record<string, { cls: string; text: string }> = {
      living: { cls: 'text-red-600 bg-red-50', text: '直播中' },
      preview: { cls: 'text-blue-600 bg-blue-50', text: '预告中' },
      ended: { cls: 'text-gray-500 bg-gray-100', text: '已结束' },
    }
    const v = m[s] || m.ended
    return <span className={`px-2 py-0.5 rounded-full text-xs ${v.cls}`}>{v.text}</span>
  }

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="min-h-screen bg-[#f1f2f3]">
      {/* ====== 顶部导航（与前台统一） ====== */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="flex items-center h-14 justify-between">
            <nav className="hidden md:flex items-center gap-3 text-sm">
              <Link to="/dashboard/Datamanage" className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-md">
                <Database className="w-4 h-4" />后台数据管理
              </Link>
            </nav>

            <div className="flex-1 max-w-[400px] mx-4">
              <div className="relative">
                <input type="text" placeholder="搜索内容/用户..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-12 bg-gray-100 rounded-full text-sm focus:outline-none focus:border-[#FB7299] focus:bg-white transition-all" />
                <button className="absolute right-0 top-0 w-12 h-10 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-r-full flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] flex items-center justify-center overflow-hidden">
                <span className="text-white text-sm font-bold">{currentUser?.username?.[0]?.toUpperCase() || 'A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageDropdown currentUser={currentUser} />
                <FeedDropdown currentUser={currentUser} />
                <FavoriteDropdown currentUser={currentUser} />
                <HistoryDropdown currentUser={currentUser} />
                <Link to="/creation" className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700 group-hover:text-[#FB7299]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C9.5 2 7 3.5 7 6C7 7.5 8 9 9 10.5C9.5 11.25 9.75 12 10 13H14C14.25 12 14.5 11.25 15 10.5C16 9 17 7.5 17 6C17 3.5 14.5 2 12 2Z" />
                      <path d="M10 14H14L15 18H9L10 14Z" /><path d="M11 18L11 20H13L13 18" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">创作中心</span>
                </Link>
                <UploadDropdown currentUser={currentUser} />
                <button onClick={handleLogout} className="ml-2 px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm hover:bg-gray-300 transition-colors">
                  退出
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ====== 主体 ====== */}
      <div className="max-w-[1400px] mx-auto px-4 pt-24 pb-8">
        {/* 快捷入口 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] text-white rounded-xl">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"><Radio className="w-6 h-6" /></div>
            <div>
              <div className="font-semibold">正在直播</div>
              <div className="text-xs opacity-80">{stats.livingCount} 个直播间在线</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center"><Clock className="w-6 h-6 text-yellow-500" /></div>
            <div>
              <div className="font-semibold text-gray-800">待审核</div>
              <div className="text-xs text-gray-500">{stats.pendingCount} 个内容待审</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center"><UserX className="w-6 h-6 text-red-500" /></div>
            <div>
              <div className="font-semibold text-gray-800">封禁用户</div>
              <div className="text-xs text-gray-500">{stats.bannedCount} 个封禁账号</div>
            </div>
          </div>
        </div>

        {/* 标签栏 */}
        <div className="flex gap-6 mb-6 border-b border-gray-200">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 pb-3 text-sm transition-colors border-b-2 ${
                activeTab === t.id ? 'border-[#FB7299] text-[#FB7299] font-medium' : 'border-transparent text-gray-600 hover:text-gray-800'}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* ---- 左侧主内容 ---- */}
          <div className="flex-1 space-y-6">
            {/* ===== 数据总览 ===== */}
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-[#FB7299] mb-2"><Users className="w-5 h-5" /><span className="text-sm">总用户</span></div>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-blue-500 mb-2"><Video className="w-5 h-5" /><span className="text-sm">视频数</span></div>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalVideos}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-green-500 mb-2"><Eye className="w-5 h-5" /><span className="text-sm">总播放</span></div>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalViews}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-red-500 mb-2"><Radio className="w-5 h-5" /><span className="text-sm">直播中</span></div>
                    <p className="text-2xl font-bold text-gray-800">{stats.livingCount}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="font-bold text-gray-800 mb-4">内容状态分布</h2>
                  <div className="flex gap-4">
                    <div className="flex-1 text-center py-3 bg-green-50 rounded-lg"><div className="text-xl font-bold text-green-600">{apiContents.filter(c=>c.status==='approved').length}</div><div className="text-xs text-gray-500">已通过</div></div>
                    <div className="flex-1 text-center py-3 bg-yellow-50 rounded-lg"><div className="text-xl font-bold text-yellow-600">{stats.pendingCount}</div><div className="text-xs text-gray-500">审核中</div></div>
                    <div className="flex-1 text-center py-3 bg-red-50 rounded-lg"><div className="text-xl font-bold text-red-600">{apiContents.filter(c=>c.status==='rejected').length}</div><div className="text-xs text-gray-500">已驳回</div></div>
                  </div>
                </div>
              </>
            )}

            {/* ===== 用户管理 ===== */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-bold text-gray-800">用户列表（{users.length}）</h2>
                  <div className="flex gap-2 text-sm">
                    <button className="px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200">全部</button>
                    <button className="px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200">活跃</button>
                    <button className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">封禁</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs text-gray-500">
                      <tr><th className="py-3 px-4 text-left">用户</th><th className="py-3 px-4 text-left">注册日期</th><th className="py-3 px-4 text-left">状态</th><th className="py-3 px-4 text-left">操作</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.filter(u => u.username !== 'admin').map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                            <span className="text-sm font-medium text-gray-800">{u.username}</span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">{u.createdAt}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${u.status==='active'?'bg-green-50 text-green-600':'bg-red-50 text-red-600'}`}>
                              {u.status==='active'?'活跃':'封禁'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {u.status === 'active' ? (
                              <button onClick={() => handleBan(u.id)} className="flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded"><UserX className="w-3 h-3" />封禁</button>
                            ) : (
                              <button onClick={() => handleUnban(u.id)} className="flex items-center gap-1 text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded"><UserCheck className="w-3 h-3" />解封</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== 内容审核 ===== */}
            {activeTab === 'content' && (
              <div className="space-y-4">
                {/* 筛选栏 */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    {/* 类型筛选 */}
                    <div className="flex items-center gap-1">
                      <Filter className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500 mr-2">类型:</span>
                      {[
                        { id: 'all', label: '全部', icon: null },
                        { id: 'video', label: '视频', icon: <FileVideo className="w-3.5 h-3.5" /> },
                        { id: 'article', label: '文章', icon: <BookOpen className="w-3.5 h-3.5" /> },
                        { id: 'comment', label: '评论', icon: <MessageCircle className="w-3.5 h-3.5" /> },
                      ].map((f) => (
                        <button key={f.id} onClick={() => setContentTypeFilter(f.id as typeof contentTypeFilter)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors ${
                            contentTypeFilter === f.id ? 'bg-[#FB7299] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {f.icon}{f.label}
                        </button>
                      ))}
                    </div>
                    <div className="w-px h-6 bg-gray-200" />
                    {/* 状态筛选 */}
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500 mr-2">状态:</span>
                      {[
                        { id: 'all', label: '全部' },
                        { id: 'pending', label: '审核中' },
                        { id: 'approved', label: '已通过' },
                        { id: 'rejected', label: '未通过' },
                      ].map((f) => (
                        <button key={f.id} onClick={() => setContentStatusFilter(f.id as typeof contentStatusFilter)}
                          className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                            contentStatusFilter === f.id
                              ? (f.id === 'approved' ? 'bg-green-500 text-white' : f.id === 'rejected' ? 'bg-red-500 text-white' : f.id === 'pending' ? 'bg-yellow-500 text-white' : 'bg-[#FB7299] text-white')
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {f.label}
                        </button>
                      ))}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {(() => {
                          const filtered = apiContents.filter(c => {
                            const typeMatch = contentTypeFilter === 'all' || c.type === contentTypeFilter
                            const statusMatch = contentStatusFilter === 'all' || c.status === contentStatusFilter
                            return typeMatch && statusMatch
                          })
                          return `共 ${filtered.length} 条`
                        })()}
                      </span>
                      {(contentTypeFilter !== 'all' || contentStatusFilter !== 'all') && (
                        <button onClick={() => { setContentTypeFilter('all'); setContentStatusFilter('all') }}
                          className="flex items-center gap-1 text-xs text-[#FB7299] hover:underline">
                          <RotateCcw className="w-3 h-3" />重置
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 内容卡片列表 */}
                <div className="grid grid-cols-1 gap-3">
                  {apiContents
                    .filter(c => {
                      const typeMatch = contentTypeFilter === 'all' || c.type === contentTypeFilter
                      const statusMatch = contentStatusFilter === 'all' || c.status === contentStatusFilter
                      return typeMatch && statusMatch
                    })
                    .map((c, ci) => {
                      const linkPath = c.type === 'video'
                        ? videoLink(c.id, 'dashboard', ci)
                        : c.type === 'article'
                          ? `/article/${c.id}`
                          : videoLink(c.id, 'dashboard', ci) // comments link to parent video for now

                      return (
                        <div key={c.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                          <div className="flex flex-col sm:flex-row">
                            {/* 缩略图区域 - 可点击跳转 */}
                            <Link to={linkPath} target="_blank" className="relative sm:w-48 flex-shrink-0 group overflow-hidden bg-gray-100">
                              <div className="aspect-video sm:h-full overflow-hidden">
                                <img
                                  src={c.thumbnail || `https://images.unsplash.com/photo-${1500000000000 + c.id * 1000}?w=400&h=225&fit=crop`}
                                  alt={c.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                  <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                              {/* 类型角标 */}
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white">
                                {c.type === 'video' ? '视频' : c.type === 'article' ? '文章' : '评论'}
                              </span>
                              {/* 时长(仅视频) */}
                              {c.type === 'video' && (
                                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] bg-black/70 text-white">
                                  12:34
                                </span>
                              )}
                            </Link>

                            {/* 信息区域 */}
                            <div className="flex-1 p-4 flex flex-col min-w-0">
                              {/* 标题行 - 可点击 */}
                              <Link to={linkPath} target="_blank" className="group/title">
                                <h3 className="font-semibold text-gray-800 group-hover/title:text-[#FB7299] transition-colors line-clamp-2 leading-snug">
                                  {c.title}
                                </h3>
                              </Link>

                              {/* 预览文本 */}
                              <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">
                                {c.preview}
                              </p>

                              {/* 元数据行 */}
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-400">
                                <div className="flex items-center gap-1.5">
                                  <img src={c.authorAvatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                                  <span className="text-gray-600 font-medium">{c.author}</span>
                                </div>
                                <span>|</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{c.submittedAt}</span>
                                {(c.views ?? 0) > 0 && (
                                  <>
                                    <span>|</span>
                                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{c.views!.toLocaleString()}</span>
                                  </>
                                )}
                                {(c.likes ?? 0) > 0 && (
                                  <>
                                    <span>|</span>
                                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{c.likes!.toLocaleString()}</span>
                                  </>
                                )}
                              </div>

                              {/* 状态 + 操作行 */}
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                  {statusTag(c.status)}
                                  <Link to={linkPath} target="_blank"
                                    className="flex items-center gap-1 text-xs text-[#FB7299] hover:underline ml-2">
                                    <ExternalLink className="w-3 h-3" />查看详情
                                  </Link>
                                </div>
                                <div className="flex items-center gap-2">
                                  {c.status === 'pending' && (
                                    <>
                                      <button onClick={(e) => { e.preventDefault(); handleApprove(c) }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-full text-xs hover:bg-green-600 transition-colors">
                                        <CheckCircle2 className="w-3.5 h-3.5" />通过
                                      </button>
                                      <button onClick={(e) => { e.preventDefault(); handleReject(c) }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors">
                                        <XCircle className="w-3.5 h-3.5" />驳回
                                      </button>
                                    </>
                                  )}
                                  {c.status === 'approved' && (
                                    <button onClick={(e) => { e.preventDefault(); handleReject(c) }}
                                      className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-500 rounded-full text-xs hover:bg-red-50 transition-colors">
                                      <XCircle className="w-3.5 h-3.5" />撤销
                                    </button>
                                  )}
                                  {c.status === 'rejected' && (
                                    <button onClick={(e) => { e.preventDefault(); handleApprove(c) }}
                                      className="flex items-center gap-1 px-3 py-1.5 border border-green-300 text-green-500 rounded-full text-xs hover:bg-green-50 transition-colors">
                                      <CheckCircle2 className="w-3.5 h-3.5" />重新通过
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>

                {/* 空状态 */}
                {apiContents.filter(c => {
                  const typeMatch = contentTypeFilter === 'all' || c.type === contentTypeFilter
                  const statusMatch = contentStatusFilter === 'all' || c.status === contentStatusFilter
                  return typeMatch && statusMatch
                }).length === 0 && (
                  <div className="bg-white rounded-xl p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-400">没有匹配的内容</p>
                  </div>
                )}
              </div>
            )}

            {/* ===== 直播管理 ===== */}
            {activeTab === 'live' && (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-bold text-gray-800">直播管理（{liveRooms.length}）</h2>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#FB7299] text-white rounded-lg hover:bg-pink-600 text-sm"><Plus className="w-4 h-4" />创建直播间</button>
                </div>
                <div className="divide-y">
                  {liveRooms.map((room) => (
                    <div key={room.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                      <div className="relative w-32 h-18 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <img src={room.coverUrl} className="w-full h-full object-cover" alt="" />
                        {room.status === 'living' && <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1 rounded">● LIVE</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 truncate">{room.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span>主播ID: {room.userId}</span>
                          <span><Eye className="w-3 h-3 inline" /> {room.currentViewerCount.toLocaleString()}</span>
                          <span>❤️ {room.likeCount.toLocaleString()}</span>
                          {room.startedAt && <span>开播: {new Date(room.startedAt).toLocaleTimeString('zh-CN')}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {liveStatusTag(room.status)}
                        {room.status === 'living' && (
                          <button onClick={() => updateLiveRoom(room.id, { status: 'ended', endedAt: new Date().toISOString() })}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="关闭直播"><XCircle className="w-5 h-5" /></button>
                        )}
                        <button onClick={() => deleteLiveRoom(room.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="删除"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== 消息中心 ===== */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b"><h2 className="font-bold text-gray-800">系统消息</h2></div>
                <div className="divide-y">
                  {[
                    { type: 'system', title: '系统维护通知', content: '后台系统将于6月7日凌晨2:00-4:00进行维护', time: '今天', unread: true },
                    { type: 'report', title: '内容举报', content: '用户"video_creator"举报视频ID#4包含违规内容', time: '2小时前', unread: true },
                    { type: 'apply', title: '创作者认证申请', content: '用户"bilibili_user_01"申请成为认证创作者', time: '昨天', unread: false },
                  ].map((msg, i) => (
                    <div key={i} className={`p-4 flex items-start gap-3 ${msg.unread ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.type==='system'?'bg-blue-100 text-blue-600':msg.type==='report'?'bg-red-100 text-red-600':'bg-green-100 text-green-600'}`}>
                        {msg.type==='system'?<AlertCircle className="w-5 h-5"/>:msg.type==='report'?<XCircle className="w-5 h-5"/>:<CheckCircle2 className="w-5 h-5"/>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between"><p className="font-medium text-gray-800">{msg.title}</p><span className="text-xs text-gray-500">{msg.time}</span></div>
                        <p className="text-sm text-gray-600 mt-1">{msg.content}</p>
                      </div>
                      {msg.unread && <span className="w-2 h-2 bg-blue-500 rounded-full mt-2"/>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ---- 右侧边栏 ---- */}
          <aside className="w-64 flex-shrink-0 space-y-4">
            <div className="bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] rounded-xl p-5 text-white">
              <h3 className="font-bold mb-2">欢迎回来</h3>
              <p className="text-sm opacity-90">{currentUser?.username || '管理员'}</p>
              <div className="mt-3 pt-3 border-t border-white/20">
                <div className="text-xs opacity-80">角色: {currentUser?.role === 'moderator' ? '审核专员' : '超级管理员'}</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">快捷操作</h3>
              <div className="space-y-2">
                <button onClick={() => setActiveTab('content')} className="w-full flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"><FileText className="w-4 h-4" />内容审核</button>
                <button onClick={() => setActiveTab('users')} className="w-full flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"><Users className="w-4 h-4" />用户管理</button>
                <button onClick={() => setActiveTab('live')} className="w-full flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"><Radio className="w-4 h-4" />直播管理</button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">系统状态</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">在线用户</span><span className="text-green-600 font-medium">128</span></div>
                <div className="flex justify-between"><span className="text-gray-500">今日投稿</span><span className="text-gray-800 font-medium">24</span></div>
                <div className="flex justify-between"><span className="text-gray-500">直播中</span><span className="text-red-600 font-medium">{stats.livingCount}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">待审核</span><span className="text-yellow-600 font-medium">{stats.pendingCount}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
