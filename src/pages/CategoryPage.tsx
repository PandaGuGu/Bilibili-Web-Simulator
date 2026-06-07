import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/index'
import { api } from '@/api/client'
import { videoLink } from '@/utils/tracking'
import UserDropdown from '@/components/UserDropdown'
import MessageDropdown from '@/components/MessageDropdown'
import FeedDropdown from '@/components/FeedDropdown'
import FavoriteDropdown from '@/components/FavoriteDropdown'
import HistoryDropdown from '@/components/HistoryDropdown'
import UploadDropdown from '@/components/UploadDropdown'
import { Search, User, Download, Play, Eye } from 'lucide-react'
import { useState, useEffect } from 'react'

const PAGE_CONFIG: Record<string, { title: string; subtitle: string; icon: string; color: string; description: string }> = {
  // B站真实一级分区
  anime: { title: '动画', subtitle: 'ANIME', icon: '🎬', color: 'from-pink-500 to-purple-600', description: 'MAD·AMV、MMD·3D、短片·手书·配音、动漫杂谈' },
  guochuang: { title: '国创', subtitle: 'CHINESE ANIME', icon: '🐉', color: 'from-red-500 to-orange-500', description: '国产动画、布袋戏、动态漫·广播剧、资讯' },
  music: { title: '音乐', subtitle: 'MUSIC', icon: '🎵', color: 'from-violet-500 to-purple-500', description: '原创音乐、翻唱、VOCALOID·UTAU、电音、演奏、MV、说唱' },
  dance: { title: '舞蹈', subtitle: 'DANCE', icon: '💃', color: 'from-pink-400 to-rose-500', description: '宅舞、街舞、中国舞、舞蹈教程、舞蹈翻跳' },
  game: { title: '游戏', subtitle: 'GAME', icon: '🎮', color: 'from-blue-500 to-cyan-500', description: '单机游戏、电子竞技、手机游戏、网络游戏、桌游棋牌' },
  knowledge: { title: '知识', subtitle: 'KNOWLEDGE', icon: '📚', color: 'from-emerald-500 to-teal-500', description: '科学科普、社科法律、人文历史、财经商业、校园学习、职业职场' },
  tech: { title: '科技', subtitle: 'TECH', icon: '💻', color: 'from-slate-600 to-gray-700', description: '数码、软件应用、计算机技术、科工机械、极客DIY' },
  sports: { title: '运动', subtitle: 'SPORTS', icon: '⚽', color: 'from-green-500 to-lime-500', description: '篮球、足球、健身、竞技体育、运动文化' },
  car: { title: '汽车', subtitle: 'AUTO', icon: '🚗', color: 'from-gray-600 to-slate-700', description: '赛车、购车攻略、汽车生活、汽车知识、摩托车' },
  life: { title: '生活', subtitle: 'LIFESTYLE', icon: '🏠', color: 'from-amber-500 to-orange-500', description: '搞笑、日常、亲子、家居房产、手工、绘画、出行、三农' },
  food: { title: '美食', subtitle: 'FOOD', icon: '🍜', color: 'from-red-500 to-rose-600', description: '美食制作、美食侦探、美食测评、田园美食、街头美食' },
  animal: { title: '动物圈', subtitle: 'ANIMALS', icon: '🐱', color: 'from-yellow-500 to-amber-500', description: '喵星人、汪星人、大熊猫、小宠异宠、野生动物' },
  kichiku: { title: '鬼畜', subtitle: 'KICHIKU', icon: '👻', color: 'from-indigo-500 to-purple-600', description: '鬼畜调教、音MAD、人力VOCALOID、鬼畜剧场' },
  fashion: { title: '时尚', subtitle: 'FASHION', icon: '👗', color: 'from-pink-400 to-fuchsia-500', description: '美妆护肤、穿搭、风尚潮流、时尚购物、发型' },
  entertainment: { title: '娱乐', subtitle: 'ENTERTAINMENT', icon: '🎤', color: 'from-orange-400 to-pink-500', description: '综艺、娱乐杂谈、粉丝创作、明星综合' },
  movie: { title: '影视', subtitle: 'MOVIE & TV', icon: '🎬', color: 'from-blue-600 to-indigo-700', description: '影视杂谈、影视剪辑、短片、电影、电视剧' },
  documentary: { title: '纪录片', subtitle: 'DOCUMENTARY', icon: '🌍', color: 'from-teal-600 to-green-700', description: '人文历史、科学探索、军事、社会美食旅行、纪实' },
  // 保留的旧分类
  live: { title: '直播', subtitle: 'LIVE', icon: '🔴', color: 'from-red-500 to-orange-500', description: '游戏直播、才艺表演、互动聊天，实时精彩不容错过' },
  comic: { title: '漫画', subtitle: 'COMIC', icon: '📖', color: 'from-green-500 to-emerald-600', description: '热血、恋爱、悬疑、搞笑，海量正版漫画任你阅读' },
  esports: { title: '赛事', subtitle: 'ESPORTS', icon: '🏆', color: 'from-indigo-500 to-blue-600', description: '电竞赛事直播、回放、高光集锦，精彩对决一网打尽' },
  gaokao: { title: '高考季', subtitle: 'GAOKAO', icon: '📝', color: 'from-orange-500 to-red-500', description: '名师辅导、真题解析、志愿填报，助力金榜题名' },
  columns: { title: '专栏', subtitle: 'COLUMNS', icon: '✍️', color: 'from-teal-500 to-green-500', description: '深度好文、技术分享、生活随笔，优质创作者等你关注' },
  events: { title: '活动', subtitle: 'EVENTS', icon: '🎪', color: 'from-purple-500 to-pink-500', description: '创作激励、话题挑战、节日活动，丰富奖品等你拿' },
  community: { title: '社区中心', subtitle: 'COMMUNITY', icon: '💬', color: 'from-cyan-500 to-blue-500', description: '话题讨论、兴趣小组、圈子互动，找到志同道合的朋友' },
  classroom: { title: '课堂', subtitle: 'CLASSROOM', icon: '🎓', color: 'from-rose-500 to-pink-500', description: '编程、设计、语言、职场，系统学习优质课程' },
}

