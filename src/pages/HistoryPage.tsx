import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useStore } from '@/store/index'
import { api } from '@/api/client'
import UserDropdown from '@/components/UserDropdown'
import MessageDropdown from '@/components/MessageDropdown'
import FeedDropdown from '@/components/FeedDropdown'
import FavoriteDropdown from '@/components/FavoriteDropdown'
import HistoryDropdown from '@/components/HistoryDropdown'
import UploadDropdown from '@/components/UploadDropdown'
import { Search, User, Download, Play, Clock, Eye, Trash2, MoreHorizontal, RotateCcw } from 'lucide-react'

export default function HistoryPage() {
  const { currentUser, users } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'live' | 'article'>('all')
  const navigate = useNavigate()
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await api.getHistory()
      if (res.success) setRecords(res.history || [])
      setLoading(false)
    }
    load()
  }, [])

  const tabs = [
    { key: 'all' as const, label: '全部' },
    { key: 'video' as const, label: '视频' },
    { key: 'live' as const, label: '直播' },
    { key: 'article' as const, label: '专栏' },
  ]

  const getViews = (n: number) => n >= 10000 ? `${(n/10000).toFixed(1)}万` : String(n)
  const getDuration = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="flex items-center h-14 justify-between">
            <nav className="hidden md:flex items-center gap-3 text-sm">
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">首页</Link>
              <Link to="/anime" className="text-gray-800 hover:text-[#FB7299]">番剧</Link>
              <Link to="/live" className="text-gray-800 hover:text-[#FB7299]">直播</Link>
              <Link to="/vip" className="text-gray-800 hover:text-[#FB7299]">大会员</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299] flex items-center gap-1"><Download className="w-4 h-4" />下载客户端</Link>
            </nav>
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); }} className="flex-1 max-w-[400px] mx-4">
              <div className="relative"><input type="text" placeholder="搜索历史记录..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full h-10 pl-4 pr-12 bg-gray-100 rounded-full text-sm focus:outline-none focus:border-[#FB7299] focus:bg-white" /><button type="submit" className="absolute right-0 top-0 w-12 h-10 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-r-full flex items-center justify-center"><Search className="w-5 h-5 text-white" /></button></div>
            </form>
            <div className="flex items-center gap-1">
              {currentUser ? <UserDropdown currentUser={currentUser} avatar={currentUser.username ? users.find(u => u.username === currentUser.username)?.avatar : undefined} /> : <Link to="/login/user" className="flex flex-col items-center hover:opacity-80"><div className="w-10 h-10 rounded-full bg-[#FB7299] flex items-center justify-center"><User className="w-5 h-5 text-white" /></div><span className="text-xs text-gray-700 mt-1">登录</span></Link>}
              <div className="flex items-center gap-3 ml-2"><MessageDropdown currentUser={currentUser} /><FeedDropdown currentUser={currentUser} /><FavoriteDropdown currentUser={currentUser} /><HistoryDropdown currentUser={currentUser} /><UploadDropdown currentUser={currentUser} /></div>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20">
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          {/* 页面标题 */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">历史记录</h1>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#FB7299]">
                <RotateCcw className="w-4 h-4" />刷新
              </button>
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500">
                <Trash2 className="w-4 h-4" />清空历史
              </button>
            </div>
          </div>

          {/* 标签栏 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-1">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                    activeTab === t.key ? 'bg-[#FB7299] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}>{t.label}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="搜索历史记录" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-sm w-48 focus:outline-none focus:border-[#FB7299]" />
              <button className="px-4 py-1.5 text-sm text-gray-500 hover:text-[#FB7299]">更多筛选</button>
            </div>
          </div>

          {/* 视频网格 */}
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-[#FB7299] border-t-transparent rounded-full" /></div>
          ) : records.length === 0 ? (
            <div className="text-center py-20">
              <Clock className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">暂无观看记录</p>
              <p className="text-gray-400 text-sm mt-1">去首页发现更多精彩内容吧</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              {records.map((item, i) => (
                <Link key={item.id || i} to={item.type === 'article' ? `/article/${item.video_id}` : `/video/${item.video_id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-video bg-gray-200 overflow-hidden">
                    <img src={item.thumbnail || `https://images.unsplash.com/photo-${1500000000000 + (item.video_id||1)*1000}?w=400&h=250&fit=crop`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    {item.duration && <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] bg-black/70 text-white">{getDuration(item.duration)}</span>}
                    {/* 播放进度条 */}
                    {item.progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30">
                        <div className="h-full bg-[#FB7299]" style={{ width: `${item.progress}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="text-xs text-gray-800 line-clamp-2 mb-1.5 group-hover:text-[#FB7299] transition-colors">{item.title || `视频#${item.video_id}`}</h3>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" />{getViews(item.views||0)}</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{item.watched_at ? new Date(item.watched_at).toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'}) : ''}</span>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 hover:text-red-400"><MoreHorizontal className="w-3 h-3" /></button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
