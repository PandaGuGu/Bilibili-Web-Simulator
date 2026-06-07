import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useStore } from '@/store/index'
import { api } from '@/api/client'
import UserDropdown from '@/components/UserDropdown'
import MessageDropdown from '@/components/MessageDropdown'
import FeedDropdown from '@/components/FeedDropdown'
import FavoriteDropdown from '@/components/FavoriteDropdown'
import HistoryDropdown from '@/components/HistoryDropdown'
import UploadDropdown from '@/components/UploadDropdown'
import { Search, User, Download, Star, Play, Eye, Trash2 } from 'lucide-react'

export default function FavoritesPage() {
  const { currentUser, users } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await api.getFavorites()
      if (res.success) setFavorites(res.favorites || [])
      setLoading(false)
    }
    load()
  }, [])

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
            </nav>
            <div className="flex-1 max-w-[400px] mx-4">
              <div className="relative"><input type="text" placeholder="搜索收藏内容..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full h-10 pl-4 pr-12 bg-gray-100 rounded-full text-sm focus:outline-none focus:border-[#FB7299] focus:bg-white" /><button className="absolute right-0 top-0 w-12 h-10 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-r-full flex items-center justify-center"><Search className="w-5 h-5 text-white" /></button></div>
            </div>
            <div className="flex items-center gap-1">
              {currentUser ? <UserDropdown currentUser={currentUser} avatar={currentUser.username ? users.find(u => u.username === currentUser.username)?.avatar : undefined} /> : <Link to="/login/user" className="flex flex-col items-center hover:opacity-80"><div className="w-10 h-10 rounded-full bg-[#FB7299] flex items-center justify-center"><User className="w-5 h-5 text-white" /></div><span className="text-xs text-gray-700 mt-1">登录</span></Link>}
              <div className="flex items-center gap-3 ml-2"><MessageDropdown currentUser={currentUser} /><FeedDropdown currentUser={currentUser} /><FavoriteDropdown currentUser={currentUser} /><HistoryDropdown currentUser={currentUser} /></div>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20">
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Star className="w-6 h-6 text-amber-400" />我的收藏</h1>

          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-[#FB7299] border-t-transparent rounded-full" /></div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-20">
              <Star className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">还没有收藏任何内容</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              {favorites.map((item, i) => (
                <Link key={item.id || i} to={`/video/${item.video_id || item.id}`} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-video bg-gray-200"><img src={item.thumbnail || `https://images.unsplash.com/photo-${1500000000000+(item.video_id||1)*1000}?w=400&h=250&fit=crop`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
                  <div className="p-2"><h3 className="text-xs text-gray-800 line-clamp-2 group-hover:text-[#FB7299]">{item.title || `视频#${item.video_id}`}</h3></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