interface CategoryPageProps { category: string }

function formatViews(n: number) { return n>=10000 ? `${(n/10000).toFixed(1)}万` : String(n) }
function formatDuration(s: number) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}` }

export default function CategoryPage({ category }: CategoryPageProps) {
  const { currentUser, users } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [videos, setVideos] = useState<any[]>([])
  const navigate = useNavigate()
  const config = PAGE_CONFIG[category] || PAGE_CONFIG.anime

  useEffect(() => {
    api.getVideos({ status: 'approved' }).then(res => {
      if (res.success) setVideos(res.videos)
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="flex items-center h-14 justify-between">
            <nav className="hidden md:flex items-center gap-3 text-sm">
              <Link to="/" className="text-gray-800 hover:text-[#FB7299] font-medium">首页</Link>
              {Object.entries(PAGE_CONFIG).map(([key, cfg]) => (
                <Link key={key} to={`/${key}`} className={`hover:text-[#FB7299] ${category===key?'text-[#FB7299] font-medium':'text-gray-800'}`}>{cfg.title}</Link>
              ))}
            </nav>
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); }} className="flex-1 max-w-[400px] mx-4 relative">
              <input type="text" placeholder={`搜索${config.title}...`} value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full h-10 pl-4 pr-12 bg-gray-100 rounded-full text-sm focus:outline-none focus:border-[#FB7299] focus:bg-white" />
              <button type="submit" className="absolute right-0 top-0 w-12 h-10 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-r-full flex items-center justify-center"><Search className="w-5 h-5 text-white" /></button>
            </form>
            <div className="flex items-center gap-1">
              {currentUser ? <UserDropdown currentUser={currentUser} avatar={currentUser.username ? users.find(u=>u.username===currentUser.username)?.avatar : undefined} /> : <Link to="/login/user" className="flex flex-col items-center hover:opacity-80"><div className="w-10 h-10 rounded-full bg-[#FB7299] flex items-center justify-center"><User className="w-5 h-5 text-white" /></div><span className="text-xs text-gray-700 mt-1">登录</span></Link>}
              <div className="flex items-center gap-3 ml-2"><MessageDropdown currentUser={currentUser} /><FeedDropdown currentUser={currentUser} /><FavoriteDropdown currentUser={currentUser} /><HistoryDropdown currentUser={currentUser} /><UploadDropdown currentUser={currentUser} /></div>
            </div>
          </div>
        </div>
      </header>
      <div className="pt-20">
        <div className={`bg-gradient-to-r ${config.color} text-white`}>
          <div className="max-w-[1400px] mx-auto px-4 py-16 text-center">
            <span className="text-6xl mb-4 block">{config.icon}</span>
            <h1 className="text-4xl font-bold mb-2">{config.title}</h1>
            <p className="text-lg opacity-80">{config.subtitle}</p>
            <p className="mt-4 opacity-70 max-w-lg mx-auto">{config.description}</p>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 py-12">
          <div className="bg-white rounded-xl p-12 shadow-sm text-center">
            <div className="text-6xl mb-4">{config.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{config.title}频道</h2>
            <p className="text-gray-500 mb-6">内容正在建设中，敬请期待...</p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/" className="px-6 py-2 bg-[#FB7299] text-white rounded-full text-sm hover:bg-[#e86185]">返回首页</Link>
              <Link to="/search" className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">搜索内容</Link>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">热门推荐</h3>
            <div className="grid grid-cols-5 gap-4">
              {videos.length === 0
                ? Array.from({length:10}).map((_,i)=>(
                    <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                      <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"><span className="text-4xl">{config.icon}</span></div>
                      <div className="p-2"><div className="h-3 bg-gray-200 rounded w-3/4 mb-2"/><div className="h-2 bg-gray-100 rounded w-1/2"/></div>
                    </div>))
                : videos.map((v, i) => (
                    <Link key={v.id} to={videoLink(v.id, 'category', i)} className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="relative aspect-video bg-gray-200 overflow-hidden">
                        <img src={v.cover_url || `https://images.unsplash.com/photo-${1500000000000+v.id*1000}?w=400&h=250&fit=crop`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] bg-black/70 text-white">{formatDuration(v.duration)}</span>
                      </div>
                      <div className="p-2">
                        <h3 className="text-xs text-gray-800 line-clamp-2 mb-1.5 group-hover:text-[#FB7299] transition-colors">{v.title}</h3>
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5"/>{formatViews(v.views||0)}</span>
                          <div className="flex items-center gap-1"><img src={v.user_avatar} alt="" className="w-3.5 h-3.5 rounded-full"/><span>{v.nickname||v.username}</span></div>
                        </div>
                      </div>
                    </Link>))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
