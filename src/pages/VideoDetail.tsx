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
import { videoLink } from '@/utils/tracking'
import { Search, User, Flame, Download, Send, ChevronDown, Share2, Star, Heart, MessageCircle, MoreHorizontal, ThumbsUp, Flag, FolderPlus, Plus } from 'lucide-react'
import { useState, useRef, useCallback, useEffect } from 'react'

const SAMPLE_VIDEO = 'https://www.w3schools.com/html/mov_bbb.mp4'
const FALLBACK_POSTER = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#181818"/><stop offset="100%" stop-color="#2a2a2a"/></linearGradient></defs><rect width="800" height="450" fill="url(#g)"/><text x="400" y="215" text-anchor="middle" fill="#FB7299" font-size="18" font-family="sans-serif">即将播放</text><text x="400" y="245" text-anchor="middle" fill="#888" font-size="12" font-family="sans-serif">点击播放按钮开始</text></svg>')

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
  const [followLoading, setFollowLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isCoined, setIsCoined] = useState(false)
  const [myCoins, setMyCoins] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favId, setFavId] = useState<number | null>(null)
  const [showFavModal, setShowFavModal] = useState(false)
  const [favFolders, setFavFolders] = useState<string[]>([])
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
          // 只有已登录时才检查状态
          if (currentUser?.id) {
            try {
              const [lRes, cRes, fRes, mRes] = await Promise.allSettled([
                api.getLikeStatus(Number(id)),
                api.getCoinStatus(Number(id)),
                api.checkFavorite(Number(id)),
                api.getMe(),
              ])
              if (lRes.status === 'fulfilled' && lRes.value.success) setIsLiked(lRes.value.liked)
              if (cRes.status === 'fulfilled' && cRes.value.success) setIsCoined(cRes.value.coined)
              if (fRes.status === 'fulfilled' && fRes.value.success) {
                setIsFavorited(fRes.value.favorited)
                setFavId(fRes.value.id || null)
              }
              if (mRes.status === 'fulfilled' && mRes.value.success && mRes.value.user) {
                setMyCoins(Number(mRes.value.user.coins) || 0)
              }
              // 关注状态
              if (vRes.video.user_id) {
                try {
                  const fwRes = await api.checkFollow(vRes.video.user_id)
                  if (fwRes && fwRes.success) setIsFollowing(fwRes.following)
                } catch { /* ignore */ }
              }
            } catch { /* ignore */ }
          }
        }
        const rRes = await api.getVideos({ status: 'approved' })
        if (rRes.success) setRelatedVideos(rRes.videos.filter((v: any) => String(v.id) !== id).slice(0, 10))
      } catch { /* 忽略加载失败 */ }
      setLoading(false)
    }
    load()
  }, [id, currentUser?.id])

  const handleFollow = async () => {
    if (!currentUser || !video || followLoading) return
    setFollowLoading(true)
    try {
      const currentlyFollowing = isFollowing
      const res = currentlyFollowing
        ? await api.unfollow(video.user_id)
        : await api.follow(video.user_id)
      if (res.success) {
        setIsFollowing(!currentlyFollowing)
        setVideo((prev: any) => ({ ...prev, followers_count: (prev.followers_count || 0) + (currentlyFollowing ? -1 : 1) }))
      } else {
        // API 返回失败时给出反馈
        alert(res.message || '操作失败，请稍后再试')
      }
    } catch {
      alert('网络错误，请稍后再试')
    } finally {
      setFollowLoading(false)
    }
  }

  const handleLike = async () => {
    if (!video || !currentUser) return
    const res = await api.likeVideo(video.id)
    if (res.success) {
      const wasLiked = res.liked !== undefined ? res.liked : !isLiked
      setIsLiked(wasLiked)
      setVideo((prev: any) => ({ ...prev, likes: (prev.likes || 0) + (wasLiked ? 1 : -1) }))
    }
  }

  const handleCoin = async () => {
    if (!video || !currentUser || isCoined) return
    if (myCoins < 1) { alert('硬币不足！每天登录可获得 1 枚硬币'); return }
    const res = await api.coinVideo(video.id)
    if (res.success) {
      setIsCoined(true)
      setMyCoins(res.coins || myCoins - 1)
      setVideo((prev: any) => ({ ...prev, coins: (prev.coins || 0) + 1 }))
    } else {
      alert(res.message || '投币失败')
    }
  }

  const handleFavoriteClick = async () => {
    if (!video || !currentUser) return
    if (isFavorited) {
      // 取消收藏
      if (favId) {
        await api.removeFavorite(favId)
        setIsFavorited(false)
        setFavId(null)
        setVideo((prev: any) => ({ ...prev, favorites: Math.max((prev.favorites || 0) - 1, 0) }))
      }
      return
    }
    // 加载收藏夹列表并弹出
    const res = await api.getFavoriteFolders()
    if (res.success) setFavFolders(res.folders || ['默认收藏夹'])
    else setFavFolders(['默认收藏夹'])
    setShowFavModal(true)
  }

  const handleAddToFolder = async (folderName: string) => {
    if (!video) return
    const res = await api.addFavorite({ videoId: video.id, folderName })
    if (res.success) {
      setIsFavorited(true)
      setFavId(res.id || null)
      setVideo((prev: any) => ({ ...prev, favorites: (prev.favorites || 0) + 1 }))
      setShowFavModal(false)
    } else if (res.message === '已收藏') {
      alert('该视频已在收藏夹中')
      setIsFavorited(true)
      setShowFavModal(false)
    }
  }

  const handleCreateFolder = async (folderName: string) => {
    const trimmed = folderName.trim()
    if (!trimmed) return
    setFavFolders(prev => prev.includes(trimmed) ? prev : [...prev, trimmed])
    await handleAddToFolder(trimmed)
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
              <BilibiliPlayer ref={playerRef} src={SAMPLE_VIDEO} poster={video.cover_url || FALLBACK_POSTER} onTimeUpdate={setPlayerTime} />
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
                    <img src={video.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'} alt="" className="w-12 h-12 rounded-full object-cover hover:opacity-80 transition-opacity"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </Link>
                  <div>
                    <Link to={`/user/${video.username}`} className="font-medium text-gray-900 hover:text-[#FB7299] transition-colors">{video.nickname || video.username}</Link>
                    <div className="text-xs text-gray-500">
                      {video.followers_count || 0}粉丝 · {video.following_count || 0}关注
                    </div>
                  </div>
                  {currentUser && currentUser.username !== video.username && (
                    <button onClick={handleFollow} disabled={followLoading}
                      className={`ml-3 px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                        isFollowing ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-[#FB7299] text-white hover:bg-[#e86185]'
                      } ${followLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      {followLoading ? '处理中...' : isFollowing ? '已关注' : '+ 关注'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={handleLike} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-colors ${isLiked ? 'bg-[#FB7299] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <ThumbsUp className="w-4 h-4" />{getViews(video.likes)}</button>
                  <button onClick={handleCoin} disabled={isCoined}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-colors ${isCoined ? 'bg-orange-100 text-orange-500 cursor-not-allowed' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <div className="w-4 h-4 flex items-center justify-center font-bold text-xs">币</div>{getViews(video.coins)}</button>
                  <button onClick={handleFavoriteClick}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-colors ${isFavorited ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Star className={`w-4 h-4 ${isFavorited ? 'fill-yellow-500 text-yellow-500' : ''}`} />{getViews(video.favorites)}</button>
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
                <img src={video.user_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'} alt="" className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div>
                  <div className="font-medium text-gray-900 text-sm">{video.nickname || video.username}</div>
                  <div className="text-xs text-gray-500">{video.followers_count || 0}粉丝</div>
                </div>
              </div>
              <div className="flex gap-2">
                {currentUser && currentUser.username !== video.username && (
                  <button onClick={handleFollow} disabled={followLoading}
                    className={`flex-1 py-2 rounded-full text-sm font-medium transition-colors ${isFollowing ? 'bg-gray-200 text-gray-600' : 'bg-[#FB7299] text-white'} ${followLoading ? 'opacity-60 cursor-not-allowed' : ''}`}>
                    {followLoading ? '处理中...' : isFollowing ? '已关注' : '+ 关注'}
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
                {relatedVideos.slice(0, 8).map((v, i) => (
                  <Link key={v.id} to={videoLink(v.id, 'related', i)} className="flex gap-3 group" onClick={() => window.scrollTo(0, 0)}>
                    <div className="relative w-40 flex-shrink-0">
                      <img src={v.cover_url || `https://images.unsplash.com/photo-${1500000000000+v.id*1000}?w=320&h=180&fit=crop`} alt="" className="w-full aspect-video object-cover rounded-lg"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
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

      {/* 收藏夹弹窗 */}
      {showFavModal && (
        <FavoriteFolderModal
          folders={favFolders}
          onSelect={handleAddToFolder}
          onCreate={handleCreateFolder}
          onClose={() => setShowFavModal(false)}
        />
      )}
    </div>
  )
}

// 收藏夹选择弹窗
function FavoriteFolderModal({ folders, onSelect, onCreate, onClose }: {
  folders: string[];
  onSelect: (folder: string) => void;
  onCreate: (name: string) => void;
  onClose: () => void;
}) {
  const [newFolder, setNewFolder] = useState('')
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl w-[420px] max-h-[80vh] shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">选择收藏夹</h3>
        <div className="max-h-[300px] overflow-y-auto space-y-2 mb-4">
          {folders.map(f => (
            <button key={f} onClick={() => onSelect(f)}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-pink-50 text-sm text-gray-700 hover:text-[#FB7299] transition-colors flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-[#FB7299]" />{f}
            </button>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500 mb-2">创建新收藏夹</p>
          <div className="flex gap-2">
            <input type="text" value={newFolder} onChange={e => setNewFolder(e.target.value)}
              placeholder="输入收藏夹名称" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#FB7299]" />
            <button onClick={() => newFolder.trim() && onCreate(newFolder)}
              className="px-4 py-2 bg-[#FB7299] text-white rounded-lg text-sm hover:bg-[#e86185] flex items-center gap-1">
              <Plus className="w-3 h-3" />创建</button>
          </div>
        </div>
        <button onClick={onClose} className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-gray-600">取消</button>
      </div>
    </div>
  )
}
