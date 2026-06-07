import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { useStore } from '@/store/index'
import MessageDropdown from '@/components/MessageDropdown'
import FeedDropdown from '@/components/FeedDropdown'
import FavoriteDropdown from '@/components/FavoriteDropdown'
import HistoryDropdown from '@/components/HistoryDropdown'
import UploadDropdown from '@/components/UploadDropdown'
import UserDropdown from '@/components/UserDropdown'
import { Search, User, Download, Play, Eye, Clock, MessageCircle, FileText, Users } from 'lucide-react'

interface SearchResult {
  id: number
  title: string
  type: 'video' | 'article' | 'user'
  thumbnail: string
  preview: string
  duration?: string
  views: number
  likes: number
  danmaku_count: number
  created_at: string
  category: string
  username: string
  user_avatar: string
  nickname: string
  level?: number
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  const currentUser = useStore(s => s.currentUser)
  const users = useStore(s => s.users)

  const [searchInput, setSearchInput] = useState(query)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState<'all' | 'video' | 'article' | 'user'>('all')
  const [sortBy, setSortBy] = useState<'default' | 'views' | 'newest' | 'danmaku' | 'favorites'>('default')

  useEffect(() => {
    setSearchInput(query)
    if (query.trim()) {
      loadResults(query, typeFilter, sortBy)
    }
  }, [query, typeFilter, sortBy])

  const loadResults = async (q: string, type: string, sort: string) => {
    setLoading(true)
    const res = await api.search({ q, type, sort })
    if (res.success) setResults(res.results)
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() })
    }
  }

  const handleTypeChange = (type: 'all' | 'video' | 'article' | 'user') => {
    setTypeFilter(type)
  }

  const formatViews = (n: number) => {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
    return n.toString()
  }

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const days = Math.floor(diff / 86400000)
    if (days < 1) return '今天'
    if (days < 30) return `${days}天前`
    return new Date(d).toLocaleDateString('zh-CN')
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 搜索栏 */}
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

            <form onSubmit={handleSearch} className="flex-1 max-w-[500px] mx-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="搜索你感兴趣的内容"
                  className="w-full h-10 pl-4 pr-12 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:border-[#FB7299] focus:bg-white transition-all"
                />
                <button type="submit" className="absolute right-0 top-0 w-12 h-10 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-r-full flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-1">
              {currentUser ? (
                <UserDropdown currentUser={currentUser}
                  avatar={currentUser.username ? users.find(u => u.username === currentUser.username)?.avatar : undefined} />
              ) : (
                <Link to="/login/user" className="flex flex-col items-center hover:opacity-80 group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">登录</span>
                </Link>
              )}
              <div className="flex items-center gap-3 ml-2">
                <MessageDropdown currentUser={currentUser} />
                <FeedDropdown currentUser={currentUser} />
                <FavoriteDropdown currentUser={currentUser} />
                <HistoryDropdown currentUser={currentUser} />
                <UploadDropdown currentUser={currentUser} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 搜索结果 */}
      <div className="max-w-[1400px] mx-auto px-4 pt-24 pb-8">
        {/* 搜索信息 */}
        <div className="mb-4">
          <h1 className="text-lg text-gray-800">
            搜索 "<span className="text-[#FB7299] font-bold">{query}</span>" 的结果
          </h1>
        </div>

        {/* 分类Tab */}
        <div className="flex items-center gap-1 mb-4 border-b border-gray-200 pb-3">
          {[
            { id: 'all', label: '综合' },
            { id: 'video', label: '视频', icon: Play },
            { id: 'article', label: '专栏', icon: FileText },
            { id: 'user', label: '用户', icon: Users },
          ].map(t => (
            <button key={t.id} onClick={() => handleTypeChange(t.id as typeof typeFilter)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm transition-colors ${
                typeFilter === t.id ? 'bg-[#FB7299] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t.icon && <t.icon className="w-3.5 h-3.5" />}{t.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-400">排序:</span>
            {[
              { id: 'default' as const, label: '综合排序' },
              { id: 'views' as const, label: '最多播放' },
              { id: 'newest' as const, label: '最新发布' },
              { id: 'danmaku' as const, label: '最多弹幕' },
              { id: 'favorites' as const, label: '最多收藏' },
            ].map(s => (
              <button key={s.id} onClick={() => setSortBy(s.id)}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${
                  sortBy === s.id ? 'bg-[#FB7299] text-white' : 'text-gray-500 hover:text-[#FB7299]'}`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 结果列表 */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-[#FB7299] border-t-transparent rounded-full" /></div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">没有找到与 "<span className="text-[#FB7299]">{query}</span>" 相关的内容</p>
            <p className="text-gray-400 text-sm mt-2">试试其他关键词吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map(item => {
              // 用户类型的特殊渲染
              if (item.type === 'user') {
                return (
                  <Link key={`user-${item.id}`} to={`/user/${item.username}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow p-5">
                    <div className="flex flex-col items-center text-center">
                      <img src={item.thumbnail || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop`}
                        alt="" className="w-20 h-20 rounded-full object-cover border-2 border-white shadow group-hover:border-[#FB7299]" />
                      <h3 className="font-semibold text-gray-800 mt-3 group-hover:text-[#FB7299]">{item.nickname || item.title}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">@{item.username}</p>
                      {item.preview && (
                        <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.preview}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span>{formatViews(item.views || 0)} 粉丝</span>
                        <span>Lv{item.level || 1}</span>
                      </div>
                    </div>
                  </Link>
                )
              }

              const linkPath = item.type === 'video' ? `/video/${item.id}` : `/article/${item.id}`
              return (
                <Link key={`${item.type}-${item.id}`} to={linkPath}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-video bg-gray-200 overflow-hidden">
                    <img src={item.thumbnail || `https://images.unsplash.com/photo-${1500000000000 + item.id * 1000}?w=400&h=225&fit=crop`}
                      alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {item.type === 'video' && item.duration && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] bg-black/70 text-white">{item.duration}</span>
                    )}
                    {item.type === 'video' && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-80 transition-opacity" />
                      </div>
                    )}
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] bg-black/50 text-white">
                      {item.type === 'video' ? '视频' : '文章'}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug group-hover:text-[#FB7299] transition-colors">{item.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatViews(item.views || 0)}</span>
                      {item.type === 'video' && item.danmaku_count > 0 && (
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{item.danmaku_count}</span>
                      )}
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(item.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                      <img src={item.user_avatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                      <span>{item.nickname || item.username}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
