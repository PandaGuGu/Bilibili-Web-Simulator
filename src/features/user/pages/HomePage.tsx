import { Link } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { useState, useEffect, useRef } from 'react';
import { Search, User, Flame, ArrowLeft, ArrowRight, RefreshCw, ArrowUp, Bell, Star, Clock, Edit, Download, ChevronDown, Eye, EyeOff, Lock, Loader2 } from 'lucide-react';

export default function HomePage() {
  const { currentUser, contents } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [visibleRows, setVisibleRows] = useState(1); // 初始显示1行
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const login = useStore((state) => state.login);
  
  // 用于 Intersection Observer 的 ref
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  
  // 模拟视频数据
  const videoCards = [
    {
      id: 1,
      title: '科比经典比赛回顾：最后的曼巴精神',
      thumbnail: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=250&fit=crop',
      views: '7.7万',
      danmaku: '86',
      duration: '02:28',
      up: '篮球爱好者',
      date: '06-05'
    },
    {
      id: 2,
      title: '男生化妆教程：日常出门精致妆容分享',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
      views: '1.2万',
      danmaku: '6',
      duration: '01:36',
      up: '时尚达人',
      date: '06-05'
    },
    {
      id: 3,
      title: '日本东京街头探店vlog：发现隐藏美食',
      thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=250&fit=crop',
      views: '92.3万',
      danmaku: '6457',
      duration: '21:33',
      up: '旅行日记',
      likes: '8.5万'
    },
    {
      id: 4,
      title: '【游戏攻略】原神新版本活动玩法详解',
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=250&fit=crop',
      views: '5.8万',
      danmaku: '126',
      duration: '04:03',
      up: '游戏解说',
      date: '06-05'
    },
    {
      id: 5,
      title: '毕业季vlog：和最好的朋友一起旅行',
      thumbnail: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=250&fit=crop',
      views: '59.3万',
      danmaku: '836',
      duration: '21:44',
      up: '日常记录',
      date: '06-05'
    },
    {
      id: 6,
      title: '英语四级备考技巧：听力满分攻略',
      thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
      views: '11.3万',
      danmaku: '392',
      duration: '40:18',
      up: '学习达人',
      date: '06-04'
    },
    {
      id: 7,
      title: '美食探店：百年老字号正宗老北京涮羊肉',
      thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=250&fit=crop',
      views: '23.5万',
      danmaku: '412',
      duration: '15:22',
      up: '美食探店',
      date: '06-04'
    },
    {
      id: 8,
      title: '汽车评测：2024款电动车对比试驾',
      thumbnail: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&h=250&fit=crop',
      views: '16.8万',
      danmaku: '289',
      duration: '28:15',
      up: '汽车科技',
      date: '06-04'
    },
    {
      id: 9,
      title: '健身教程：在家也能练的马甲线养成计划',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
      views: '88.2万',
      danmaku: '1523',
      duration: '12:45',
      up: '健身教练',
      likes: '12.3万'
    },
    {
      id: 10,
      title: '摄影入门：手机拍大片的构图技巧',
      thumbnail: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=250&fit=crop',
      views: '34.1万',
      danmaku: '567',
      duration: '18:30',
      up: '摄影师',
      date: '06-03'
    },
    {
      id: 11,
      title: '编程入门：Python小白学习路线分享',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop',
      views: '45.6万',
      danmaku: '891',
      duration: '42:10',
      up: '程序员',
      date: '06-03'
    },
    {
      id: 12,
      title: '手工DIY：废旧物品变身精美装饰品',
      thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=250&fit=crop',
      views: '12.8万',
      danmaku: '234',
      duration: '18:22',
      up: '手工达人',
      date: '06-03'
    },
    {
      id: 13,
      title: '宠物日常：我家猫咪的搞笑瞬间合集',
      thumbnail: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca2dae?w=400&h=250&fit=crop',
      views: '156.7万',
      danmaku: '3421',
      duration: '08:45',
      up: '铲屎官',
      likes: '18.9万'
    },
    {
      id: 14,
      title: '音乐教学：尤克里里入门弹唱教程',
      thumbnail: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=250&fit=crop',
      views: '67.3万',
      danmaku: '987',
      duration: '25:30',
      up: '音乐老师',
      date: '06-02'
    },
    {
      id: 15,
      title: '职场分享：应届生面试经验总结',
      thumbnail: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=250&fit=crop',
      views: '89.2万',
      danmaku: '1234',
      duration: '32:15',
      up: '职场前辈',
      likes: '23.4万'
    },
    {
      id: 16,
      title: '户外探险：周末去爬山露营vlog',
      thumbnail: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&h=250&fit=crop',
      views: '34.5万',
      danmaku: '567',
      duration: '28:40',
      up: '户外达人',
      date: '06-02'
    },
    {
      id: 17,
      title: '绘画教程：水彩画入门风景技法',
      thumbnail: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=250&fit=crop',
      views: '45.1万',
      danmaku: '678',
      duration: '45:20',
      up: '画师',
      date: '06-02'
    },
    {
      id: 18,
      title: '美食制作：家常宫保鸡丁做法',
      thumbnail: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=250&fit=crop',
      views: '234.6万',
      danmaku: '2456',
      duration: '12:15',
      up: '美食博主',
      likes: '45.6万'
    },
    {
      id: 19,
      title: '旅行攻略：云南大理5日游行程规划',
      thumbnail: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=250&fit=crop',
      views: '78.9万',
      danmaku: '890',
      duration: '22:30',
      up: '旅行家',
      date: '06-01'
    },
    {
      id: 20,
      title: '穿搭分享：夏季简约风穿搭推荐',
      thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=250&fit=crop',
      views: '156.8万',
      danmaku: '1678',
      duration: '15:45',
      up: '时尚博主',
      likes: '34.5万'
    }
  ];

  // 分类标签
  const categoryRow1 = ['番剧', '国创', '综艺', '动画', '鬼畜', '舞蹈', '娱乐', '科技数码', '美食', '汽车', '体育运动'];
  const categoryRow2 = ['电影', '电视剧', '纪录片', '游戏', '音乐', '影视', '知识', '资讯', '小剧场', '时尚美妆', '更多'];
  
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 换一换功能：随机打乱视频顺序
  const [shuffledCards, setShuffledCards] = useState([...videoCards]);
  
  const handleRefresh = () => {
    // 随机打乱视频卡片顺序
    const shuffled = [...videoCards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
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
            <div className="flex-1 max-w-[400px] mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索你感兴趣的内容"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-12 bg-white/80 border border-transparent rounded-full text-sm focus:outline-none focus:border-[#FB7299] focus:bg-white transition-all text-gray-800"
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
                <button className="flex flex-col items-center hover:opacity-80 transition-opacity group relative">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white group-hover:text-[#FB7299]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {currentUser && (
                    <span className="absolute -top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
                  )}
                  <span className="text-xs text-white mt-1 group-hover:text-[#FB7299]">消息</span>
                </button>

                {/* 动态 */}
                <button className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white group-hover:text-[#FB7299]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L14.5 8H21L16 12L18 19L12 15L6 19L8 12L3 8H9.5L12 2Z" />
                    </svg>
                  </div>
                  <span className="text-xs text-white mt-1 group-hover:text-[#FB7299]">动态</span>
                </button>

                {/* 收藏 */}
                <button className="flex flex-col items-center hover:opacity-80 transition-opacity group">
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
                </button>

                {/* 历史 */}
                <button className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center group-hover:border-[#FB7299] transition-colors">
                    <svg className="w-5 h-5 text-white group-hover:text-[#FB7299]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 7v5l3 3" />
                    </svg>
                  </div>
                  <span className="text-xs text-white mt-1 group-hover:text-[#FB7299]">历史</span>
                </button>

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
          {/* 左侧区块：单列通栏轮播海报 */}
          <div className="w-1/3">
            <div className="relative h-full rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-500">
              {/* 轮播海报 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <div className="text-6xl mb-4">🎓</div>
                  <h2 className="text-3xl font-bold mb-2">高考加油！</h2>
                  <p className="text-lg opacity-90">青春无悔，金榜题名</p>
                  <p className="mt-4 text-sm opacity-80">2024高考季特别活动</p>
                </div>
              </div>
              
              {/* 左下角文案 */}
              <div className="absolute bottom-4 left-4">
                <span className="text-white text-lg font-bold">高考加油！</span>
              </div>

              {/* 轮播指示器 */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                <button className="w-2 h-2 bg-white rounded-full"></button>
                <button className="w-2 h-2 bg-white/50 rounded-full"></button>
                <button className="w-2 h-2 bg-white/50 rounded-full"></button>
                <button className="w-2 h-2 bg-white/50 rounded-full"></button>
              </div>

              {/* 左右翻页箭头 */}
              <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
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
                        <div className="flex items-center gap-2">
                          <span>{card.views}播放</span>
                          <span>{card.danmaku}弹幕</span>
                        </div>
                        {card.likes ? (
                          <span className="flex items-center gap-0.5">
                            <span>👍</span> {card.likes}
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
                        <div className="flex items-center gap-2">
                          <span>{card.views}播放</span>
                          <span>{card.danmaku}弹幕</span>
                        </div>
                        {card.likes ? (
                          <span className="flex items-center gap-0.5">
                            <span>👍</span> {card.likes}
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
                            <div className="flex items-center gap-2">
                              <span>{card.views}播放</span>
                              <span>{card.danmaku}弹幕</span>
                            </div>
                            {card.likes ? (
                              <span className="flex items-center gap-0.5">
                                <span>👍</span> {card.likes}
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
