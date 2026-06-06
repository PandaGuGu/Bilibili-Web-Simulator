import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { api } from '@/api/client'
import { BilibiliPlayer, type BilibiliPlayerHandle } from '@/features/user/components/Player/BilibiliPlayer'
import DanmakuLayer from '@/features/user/components/Danmaku/DanmakuLayer'
import { useDanmakuStore, type DanmakuMode, type DanmakuFontSize } from '@/store/slices/useDanmakuStore'
import UserDropdown from '@/features/user/components/UserDropdown'
import MessageDropdown from '@/features/user/components/MessageDropdown'
import FeedDropdown from '@/features/user/components/FeedDropdown'
import FavoriteDropdown from '@/features/user/components/FavoriteDropdown'
import HistoryDropdown from '@/features/user/components/HistoryDropdown'
import UploadDropdown from '@/features/user/components/UploadDropdown'
import { Search, User, Download, Heart, Send, Eye, Users, ThumbsUp, Star, Gift } from 'lucide-react'

const SAMPLE_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4'

export default function LiveRoom() {
  const { id } = useParams<{ id: string }>()
  const { currentUser, users } = useStore()
  const addDanmaku = useDanmakuStore(s => s.addDanmaku)
  const playerRef = useRef<BilibiliPlayerHandle>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [playerSize, setPlayerSize] = useState({ width: 800, height: 450 })
  const [playerTime, setPlayerTime] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [room, setRoom] = useState<any>(null)
  const [streamer, setStreamer] = useState<any>(null)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    { user: '科技评测师', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop', content: 'UP主讲的太好了！', time: '刚刚', badge: '粉丝' },
    { user: '哔哩用户01', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop', content: '666666', time: '30秒前', badge: '舰长' },
    { user: '游戏大师', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop', content: '来了来了！每天都准时看', time: '1分钟前', badge: '粉丝' },
    { user: 'admin', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop', content: '内容质量很高，加油！', time: '2分钟前', badge: '房管' },
  ])
  const [viewers, setViewers] = useState(1250)
  const [giftCount, setGiftCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setPlayerSize({ width: rect.width, height: rect.width * 9 / 16 })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    async function load() {
      if (!id) return
      const res = await api.getLiveRooms()
      if (res.success) {
        const found = res.rooms.find((r: any) => String(r.id) === id)
        if (found) setRoom(found)
        // 获取主播信息
        const uRes = await api.getUsers()
        if (uRes.success && found) {
          const host = uRes.users.find((u: any) => u.id === found.user_id)
          if (host) setStreamer(host)
        }
      }
    }
    load()
  }, [id])

  // 模拟弹幕/聊天自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // 模拟观众数波动
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 20) - 10)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !currentUser) return
    setChatMessages(prev => [...prev, {
      user: currentUser.nickname || currentUser.username,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop`,
      content: chatInput.trim().slice(0, 200),
      time: '刚刚',
      badge: '',
    }])
    setChatInput('')
    if (chatMessages.length > 200) setChatMessages(prev => prev.slice(-100))
  }

  const handleSendGift = () => {
    setGiftCount(prev => prev + 1)
    if (currentUser) {
      setChatMessages(prev => [...prev, {
        user: currentUser.nickname || currentUser.username,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop`,
        content: '🎁 送出了一份礼物',
        time: '刚刚',
        badge: '',
      }])
    }
  }

  const handleSendDanmaku = (text: string, mode: DanmakuMode, color: string, fontSize: DanmakuFontSize) => {
    if (!currentUser || !id) return
    const time = playerRef.current?.getCurrentTime() ?? playerTime
    addDanmaku(id, { userId: currentUser.username, text, time: Math.floor(time * 10) / 10, mode, color, fontSize })
  }

  if (!room) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">加载中...</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="max-w-[1600px] mx-auto px-3">
          <div className="flex items-center h-14 justify-between">
            <nav className="flex items-center gap-4 text-sm">
              <Link to="/" className="text-gray-300 hover:text-[#FB7299] font-medium">首页</Link>
              <Link to="/" className="text-gray-400 hover:text-[#FB7299]">直播</Link>
              <Link to="/" className="text-gray-400 hover:text-[#FB7299]">游戏</Link>
              <Link to="/" className="text-gray-400 hover:text-[#FB7299] flex items-center gap-1"><Download className="w-4 h-4" />下载</Link>
            </nav>
            <div className="flex-1 max-w-[400px] mx-4">
              <div className="relative">
                <input type="text" placeholder="搜索直播间" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-12 bg-gray-800 border border-gray-700 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FB7299]" />
                <button className="absolute right-0 top-0 w-12 h-10 bg-[#FB7299] rounded-r-full flex items-center justify-center"><Search className="w-5 h-5 text-white" /></button>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {currentUser ? (
                <UserDropdown currentUser={currentUser} avatar={currentUser.username ? users.find(u => u.username === currentUser.username)?.avatar : undefined} />
              ) : (
                <Link to="/login/user" className="flex flex-col items-center hover:opacity-80">
                  <div className="w-10 h-10 rounded-full bg-[#FB7299] flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>
                  <span className="text-xs text-gray-400 mt-1">登录</span>
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

      {/* Main */}
      <div className="max-w-[1600px] mx-auto px-4 pt-24 pb-8">
        <div className="flex gap-4">
          {/* 左侧：播放器 + 主播信息 */}
          <div className="flex-1 min-w-0" ref={containerRef}>
            {/* 播放器 */}
            <div className="relative rounded-xl overflow-hidden">
              <BilibiliPlayer ref={playerRef} src={SAMPLE_VIDEO} poster={room.cover_url} onTimeUpdate={setPlayerTime} />
              <DanmakuLayer width={playerSize.width} height={playerSize.height} currentTime={playerTime} videoId={room.id} isLoggedIn={!!currentUser} onSend={handleSendDanmaku} />
              {/* LIVE 角标 */}
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> 直播中
              </div>
              {/* 观看人数 */}
              <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                <Eye className="w-3 h-3" /> {viewers.toLocaleString()}
              </div>
            </div>

            {/* 主播信息 */}
            <div className="mt-4 bg-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={streamer?.avatar || room.cover_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-[#FB7299]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg">{streamer?.nickname || streamer?.username || room.title}</h2>
                      <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[10px] rounded">UP主</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{streamer?.followers_count || 0} 粉丝 · {giftCount} 礼物</p>
                  </div>
                </div>
                <button className="px-6 py-2 bg-[#FB7299] text-white rounded-full text-sm font-medium hover:bg-[#e86185] transition-colors">
                  + 关注
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-3">{room.title}</p>
            </div>
          </div>

          {/* 右侧：聊天区 */}
          <aside className="w-80 flex-shrink-0 hidden lg:flex flex-col bg-gray-800 rounded-xl overflow-hidden h-[calc(100vh-140px)]">
            {/* 聊天头部 */}
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-sm">弹幕聊天</h3>
              <span className="text-xs text-gray-400">{chatMessages.length} 条</span>
            </div>

            {/* 聊天列表 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg, i) => (
                <div key={i} className="flex items-start gap-2">
                  <img src={msg.avatar} alt="" className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-[#FB7299]">{msg.user}</span>
                      {msg.badge && (
                        <span className={`px-1 py-0 rounded text-[9px] font-bold ${
                          msg.badge === '舰长' ? 'bg-amber-500 text-white' :
                          msg.badge === '房管' ? 'bg-red-500 text-white' :
                          'bg-gray-600 text-gray-300'
                        }`}>{msg.badge}</span>
                      )}
                      <span className="text-[10px] text-gray-500 ml-auto">{msg.time}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 互动按钮栏 */}
            <div className="p-2 border-t border-gray-700 flex gap-2">
              <button onClick={handleSendGift} className="flex-1 py-1.5 bg-amber-500/20 text-amber-400 rounded text-xs font-medium hover:bg-amber-500/30 flex items-center justify-center gap-1">
                <Gift className="w-3 h-3" />礼物 {giftCount}
              </button>
              <button className="flex-1 py-1.5 bg-[#FB7299]/20 text-[#FB7299] rounded text-xs font-medium hover:bg-[#FB7299]/30 flex items-center justify-center gap-1">
                <Heart className="w-3 h-3" />点赞
              </button>
            </div>

            {/* 聊天输入 */}
            <form onSubmit={handleSendChat} className="p-3 border-t border-gray-700 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="发送弹幕聊天..."
                maxLength={200}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-full text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FB7299]"
              />
              <button type="submit" disabled={!chatInput.trim()}
                className="px-4 py-2 bg-[#FB7299] text-white rounded-full text-sm hover:bg-[#e86185] disabled:bg-gray-600 transition-colors">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </aside>
        </div>
      </div>
    </div>
  )
}
