import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { api } from '@/api/client';
import { useState, useEffect, useRef } from 'react';
import { Search, User, Flame, ArrowLeft, ArrowRight, RefreshCw, ArrowUp, Bell, Star, Clock, Edit, Download, ChevronDown, Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import UserDropdown from '@/features/user/components/UserDropdown';
import MessageDropdown from '@/features/user/components/MessageDropdown';
import FeedDropdown from '@/features/user/components/FeedDropdown';
import FavoriteDropdown from '@/features/user/components/FavoriteDropdown';
import HistoryDropdown from '@/features/user/components/HistoryDropdown';
import UploadDropdown from '@/features/user/components/UploadDropdown';

// 大网格轮播组件 — 自动水平滑动，每1秒切换
function HeroCarousel({ videos }: { videos: Array<{ id: number; title: string; thumbnail: string }> }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  const next = () => setCurrent((c) => (c + 1) % videos.length)
  const prev = () => setCurrent((c) => (c - 1 + videos.length) % videos.length)

  // 每秒自动切换
  useEffect(() => {
    timerRef.current = setInterval(next, 2500)
    return () => clearInterval(timerRef.current)
  }, [])

  // 手动操作时重置计时器
  const manual = (fn: () => void) => {
    fn()
    clearInterval(timerRef.current)
    timerRef.current = setInterval(next, 2500)
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-900">
      {/* 当前视频封面 */}
      <Link to={`/video/${videos[current]?.id}`} className="block w-full h-full">
        <div className="relative w-full h-full">
          <img
            src={videos[current]?.thumbnail}
            alt={videos[current]?.title}
            className="w-full h-full object-cover transition-opacity duration-500"
          />
          {/* 底部渐变遮罩 + 标题 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-4 right-4 text-white">
            <h2 className="text-lg font-bold line-clamp-2 mb-1">{videos[current]?.title}</h2>
          </div>
        </div>
      </Link>

      {/* 左箭头 — 半透明白色，悬浮左侧边缘 */}
      <button
        onClick={() => manual(prev)}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>

      {/* 右箭头 — 半透明白色，悬浮右侧边缘 */}
      <button
        onClick={() => manual(next)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* 底部指示器 — 4个透明白色小方格 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => manual(() => setCurrent(i))}
            className="w-4 h-4 rounded-sm border border-white/60 transition-colors"
            style={{ backgroundColor: i === current ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.15)' }}
          />
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const { currentUser, contents, users } = useStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [visibleRows, setVisibleRows] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const login = useStore((state) => state.login);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 从数据库获取真实视频
  const [apiVideos, setApiVideos] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await api.getVideos({ status: 'approved' });
      if (res.success) setApiVideos(res.videos);
    }
    load();
  }, []);

  const getViews = (n: number) => {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
    return String(n);
  };
  const getDuration = (sec: number) => {
    if (!sec) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 用真实数据构建视频卡片
  const videoCards = apiVideos.length > 0 ? apiVideos.map((v: any) => ({
    id: v.id,
    title: v.title,
    thumbnail: v.cover_url || `https://images.unsplash.com/photo-${1500000000000 + v.id * 1000}?w=400&h=250&fit=crop`,
    views: getViews(v.views),
    danmaku: String(v.danmaku_count || 0),
    duration: getDuration(v.duration),
    up: v.nickname || v.username,
    upAvatar: v.user_avatar,
    upName: v.username,
    date: new Date(v.created_at).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
  })) : [
    { id: 1, title: '加载中...', thumbnail: '', views: '', danmaku: '', duration: '', up: '', upAvatar: '', upName: '', date: '' }
  ];

  // 分类标签
  const categoryRow1 = ['番剧', '国创', '综艺', '动画', '鬼畜', '舞蹈', '娱乐', '科技数码', '美食', '汽车', '体育运动'];
  const categoryRow2 = ['电影', '电视剧', '纪录片', '游戏', '音乐', '影视', '知识', '资讯', '小剧场', '时尚美妆', '更多'];
  
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 换一换功能
  const [shuffledCards, setShuffledCards] = useState(videoCards);

  useEffect(() => {
    setShuffledCards([...videoCards].sort(() => Math.random() - 0.5));
  }, [apiVideos]);

  const handleRefresh = () => {
    setShuffledCards([...videoCards].sort(() => Math.random() - 0.5));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('请填写用户名和密码');
      return;
    }
    
    setIsLoading(true);
    
    // 模拟登录延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = login(username, password, 'user');
    setIsLoading(false);
    
    if (success) {
      setShowLoginModal(false);
      setUsername('');
      setPassword('');
    } else {
      setError('用户名或密码错误');
    }
  };

  // 控制回到顶部按钮的显示/隐藏
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 当页面滚动超过300px时显示按钮
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 无限加载更多视频
  const loadMoreRows = async () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    
    // 模拟加载延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setVisibleRows(prev => prev + 1);
    setIsLoadingMore(false);
  };

  // 设置 Intersection Observer
  useEffect(() => {
    // 清理之前的 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 创建新的 observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore) {
          loadMoreRows();
        }
      },
      { threshold: 0.1 }
    );

    // 观察 sentinel 元素
    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    // 清理函数
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoadingMore]);

  // 生成视频行数据
  const getVideoRow = (rowIndex: number) => {
    const startIndex = 6 + rowIndex * 5;
    const endIndex = startIndex + 5;
    // 如果数据不够，循环使用现有数据
    const row = [];
    for (let i = 0; i < 5; i++) {
      const dataIndex = (startIndex + i) % videoCards.length;
      row.push({
        ...videoCards[dataIndex],
        id: videoCards[dataIndex].id + rowIndex * 100
      });
    }
    return row;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 一、页面第一层：全屏通栏顶部导航区 */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="flex items-center h-14 justify-between">
            {/* 左侧：网站功能导航入口 */}
            <nav className="hidden md:flex items-center gap-3 text-sm">
              <Link to="/" className="text-white hover:text-[#FB7299] font-medium">首页</Link>
              <Link to="/" className="text-white hover:text-[#FB7299]">番剧</Link>
              <Link to="/" className="text-white hover:text-[#FB7299]">直播</Link>
              <Link to="/" className="text-white hover:text-[#FB7299]">游戏中心</Link>
              <Link to="/" className="text-white hover:text-[#FB7299]">会员购</Link>
              <Link to="/" className="text-white hover:text-[#FB7299]">漫画</Link>
              <Link to="/" className="text-white hover:text-[#FB7299]">赛事</Link>
              <Link to="/" className="text-white hover:text-[#FB7299]">高考季</Link>
              <Link to="/" className="text-white hover:text-[#FB7299] flex items-center gap-1">
                <Download className="w-4 h-4" />下载客户端
              </Link>
            </nav>
            
            {/* 全站搜索栏 */}
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`) }}
              className="flex-1 max-w-[400px] mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索你感兴趣的内容"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-12 bg-white/80 border border-transparent rounded-full text-sm focus:outline-none focus:border-[#FB7299] focus:bg-white transition-all text-gray-800"
                />
                <button type="submit" className="absolute right-0 top-0 w-12 h-10 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-r-full flex items-center justify-center hover:opacity-90 transition-opacity">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>

            {/* 右侧：用户功能区 */}
            <div className="flex items-center gap-1">
              {/* 用户头像 */}
              {currentUser ? (
                <UserDropdown
                  currentUser={currentUser}
                  avatar={currentUser.username ? users.find(u => u.username === currentUser.username)?.avatar : undefined}
                  textColor="text-white"
                />
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] flex items-center justify-center group-hover:border-[#FB7299] transition-colors">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-white mt-1 group-hover:text-[#FB7299]">登录</span>
                </button>
              )}
              
              {/* 6个常规图标选项 + 1个粉色按钮 */}
              <div className="flex items-center gap-3">
                {/* 大会员 */}
                <button className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center group-hover:border-[#FB7299] transition-colors">
                    <span className="text-white font-bold text-base group-hover:text-[#FB7299]">大</span>
                  </div>
                  <span className="text-xs text-white mt-1 group-hover:text-[#FB7299]">大会员</span>
                </button>

                {/* 消息 */}
                <MessageDropdown currentUser={currentUser} textColor="text-white" />

                {/* 动态 */}
                <FeedDropdown currentUser={currentUser} textColor="text-white" />

                {/* 收藏 */}
                <FavoriteDropdown currentUser={currentUser} textColor="text-white" />

                {/* 历史 */}
                <HistoryDropdown currentUser={currentUser} textColor="text-white" borderColor="border-white" />

                {/* 创作中心 */}
                <Link to={currentUser ? "/creation" : "/login/user"} className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white group-hover:text-[#FB7299]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C9.5 2 7 3.5 7 6C7 7.5 8 9 9 10.5C9.5 11.25 9.75 12 10 13H14C14.25 12 14.5 11.25 15 10.5C16 9 17 7.5 17 6C17 3.5 14.5 2 12 2Z" />
                      <path d="M10 14H14L15 18H9L10 14Z" />
                      <path d="M11 18L11 20H13L13 18" />
                    </svg>
                  </div>
                  <span className="text-xs text-white mt-1 group-hover:text-[#FB7299]">创作中心</span>
                </Link>

                {/* 投稿按钮 */}
                <UploadDropdown currentUser={currentUser} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 导航栏下方全屏通栏Banner大图 */}
      <div className="w-full h-[160px] relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=600&fit=crop" 
          alt="风景banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* 渐变遮罩层 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
        {/* 文字内容 */}
        <div className="relative h-full flex items-center justify-center pt-12">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">欢迎来到B站</h1>
            <p className="text-base opacity-90">发现精彩内容，分享你的世界</p>
          </div>
        </div>
      </div>

      {/* 二、页面第二层：二级分类标签导航区 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-4 py-4">
          <div className="flex gap-2">
            {/* 最左侧：快捷功能双按钮 - 改为并排 */}
            <div className="flex gap-3 flex-shrink-0">
              <button className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <User className="w-6 h-6 text-gray-600" />
              </button>
              <button className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors">
                <Flame className="w-6 h-6 text-red-500" />
              </button>
            </div>

            {/* 中间：两排分类标签按钮 - 与右侧等宽等高 */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              {/* 第一行标签 - 使用grid布局确保等宽，与右侧按钮等高 */}
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
              {/* 第二行标签 - 使用grid布局确保等宽，与右侧按钮等高 */}
              <div className="grid grid-cols-11 gap-2">
                {categoryRow2.map((cat, idx) => (
                  <button
                    key={idx}
                    className="px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap truncate text-center flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200"
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

            {/* 最右侧：辅助功能入口 - 固定宽度 */}
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

      {/* 三、页面第三层：核心内容陈列区 */}
      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex gap-6 items-stretch">
          {/* 左侧区块：大网格视频封面轮播 */}
          <div className="w-1/3">
            <HeroCarousel videos={shuffledCards.slice(0, 4)} />
          </div>

          {/* 右侧区块：2行×3列视频卡片网格 */}
          <div className="w-2/3 relative">
            <div className="grid grid-cols-3 gap-4">
              {/* 第一行 */}
              {shuffledCards.slice(0, 3).map((card) => (
                <Link key={card.id} to={`/video/${card.id}`} className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                    <div className="relative aspect-video bg-gray-200 overflow-hidden">
                      <img 
                        src={card.thumbnail} 
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {card.duration}
                      </div>
                    </div>
                    <div className="p-2">
                      <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 group-hover:text-[#FB7299] transition-colors">
                        {card.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate">{card.views}播放</span>
                          <span className="flex-shrink-0">{card.danmaku}弹幕</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {card.upAvatar ? (
                            <img src={card.upAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-[8px] text-white">{card.up?.[0] || '?'}</span>
                          )}
                          <span className="truncate max-w-[60px]">{card.up}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              {/* 第二行 */}
              {shuffledCards.slice(3, 6).map((card) => (
                <Link key={card.id} to={`/video/${card.id}`} className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                    <div className="relative aspect-video bg-gray-200 overflow-hidden">
                      <img 
                        src={card.thumbnail} 
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {card.duration}
                      </div>
                    </div>
                    <div className="p-2">
                      <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 group-hover:text-[#FB7299] transition-colors">
                        {card.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="truncate">{card.views}播放</span>
                          <span className="flex-shrink-0">{card.danmaku}弹幕</span>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {card.upAvatar ? (
                            <img src={card.upAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-[8px] text-white">{card.up?.[0] || '?'}</span>
                          )}
                          <span className="truncate max-w-[60px]">{card.up}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 页面最右侧边缘悬浮功能按钮 */}
            <div className="absolute -right-16 top-0 flex flex-col gap-3">
              <button 
                onClick={handleRefresh}
                className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110"
                title="换一换"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* 下方无限滚动视频网格 */}
        <div className="mt-10">
          {/* 渲染多行视频 */}
            {Array.from({ length: visibleRows }).map((_, rowIndex) => (
              <div key={rowIndex} className={rowIndex > 0 ? 'mt-6' : ''}>
                <div className="grid grid-cols-5 gap-4">
                  {getVideoRow(rowIndex).map((card) => (
                    <Link key={card.id} to={`/video/${card.id}`} className="group">
                      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                        <div className="relative aspect-video bg-gray-200 overflow-hidden">
                          <img 
                            src={card.thumbnail} 
                            alt={card.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                            {card.duration}
                          </div>
                        </div>
                        <div className="p-2">
                          <h3 className="text-sm text-gray-800 line-clamp-2 mb-2 group-hover:text-[#FB7299] transition-colors">
                            {card.title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="truncate">{card.views}播放</span>
                              <span className="flex-shrink-0">{card.danmaku}弹幕</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {card.upAvatar ? (
                                <img src={card.upAvatar} alt="" className="w-4 h-4 rounded-full object-cover" />
                              ) : (
                                <span className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-[8px] text-white">{card.up?.[0] || '?'}</span>
                              )}
                              <span className="truncate max-w-[60px]">{card.up}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

          {/* 加载更多指示器 */}
          <div ref={sentinelRef} className="py-10 flex justify-center">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>加载中...</span>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-10">
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>© 2024 哔哩哔哩 (゜-゜)つロ 干杯~ All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* 固定定位的回到顶部按钮 - 跟随页面滚动 */}
      <button 
        onClick={handleScrollToTop}
        className="fixed right-6 bottom-6 w-12 h-12 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-full shadow-xl flex items-center justify-center hover:opacity-90 transition-all hover:scale-110 z-40"
        title="回到顶部"
      >
        <ArrowUp className="w-6 h-6 text-white" />
      </button>

      {/* 登录弹窗 */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 半透明背景 */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLoginModal(false)}
          />
          
          {/* 弹窗内容 */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 mx-4">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] rounded-xl mb-4 shadow-lg">
                <span className="text-white text-2xl font-bold">B</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">普通用户登录</h1>
              <p className="text-gray-500 mt-2">欢迎回来，请登录您的账户</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FB7299] focus:border-transparent transition-all"
                    placeholder="请输入用户名"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FB7299] focus:border-transparent transition-all"
                    placeholder="请输入密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登录'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                还没有账号？
                <Link 
                  to="/register/user" 
                  onClick={() => setShowLoginModal(false)}
                  className="text-[#FB7299] hover:text-pink-600 font-medium ml-1"
                >
                  立即注册
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
