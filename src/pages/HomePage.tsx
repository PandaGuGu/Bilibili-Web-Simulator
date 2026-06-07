import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/index';
import { useState, useEffect, useRef } from 'react';
import { Search, User, Flame, ArrowLeft, ArrowRight, RefreshCw, ArrowUp, Bell, Star, Clock, Edit, Download, ChevronDown, Eye, EyeOff, Lock, Loader2 } from 'lucide-react';
import { api } from '@/api/client';
import { videoLink } from '@/utils/tracking';

// 左侧轮播组件：2.5秒切换 + 左右箭头 + 圆点指示器
function LeftCarousel({ cards }: { cards: any[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (cards.length === 0) return;
    const timer = setInterval(() => setIdx(i => (i + 1) % cards.length), 2500);
    return () => clearInterval(timer);
  }, [cards]);

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx(i => (i - 1 + cards.length) % cards.length);
  };
  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx(i => (i + 1) % cards.length);
  };

  if (cards.length === 0) return null;
  const card = cards[idx];
  return (
    <div className="w-1/3 relative group/carousel">
      <Link to={videoLink(card.id, 'homepage_carousel', idx)} className="block relative h-full rounded-xl overflow-hidden group">
        <img src={card.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h2 className="text-lg font-bold line-clamp-2 mb-1">{card.title}</h2>
          <p className="text-sm opacity-80">{card.views}播放 · {card.danmaku}弹幕</p>
        </div>
      </Link>
      {/* 左箭头 */}
      <button onClick={goPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10">
        <ArrowLeft className="w-4 h-4 text-white" />
      </button>
      {/* 右箭头 */}
      <button onClick={goNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity z-10">
        <ArrowRight className="w-4 h-4 text-white" />
      </button>
      {/* 圆点指示器 */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1.5">
        {cards.map((_, i) => (
          <button key={i} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(i) }}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { currentUser, contents } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // 轮询未读消息数
  useEffect(() => {
    if (!currentUser) { setUnreadCount(0); return }
    const fetchUnread = () => {
      api.getUnreadCount().then(res => {
        if (res.success) setUnreadCount(res.count)
      }).catch(() => {})
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 10000)
    return () => clearInterval(interval)
  }, [currentUser?.username])
  const [visibleRows, setVisibleRows] = useState(3); // 初始显示3行=15个视频
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const navigate = useNavigate();
  
  // 用于 Intersection Observer 的 ref
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  
  
  const [apiVideos, setApiVideos] = useState<any[]>([]);
  useEffect(() => { api.getVideos({ status: 'approved' }).then(res => { if (res.success) setApiVideos(res.videos) }) }, []);
  const videoCards = apiVideos.length > 0 ? apiVideos.map((v: any) => ({
    id: v.id, title: v.title, thumbnail: v.cover_url || `https://placehold.co/400x225/1a1a1a/fb7299?text=${encodeURIComponent((v.title||'').slice(0,12))}`,
    views: (v.views||0)>=10000 ? ((v.views/10000).toFixed(1)+'万') : String(v.views||0),
    danmaku: String(v.danmaku_count||0), duration: '00:00',
    up: v.nickname||v.username, upAvatar: v.user_avatar, upName: v.username,
    date: new Date(v.created_at).toLocaleDateString('zh-CN',{month:'2-digit',day:'2-digit'}),
  })) : [{ id:1,title:'加载中...',thumbnail:'https://placehold.co/400x225/1a1a1a/fb7299?text=Loading',views:'-',danmaku:'-',duration:'--:--',up:'-',upAvatar:'',upName:'',date:'' }]

  const [shuffledCards, setShuffledCards] = useState(videoCards);
  useEffect(() => { setShuffledCards([...videoCards].sort(() => Math.random()-0.5)) }, [apiVideos]);
  const handleRefresh = () => { setShuffledCards([...videoCards].sort(() => Math.random()-0.5)) };
  const categoryRow1 = [
    { label: '动画', to: '/anime' }, { label: '番剧', to: '/anime' }, { label: '国创', to: '/guochuang' },
    { label: '音乐', to: '/music' }, { label: '舞蹈', to: '/dance' }, { label: '游戏', to: '/game' },
    { label: '知识', to: '/knowledge' }, { label: '科技', to: '/tech' }, { label: '运动', to: '/sports' },
    { label: '汽车', to: '/car' }, { label: '生活', to: '/life' },
  ]
  const categoryRow2 = [
    { label: '美食', to: '/food' }, { label: '动物圈', to: '/animal' }, { label: '鬼畜', to: '/kichiku' },
    { label: '时尚', to: '/fashion' }, { label: '娱乐', to: '/entertainment' }, { label: '影视', to: '/movie' },
    { label: '纪录片', to: '/documentary' }, { label: '电影', to: '/movie' }, { label: '电视剧', to: '/movie' },
    { label: '专栏', to: '/columns' }, { label: '更多', to: '/search' },
  ]
  
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('请填写用户名和密码');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await api.login(username, password);
      if (res.success) {
        sessionStorage.setItem('bilibili-token', res.token);
        localStorage.setItem('bilibili-token', res.token);
        const store = useStore.getState();
        store.setCurrentUser({ id: res.user.id, username: res.user.username, role: res.user.role, avatar: res.user.avatar, nickname: res.user.nickname });
        setShowLoginModal(false);
        setUsername('');
        setPassword('');
      } else {
        setError(res.message || '用户名或密码错误');
      }
    } catch {
      setError('网络错误，请稍后再试');
    }
    setIsLoading(false);
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
    
    setVisibleRows(prev => prev + 3); // 每次加载3行=15个视频
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
    const row = [];
    for (let i = 0; i < 5; i++) {
      const dataIndex = (startIndex + i) % Math.max(videoCards.length, 1);
      row.push({
        ...videoCards[dataIndex],
        uid: `feed-r${rowIndex}-c${i}`, // 唯一key，避免与轮播区id冲突
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
              <Link to="/anime" className="text-white hover:text-[#FB7299]">番剧</Link>
              <Link to="/live" className="text-white hover:text-[#FB7299]">直播</Link>
              <Link to="/game" className="text-white hover:text-[#FB7299]">游戏中心</Link>
              <Link to="/vip" className="text-white hover:text-[#FB7299]">会员购</Link>
              <Link to="/comic" className="text-white hover:text-[#FB7299]">漫画</Link>
              <Link to="/esports" className="text-white hover:text-[#FB7299]">赛事</Link>
              <Link to="/classroom" className="text-white hover:text-[#FB7299]">课堂</Link>
              <Link to="/" className="text-white hover:text-[#FB7299] flex items-center gap-1">
                <Download className="w-4 h-4" />下载客户端
              </Link>
            </nav>
            
            {/* 全站搜索栏 */}
            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); }} className="flex-1 max-w-[400px] mx-4">
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
                <Link to={`/user/${currentUser.username}`} className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] flex items-center justify-center group-hover:border-[#FB7299] transition-colors">
                    <span className="text-white text-sm font-bold">{currentUser.username[0].toUpperCase()}</span>
                  </div>
                  <span className="text-xs text-white mt-1 group-hover:text-[#FB7299]">头像</span>
                </Link>
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
                <Link to={currentUser ? `/messages/${currentUser.username}` : '/login/user'} onClick={() => setUnreadCount(0)} className="flex flex-col items-center hover:opacity-80 transition-opacity group relative">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white group-hover:text-[#FB7299]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {currentUser && unreadCount > 0 && (
                    <span className="absolute -top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                  <span className="text-xs text-white mt-1 group-hover:text-[#FB7299]">消息</span>
                </Link>

                {/* 动态 */}
                <Link to="/feed" className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white group-hover:text-[#FB7299]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L14.5 8H21L16 12L18 19L12 15L6 19L8 12L3 8H9.5L12 2Z" />
                    </svg>
                  </div>
                  <span className="text-xs text-white mt-1 group-hover:text-[#FB7299]">动态</span>
                </Link>

                {/* 收藏 */}
                <Link to="/favorites" className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white group-hover:text-[#FB7299]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      <circle cx="10.5" cy="11" r="0.5" fill="currentColor" />
                      <circle cx="13.5" cy="11" r="0.5" fill="currentColor" />
                      <path d="M10.5 13.5Q12 14.5 13.5 13.5" stroke="currentColor" strokeWidth="0.4" fill="none" />
                    </svg>
                  </div>
                  <span className="text-xs text-white mt-1 group-hover:text-[#FB7299]">收藏</span>
                </Link>

                {/* 历史 */}
                <Link to="/history" className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center group-hover:border-[#FB7299] transition-colors">
                    <svg className="w-5 h-5 text-white group-hover:text-[#FB7299]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 3" />
                    </svg>
                  </div>
                  <span className="text-xs text-white mt-1 group-hover:text-[#FB7299]">历史</span>
                </Link>

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
                <Link 
                  to={currentUser ? "/creation" : "/login/user"}
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

      {/* 导航栏下方全屏通栏Banner大图 */}
      <div className="w-full h-[160px] relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&h=600&fit=crop" 
          alt="风景banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent"></div>
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
              <button className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <span className="text-[10px] text-gray-500">动态</span>
              </button>
              <button className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors">
                  <Flame className="w-6 h-6 text-red-500" />
                </div>
                <span className="text-[10px] text-gray-500">热门</span>
              </button>
            </div>

            {/* 中间：两排分类标签按钮 - 与右侧等宽等高 */}
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              {/* 第一行标签 - 使用grid布局确保等宽，与右侧按钮等高 */}
              <div className="grid grid-cols-11 gap-2">
                {categoryRow1.map((cat, idx) => (
                  <Link key={idx} to={cat.to}
                    className="px-3 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors whitespace-nowrap truncate text-center block">
                    {cat.label}
                  </Link>
                ))}
              </div>
              {/* 第二行标签 - 使用grid布局确保等宽，与右侧按钮等高 */}
              <div className="grid grid-cols-11 gap-2">
                {categoryRow2.map((cat, idx) => (
                  <Link key={idx} to={cat.to}
                    className={`px-3 py-1.5 rounded text-xs transition-colors whitespace-nowrap truncate text-center flex items-center justify-center gap-1 block ${
                      cat.label === '知识' 
                        ? 'bg-gray-300 text-gray-800 font-medium' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}>
                    {cat.label}
                    {cat.label === '更多' && <ChevronDown className="w-3 h-3" />}
                  </Link>
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
                <Link to="/columns" className="px-3 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors">专栏</Link>
                <Link to="/events" className="px-3 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors">活动</Link>
                <Link to="/community" className="px-3 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors">社区中心</Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Link to="/live" className="px-3 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors">直播</Link>
                <Link to="/classroom" className="px-3 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors">课堂</Link>
                <Link to="/music" className="px-3 py-1.5 bg-gray-100 rounded text-xs hover:bg-gray-200 transition-colors">新歌热榜</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 三、页面第三层：核心内容陈列区 */}
      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex gap-6 items-stretch">
          {/* 左侧：2.5秒自动轮播视频封面 */}
          <LeftCarousel cards={shuffledCards.slice(0, 6)} />


          {/* 右侧区块：2行×3列视频卡片网格 */}
          <div className="w-2/3 relative">
            <div className="grid grid-cols-3 gap-4">
              {/* 第一行 */}
              {shuffledCards.slice(0, 3).map((card, i) => (
                <Link key={card.id} to={videoLink(card.id, 'homepage_grid', i)} className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                    <div className="relative aspect-video bg-gray-200 overflow-hidden">
                      <img 
                        src={card.thumbnail} 
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225"><rect width="400" height="225" fill="#1a1a1a"/><text x="200" y="115" text-anchor="middle" fill="#999" font-size="13">暂无封面</text></svg>') }}
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
                        <div className="flex items-center gap-2">
                          <span>{card.views}播放</span>
                          <span>{card.danmaku}弹幕</span>
                        </div>
                        {false ? (
                          <span className="flex items-center gap-0.5">
                            <span>👍</span> {card.up}
                          </span>
                        ) : (
                          <span>{card.up}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              
              {/* 第二行 */}
              {shuffledCards.slice(3, 6).map((card, i) => (
                <Link key={card.id} to={videoLink(card.id, 'homepage_grid', i + 3)} className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                    <div className="relative aspect-video bg-gray-200 overflow-hidden">
                      <img 
                        src={card.thumbnail} 
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225"><rect width="400" height="225" fill="#1a1a1a"/><text x="200" y="115" text-anchor="middle" fill="#999" font-size="13">暂无封面</text></svg>') }}
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
                        <div className="flex items-center gap-2">
                          <span>{card.views}播放</span>
                          <span>{card.danmaku}弹幕</span>
                        </div>
                        {false ? (
                          <span className="flex items-center gap-0.5">
                            <span>👍</span> {card.up}
                          </span>
                        ) : (
                          <span>{card.up}</span>
                        )}
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
                  {getVideoRow(rowIndex).map((card, colIdx) => (
                    <Link key={card.uid} to={videoLink(card.id, 'homepage_feed', rowIndex * 5 + colIdx)} className="group">
                      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                        <div className="relative aspect-video bg-gray-200 overflow-hidden">
                          <img 
                            src={card.thumbnail} 
                            alt={card.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225"><rect width="400" height="225" fill="#1a1a1a"/><text x="200" y="115" text-anchor="middle" fill="#999" font-size="13">暂无封面</text></svg>') }}
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
                            <div className="flex items-center gap-2">
                              <span>{card.views}播放</span>
                              <span>{card.danmaku}弹幕</span>
                            </div>
                            {false ? (
                              <span className="flex items-center gap-0.5">
                                <span>👍</span> {card.up}
                              </span>
                            ) : (
                              <span>{card.up}</span>
                            )}
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
