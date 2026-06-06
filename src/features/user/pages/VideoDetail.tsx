import { useParams, Link } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { Search, User, Flame, Download, ChevronDown, Share2, Star, Heart, MessageCircle, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>()
  const { currentUser } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)

  // 分类标签
  const categoryRow1 = ['番剧', '国创', '综艺', '动画', '鬼畜', '舞蹈', '娱乐', '科技数码', '美食', '汽车', '体育运动']
  const categoryRow2 = ['电影', '电视剧', '纪录片', '游戏', '音乐', '影视', '知识', '资讯', '小剧场', '时尚美妆', '更多']

  // 模拟视频数据
  const video = {
    id: id || '1',
    title: '从学校到社会都是"只筛选，不培养"？',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=450&fit=crop',
    views: '11.9万',
    danmaku: '6',
    likes: '577',
    coins: '81',
    favorites: '335',
    shares: '44',
    uploadDate: '2026-06-03',
    duration: '01:36',
    description: '从学校到社会，我们经历的都是筛选机制，而不是培养机制。这个视频聊聊我的观察和思考。',
    up: {
      name: '方人也marine',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      fans: '12.5万'
    }
  }

  // 相关视频
  const relatedVideos = [
    { id: '2', title: '除了高考，我们还有很多把人生搞砸的机会', thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=320&h=180&fit=crop', views: '8.5万', up: '方人也marine' },
    { id: '3', title: '中国优秀大学毁掉的人远远多于培养的人', thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=320&h=180&fit=crop', views: '6.2万', up: '方人也marine' },
    { id: '4', title: '如何把导师培养成院士？', thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=320&h=180&fit=crop', views: '4.8万', up: '方人也marine' },
    { id: '5', title: '穷人的教育，落后在哪方面？', thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=320&h=180&fit=crop', views: '3.9万', up: '方人也marine' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 一、页面第一层：全屏通栏顶部导航区 */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="flex items-center h-14 justify-between">
            {/* 左侧：网站功能导航入口 */}
            <nav className="hidden md:flex items-center gap-3 text-sm">
              <Link to="/" className="text-gray-800 hover:text-[#FB7299] font-medium">首页</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">番剧</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">直播</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">游戏中心</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">会员购</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">漫画</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">赛事</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">高考季</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299] flex items-center gap-1">
                <Download className="w-4 h-4" />下载客户端
              </Link>
            </nav>
            
            {/* 全站搜索栏 */}
            <div className="flex-1 max-w-[400px] mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索你感兴趣的内容"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-12 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:border-[#FB7299] focus:bg-white transition-all text-gray-800"
                />
                <button className="absolute right-0 top-0 w-12 h-10 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-r-full flex items-center justify-center hover:opacity-90 transition-opacity">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* 右侧：用户功能区 */}
            <div className="flex items-center gap-1">
              {/* 用户头像 */}
              {currentUser ? (
                <button className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] flex items-center justify-center group-hover:border-[#FB7299] transition-colors">
                    <span className="text-white text-sm font-bold">{currentUser.username[0].toUpperCase()}</span>
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">头像</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] flex items-center justify-center group-hover:border-[#FB7299] transition-colors">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">登录</span>
                </button>
              )}
              
              {/* 6个常规图标选项 + 1个粉色按钮 */}
              <div className="flex items-center gap-3">
                {/* 大会员 */}
                <button className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:border-[#FB7299] transition-colors">
                    <span className="text-gray-700 font-bold text-base group-hover:text-[#FB7299]">大</span>
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">大会员</span>
                </button>

                {/* 消息 */}
                <button className="flex flex-col items-center hover:opacity-80 transition-opacity group relative">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700 group-hover:text-[#FB7299]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {currentUser && (
                    <span className="absolute -top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
                  )}
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">消息</span>
                </button>

                {/* 动态 */}
                <button className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700 group-hover:text-[#FB7299]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L14.5 8H21L16 12L18 19L12 15L6 19L8 12L3 8H9.5L12 2Z" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">动态</span>
                </button>

                {/* 收藏 */}
                <button className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700 group-hover:text-[#FB7299]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="10.5" cy="11" r="0.5" fill="currentColor" />
                      <circle cx="13.5" cy="11" r="0.5" fill="currentColor" />
                      <path d="M10.5 13.5Q12 14.5 13.5 13.5" stroke="currentColor" strokeWidth="0.4" fill="none" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">收藏</span>
                </button>

                {/* 历史 */}
                <button className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:border-[#FB7299] transition-colors">
                    <svg className="w-5 h-5 text-gray-700 group-hover:text-[#FB7299]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 3" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">历史</span>
                </button>

                {/* 创作中心 */}
                <button className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700 group-hover:text-[#FB7299]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C9.5 2 7 3.5 7 6C7 7.5 8 9 9 10.5C9.5 11.25 9.75 12 10 13H14C14.25 12 14.5 11.25 15 10.5C16 9 17 7.5 17 6C17 3.5 14.5 2 12 2Z" />
                      <path d="M10 14H14L15 18H9L10 14Z" />
                      <path d="M11 18L11 20H13L13 18" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">创作中心</span>
                </button>

                {/* 投稿按钮 */}
                <Link 
                  to={currentUser ? "/dashboard" : "/register/user"}
                  className="flex flex-col items-center"
                >
                  <div className="bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] px-5 py-2 rounded-2xl flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span className="text-white font-medium text-sm">投稿</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 二、页面第二层：二级分类标签导航区 */}
      <div className="bg-white border-b border-gray-200 mt-20">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <div className="flex gap-2">
            {/* 最左侧：快捷功能双按钮 */}
            <div className="flex gap-3 flex-shrink-0">
              <button className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <User className="w-6 h-6 text-gray-600" />
              </button>
              <button className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors">
                <Flame className="w-6 h-6 text-red-500" />
              </button>
            </div>

            {/* 中间：两排分类标签按钮 */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              {/* 第一行标签 */}
              <div className="grid grid-cols-11 gap-2">
                {categoryRow1.map((cat, idx) => (
                  <button
                    key={idx}
                    className="px-3 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors whitespace-nowrap truncate text-center"
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {/* 第二行标签 */}
              <div className="grid grid-cols-11 gap-2">
                {categoryRow2.map((cat, idx) => (
                  <button
                    key={idx}
                    className={`px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap truncate text-center flex items-center justify-center gap-1 ${
                      cat === '知识' 
                        ? 'bg-gray-300 text-gray-800 font-medium' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                    {cat === '更多' && <ChevronDown className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 分割线 */}
            <div className="flex-shrink-0 py-1">
              <div className="w-px h-full bg-gray-300"></div>
            </div>

            {/* 最右侧：辅助功能入口 */}
            <div className="hidden lg:block flex-shrink-0">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <Link to="/" className="px-3 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors">专栏</Link>
                <Link to="/" className="px-3 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors">活动</Link>
                <Link to="/" className="px-3 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors">社区中心</Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Link to="/" className="px-3 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors">直播</Link>
                <Link to="/" className="px-3 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors">课堂</Link>
                <Link to="/" className="px-3 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors">新歌热榜</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 pt-6">
        <div className="flex gap-6">
          {/* 左侧：视频区域 */}
          <div className="flex-1">
            {/* 视频播放器 */}
            <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors">
                  <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-1"></div>
                </div>
              </div>
            </div>

            {/* 视频信息 */}
            <div className="mt-4">
              <h1 className="text-xl font-bold text-gray-900 mb-3">{video.title}</h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{video.views}播放</span>
                  <span>{video.danmaku}弹幕</span>
                  <span>{video.uploadDate}发布</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">分享</span>
                  </button>
                  <button className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">收藏</span>
                  </button>
                  <button className="flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* UP主信息 */}
              <div className="flex items-center justify-between mt-4 py-4 border-t border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <img 
                    src={video.up.avatar} 
                    alt={video.up.name} 
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{video.up.name}</div>
                    <div className="text-sm text-gray-500">{video.up.fans}粉丝</div>
                  </div>
                </div>
                <button className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors font-medium">
                  + 关注
                </button>
              </div>

              {/* 互动按钮 */}
              <div className="flex items-center gap-4 py-4">
                <button className="flex items-center gap-2 px-6 py-2 bg-pink-50 text-pink-500 rounded-full hover:bg-pink-100 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>{video.likes}</span>
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-blue-50 text-blue-500 rounded-full hover:bg-blue-100 transition-colors">
                  <div className="w-5 h-5 flex items-center justify-center font-bold">币</div>
                  <span>{video.coins}</span>
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-yellow-50 text-yellow-600 rounded-full hover:bg-yellow-100 transition-colors">
                  <Star className="w-5 h-5" />
                  <span>{video.favorites}</span>
                </button>
                <button className="flex items-center gap-2 px-6 py-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>{video.shares}</span>
                </button>
              </div>

              {/* 视频简介 */}
              <div className="bg-gray-100 rounded-lg p-4">
                <p className="text-gray-700 text-sm">{video.description}</p>
              </div>

              {/* 评论区 */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-gray-700" />
                  <h2 className="text-lg font-bold text-gray-900">评论</h2>
                </div>
                <div className="text-center py-12 text-gray-500">
                  <p>评论区功能开发中...</p>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：相关视频 */}
          <div className="w-80 hidden lg:block">
            <h3 className="font-bold text-gray-900 mb-4">相关推荐</h3>
            <div className="space-y-3">
              {relatedVideos.map((item) => (
                <Link key={item.id} to={`/video/${item.id}`} className="flex gap-3 group">
                  <div className="relative w-40 flex-shrink-0">
                    <img 
                      src={item.thumbnail} 
                      alt={item.title} 
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm text-gray-900 line-clamp-2 group-hover:text-pink-500 transition-colors">
                      {item.title}
                    </h4>
                    <div className="mt-1 text-xs text-gray-500">{item.views}播放</div>
                    <div className="text-xs text-gray-500">{item.up}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
