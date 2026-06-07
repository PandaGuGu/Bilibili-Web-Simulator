import { useParams, Link, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/index'
import { useDanmakuStore, type DanmakuMode, type DanmakuFontSize } from '@/store/danmaku'
import { BilibiliPlayer, type BilibiliPlayerHandle } from '@/components/BilibiliPlayer'
import DanmakuLayer from '@/components/DanmakuLayer'
import UserDropdown from '@/components/UserDropdown'
import MessageDropdown from '@/components/MessageDropdown'
import FeedDropdown from '@/components/FeedDropdown'
import FavoriteDropdown from '@/components/FavoriteDropdown'
import HistoryDropdown from '@/components/HistoryDropdown'
import { CommentSection } from '@/components/CommentSection'
import UploadDropdown from '@/components/UploadDropdown'
import { api } from '@/api/client'
import { Search, User, Flame, Download, Send, ChevronDown, Share2, Star, Heart, MessageCircle, MoreHorizontal, ThumbsUp, Flag } from 'lucide-react'
import { useState, useRef, useCallback, useEffect } from 'react'

const SAMPLE_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4'

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentUser, users } = useStore()
  const addDanmaku = useDanmakuStore((s) => s.addDanmaku)
  const [searchQuery, setSearchQuery] = useState('')
  const [playerTime, setPlayerTime] = useState(0)
  const playerRef = useRef<BilibiliPlayerHandle>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [playerSize, setPlayerSize] = useState({ width: 800, height: 450 })

  // API data
  const [video, setVideo] = useState<any>(null)
  const [relatedVideos, setRelatedVideos] = useState<any[]>([])
  const [danmakuList, setDanmakuList] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [loading, setLoading] = useState(true)

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
      setLoading(true)
      try {
        const vRes = await api.getVideo(Number(id))
        if (vRes.success) {
          setVideo(vRes.video)
          if (currentUser) {
            try { const fRes = await api.checkFollow(vRes.video.user_id); if (fRes.success) setIsFollowing(fRes.following) } catch {}
          }
        }
        const rRes = await api.getVideos({ status: 'approved' })
        if (rRes.success) setRelatedVideos(rRes.videos.filter((v: any) => String(v.id) !== id).slice(0, 10))
      } catch {}
      setLoading(false)
    }
    load()
  }, [id, currentUser])

  const handleFollow = async () => {
    if (!currentUser || !video) return
    const res = isFollowing ? await api.unfollow(video.user_id) : await api.follow(video.user_id)
    if (res.success) setIsFollowing(!isFollowing)
  }

  const handleLike = async () => {
    if (!video) return
    await api.likeVideo(video.id)
    setIsLiked(true)
    setVideo((prev: any) => ({ ...prev, likes: (prev.likes || 0) + 1 }))
  }

  const handleSendDanmaku = useCallback(
    (text: string, mode: DanmakuMode, color: string, fontSize: DanmakuFontSize) => {
      if (!currentUser || !id) return
      const time = playerRef.current?.getCurrentTime() ?? playerTime
      addDanmaku(id, { userId: currentUser.username, text, time: Math.floor(time * 10) / 10, mode, color, fontSize })
    },
    [currentUser, id, addDanmaku, playerTime],
  )

  const getViews = (n: number) => {
    if (!n) return '0'
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`
    return n.toLocaleString()
  }

  const getDuration = (sec: number) => {
    if (!sec) return '00:00'
    return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`
  }

  const categoryRow1 = ['番剧', '国创', '综艺', '动画', '鬼畜', '舞蹈', '娱乐', '科技数码', '美食', '汽车', '体育运动']
  const categoryRow2 = ['电影', '电视剧', '纪录片', '游戏', '音乐', '影视', '知识', '资讯', '小剧场', '时尚美妆', '更多']

  if (loading) return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-[#FB7299] border-t-transparent rounded-full" /></div>
  if (!video) return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-gray-500">视频不存在</div>

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
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
              <Link to="/" className="text-gray-800 hover:text-[#FB7299] flex items-center gap-1"><Download className="w-4 h-4" />下载客户端</Link>
            </nav>
            <div className="flex-1 max-w-[400px] mx-4">
              <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`) }} className="relative">
                <input type="text" placeholder="搜索你感兴趣的内容" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-12 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:border-[#FB7299] focus:bg-white transition-all" />
                <button type="submit" className="absolute right-0 top-0 w-12 h-10 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-r-full flex items-center justify-center"><Search className="w-5 h-5 text-white" /></button>
              </form>
            </div>
            <div className="flex items-center gap-1">
              {currentUser ? (
                <UserDropdown currentUser={currentUser} avatar={currentUser.username ? users.find(u => u.username === currentUser.username)?.avatar : undefined} />
              ) : (
                <Link to="/login/user" className="flex flex-col items-center hover:opacity-80 group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>
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

      {/* 二级导航 */}
      <div className="fixed top-[72px] left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center h-10 gap-6 text-xs text-gray-600">
            <div className="grid grid-cols-11 gap-2 flex-1">{categoryRow1.map((cat, i) => <button key={i} className="px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200 truncate text-center">{cat}</button>)}</div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="grid grid-cols-11 gap-2 flex-1">{categoryRow2.map((cat, i) => <button key={i} className="px-3 py-1.5 bg-gray-100 rounded hover:bg-gray-200 truncate text-center flex items-center justify-center gap-1">{cat}{cat === '更多' && <ChevronDown className="w-3 h-3" />}</button>)}</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-[1400px] mx-auto px-4 pt-[120px] pb-8">
        <div className="flex gap-6">
          {/* 左侧：播放器 + 信息 */}
          <div className="flex-1 min-w-0" ref={containerRef}>
            <div className="relative">
              <BilibiliPlayer ref={playerRef} src={SAMPLE_VIDEO} poster={video.cover_url} onTimeUpdate={setPlayerTime} />
              <DanmakuLayer width={playerSize.width} height={playerSize.height} currentTime={playerTime} videoId={video.id} isLoggedIn={!!currentUser} onSend={handleSendDanmaku} />
            </div>

            {/* 视频标题 + 互动按钮 */}
            <div className="mt-4 bg-white rounded-xl p-4 shadow-sm">
              <h1 className="text-lg font-bold text-gray-900 mb-3">{video.title}</h1>
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                <span>{getViews(video.views)}播放</span>
                <span className="px-1">·</span>
                <span>{video.danmaku_count || 0}弹幕</span>
                <span className="px-1">·</span>
                <span>{new Date(video.created_at).toLocaleDateString('zh-CN')}</span>
                {video.category && <><span className="px-1">·</span><span className="px-2 py-0.5 bg-gray-100 rounded text-xs">{video.category}</span></>}
              </div>

              {/* UP主信息 + 操作按钮 */}
              <div className="flex items-center justify-between py-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <Link to={`/user/${video.username}`}>
                    <img src={video.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'} alt="" className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity" />
                  </Link>
                  <div>
                    <Link to={`/user/${video.username}`} className="font-medium text-gray-900 hover:text-[#FB7299] transition-colors">{video.nickname || video.username}</Link>
                    <div className="text-xs text-gray-500">
                      {video.followers_count || 0}粉丝 · {video.following_count || 0}关注
                    </div>
                  </div>
                  {currentUser && currentUser.username !== video.username && (
                    <button onClick={handleFollow}
                      className={`ml-3 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                        isFollowing ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-[#FB7299] text-white hover:bg-[#e86185]'
                      }`}>
                      {isFollowing ? '已关注' : '+ 关注'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={handleLike} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-colors ${isLiked ? 'bg-[#FB7299] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <ThumbsUp className="w-4 h-4" />{getViews(video.likes)}</button>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200">
                    <div className="w-4 h-4 flex items-center justify-center font-bold text-xs">币</div>{getViews(video.coins)}</button>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200">
                    <Star className="w-4 h-4" />{getViews(video.favorites)}</button>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200">
                    <Share2 className="w-4 h-4" />{getViews(video.shares)}</button>
                  <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><MoreHorizontal className="w-4 h-4 text-gray-600" /></button>
                </div>
              </div>

              {/* 视频简介 */}
              {video.description && (
                <div className="mt-3 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{video.description}</p>
                </div>
              )}
            </div>

            {/* 评论区 */}
            <CommentSection videoId={Number(video.id)} />
          </div>

          {/* 右侧边栏 */}
          <aside className="w-96 flex-shrink-0 hidden lg:block space-y-4">
            {/* UP主打赏/充电 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <img src={video.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="font-medium text-gray-900 text-sm">{video.nickname || video.username}</div>
                  <div className="text-xs text-gray-500">{video.followers_count || 0}粉丝</div>
                </div>
              </div>
              <div className="flex gap-2">
                {currentUser && currentUser.username !== video.username && (
                  <button onClick={handleFollow}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${isFollowing ? 'bg-gray-200 text-gray-600' : 'bg-[#FB7299] text-white'}`}>
                    {isFollowing ? '已关注' : '+ 关注'}
                  </button>
                )}
                <button className="flex-1 py-2 bg-pink-50 text-pink-500 rounded-full text-sm font-medium hover:bg-pink-100">为TA充电</button>
                <button onClick={() => navigate(`/messages/${currentUser?.username}?user=${video.username}`)}
                  className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200">发消息</button>
              </div>
            </div>

            {/* 接下来播放 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">接下来播放</h3>
              <div className="space-y-3">
                {relatedVideos.slice(0, 8).map(v => (
                  <Link key={v.id} to={`/video/${v.id}`} className="flex gap-3 group" onClick={() => window.scrollTo(0, 0)}>
                    <div className="relative w-40 flex-shrink-0">
                      <img src={v.cover_url || `https://images.unsplash.com/photo-${1500000000000+v.id*1000}?w=320&h=180&fit=crop`} alt="" className="w-full aspect-video object-cover rounded-lg" />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] bg-black/70 text-white">{getDuration(v.duration)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm text-gray-900 line-clamp-2 group-hover:text-[#FB7299] transition-colors leading-snug">{v.title}</h4>
                      <div className="mt-1 text-xs text-gray-500">{getViews(v.views)}播放</div>
                      <div className="text-xs text-gray-400">{v.nickname || v.username}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 弹幕列表 */}
            {danmakuList.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">弹幕列表 ({danmakuList.length})</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {danmakuList.map((d, i) => (
                    <div key={d.id || i} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400 w-10 text-right flex-shrink-0">{d.time_point?.toFixed(0) || '0'}"</span>
                      <span style={{ color: d.color || '#fff' }} className="truncate flex-1">{d.content}</span>
                      <span className="text-gray-400 flex-shrink-0">{d.user_id}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 活动/公告 */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">热门活动</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100">
                  <span className="text-lg">🏆</span>
                  <div className="text-xs"><div className="font-medium text-gray-800">创作激励计划</div><div className="text-gray-500">投稿瓜分百万奖金</div></div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100">
                  <span className="text-lg">🔔</span>
                  <div className="text-xs"><div className="font-medium text-gray-800">新星计划</div><div className="text-gray-500">新人UP主扶持活动</div></div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
