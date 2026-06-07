import { Link } from 'react-router-dom'
import { useStore } from '@/store/index'
import { api } from '@/api/client'
import UserDropdown from '@/components/UserDropdown'
import MessageDropdown from '@/components/MessageDropdown'
import FeedDropdown from '@/components/FeedDropdown'
import FavoriteDropdown from '@/components/FavoriteDropdown'
import HistoryDropdown from '@/components/HistoryDropdown'
import UploadDropdown from '@/components/UploadDropdown'
import { Search, User, Download, Crown, Diamond, Star, Eye, Video, Music, Palette, Shield } from 'lucide-react'
import { useState, useEffect } from 'react'

const FEATURES = [
  { icon: Video, title: '内容特权', desc: '高清画质、独家番剧、会员专享内容', color: 'text-pink-500', bg: 'bg-pink-50' },
  { icon: Music, title: '视听特权', desc: '无损音质、杜比全景声、HDR画质', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: Crown, title: '身份特权', desc: '大会员专属标识、弹幕颜色、进场特效', color: 'text-amber-500', bg: 'bg-amber-50' },
  { icon: Palette, title: '装扮特权', desc: '专属挂件、头像框、空间背景', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Diamond, title: '福利特权', desc: '每月B币、折扣券、会员购专享价', color: 'text-red-500', bg: 'bg-red-50' },
  { icon: Shield, title: '安全特权', desc: '账号保护、优先客服、退换无忧', color: 'text-green-500', bg: 'bg-green-50' },
]

const PLANS = [
  { name: '连续包月', price: '15', original: '25', unit: '元/月', badge: '热门', color: 'from-pink-500 to-rose-500' },
  { name: '月度大会员', price: '25', unit: '元', color: 'from-blue-500 to-cyan-500' },
  { name: '年度大会员', price: '168', original: '300', unit: '元/年', badge: '推荐', color: 'from-amber-500 to-orange-500' },
]

export default function VipPage() {
  const { currentUser, users } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [videos, setVideos] = useState<any[]>([])

  useEffect(() => {
    api.getVideos({ status: 'approved' }).then(res => {
      if (res.success) setVideos(res.videos)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="flex items-center h-14 justify-between">
            <nav className="hidden md:flex items-center gap-3 text-sm">
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">首页</Link>
              <Link to="/anime" className="text-gray-800 hover:text-[#FB7299]">番剧</Link>
              <Link to="/live" className="text-gray-800 hover:text-[#FB7299]">直播</Link>
              <Link to="/vip" className="text-[#FB7299] font-medium">大会员</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299] flex items-center gap-1"><Download className="w-4 h-4" />下载客户端</Link>
            </nav>
            <div className="flex-1 max-w-[400px] mx-4">
              <div className="relative"><input type="text" placeholder="搜索大会员专享内容..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full h-10 pl-4 pr-12 bg-gray-100 rounded-full text-sm focus:outline-none focus:border-[#FB7299] focus:bg-white" /><button className="absolute right-0 top-0 w-12 h-10 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-r-full flex items-center justify-center"><Search className="w-5 h-5 text-white" /></button></div>
            </div>
            <div className="flex items-center gap-1">
              {currentUser ? <UserDropdown currentUser={currentUser} avatar={currentUser.username ? users.find(u => u.username === currentUser.username)?.avatar : undefined} /> : <Link to="/login/user" className="flex flex-col items-center hover:opacity-80"><div className="w-10 h-10 rounded-full bg-[#FB7299] flex items-center justify-center"><User className="w-5 h-5 text-white" /></div><span className="text-xs text-gray-700 mt-1">登录</span></Link>}
              <div className="flex items-center gap-3 ml-2"><MessageDropdown currentUser={currentUser} /><FeedDropdown currentUser={currentUser} /><FavoriteDropdown currentUser={currentUser} /><HistoryDropdown currentUser={currentUser} /><UploadDropdown currentUser={currentUser} /></div>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20">
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=1600&h=600&fit=crop')] opacity-20 bg-cover bg-center" />
          <div className="relative max-w-[1400px] mx-auto px-4 py-20">
            <div className="flex items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-8 h-8 text-amber-400" />
                  <span className="text-lg font-bold tracking-wider opacity-90">BILIBILI PREMIUM</span>
                </div>
                <h1 className="text-5xl font-bold mb-4">哔哩哔哩大会员</h1>
                <p className="text-xl opacity-90 mb-2">解锁专属内容，畅享高清视界</p>
                <p className="opacity-70">万部番剧任意看 · 4K杜比画质 · 每月B币福利</p>
                <div className="flex gap-3 mt-8">
                  <button className="px-8 py-3 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold rounded-full transition-colors">立即开通</button>
                  <button className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors">赠送好友</button>
                </div>
              </div>
              <div className="hidden lg:block">
                <img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=400&fit=crop" alt="" className="w-60 rounded-2xl shadow-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* 套餐选择 */}
        <div className="max-w-[1400px] mx-auto px-4 -mt-12 relative z-10">
          <div className="grid grid-cols-3 gap-4">
            {PLANS.map((plan, i) => (
              <div key={i} className={`bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden ${i===0?'ring-2 ring-pink-500':''}`}>
                {plan.badge && <div className={`absolute top-3 right-3 px-2 py-0.5 bg-gradient-to-r ${plan.color} text-white text-xs rounded-full font-bold`}>{plan.badge}</div>}
                <h3 className="text-sm text-gray-500 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span className="text-3xl font-bold">¥{plan.price}</span>
                  <span className="text-gray-400 text-sm">/{plan.unit.replace('/','')}</span>
                </div>
                {plan.original && <p className="text-xs text-gray-400 line-through mb-3">原价 ¥{plan.original}/年</p>}
                <button className={`w-full py-2.5 bg-gradient-to-r ${plan.color} text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity`}>立即开通</button>
              </div>
            ))}
          </div>
        </div>

        {/* 会员特权 */}
        <div className="max-w-[1400px] mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">大会员专属特权</h2>
            <p className="text-gray-500">六大特权，尽享尊贵体验</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className={`${f.bg} rounded-2xl p-6 hover:shadow-md transition-shadow`}>
                <f.icon className={`w-10 h-10 ${f.color} mb-4`} />
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 专享推荐 */}
        <div className="max-w-[1400px] mx-auto px-4 pb-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">大会员专享内容</h2>
          <div className="grid grid-cols-5 gap-4">
            {videos.slice(0, 10).map((v) => (
              <Link key={v.id} to={`/video/${v.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                  <img src={v.cover_url || `https://images.unsplash.com/photo-${1500000000000+v.id*1000}?w=300&h=400&fit=crop`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-400 text-white text-[10px] rounded font-bold flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5" />会员
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-800 line-clamp-2 group-hover:text-[#FB7299] transition-colors">{v.title}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{v.nickname || v.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
