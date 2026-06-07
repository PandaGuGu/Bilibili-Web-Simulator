import { Link } from 'react-router-dom'
import { useStore } from '@/store/index'
import UserDropdown from '@/components/UserDropdown'
import MessageDropdown from '@/components/MessageDropdown'
import FeedDropdown from '@/components/FeedDropdown'
import FavoriteDropdown from '@/components/FavoriteDropdown'
import HistoryDropdown from '@/components/HistoryDropdown'
import UploadDropdown from '@/components/UploadDropdown'
import { useState } from 'react'
import {
  Search, User, Flame, Download, ChevronDown, MessageCircle,
  Star, Clock, Smile, Image as ImageIcon, Hash, BarChart2, MoreHorizontal,
  Heart, MessageSquare, Share2, Play, Eye
} from 'lucide-react'

/* -------------- mock data -------------- */
const CURRENT_USER = {
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  nickname: '小熊喵咕咕',
  level: 'LV5',
  following: 157,
  followers: 16,
  feeds: 63,
}

const LIVE_STREAMS = [
  { id: 1, name: '一只白色QvQ', title: '对抗路逆天大变', viewers: '1.2万', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop' },
  { id: 2, name: '虾仁不眨眼-游戏直播', title: '夜班超市异常', viewers: '8.5万', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop' },
  { id: 3, name: '白大厨', title: '扫号！今日是大顷野人！', viewers: '2.3万', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop' },
  { id: 4, name: '赖神无所畏惧', title: '什么赖神开播了？', viewers: '5.1万', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' },
  { id: 5, name: '罗太又破防了', title: '我吃 好了', viewers: '3.8万', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop' },
  { id: 6, name: '蓝若羽', title: '后室大更新！蓝羽带你玩新', viewers: '1.5万', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop' },
]

const FOLLOWING_LIST = [
  { id: 1, name: '全部动态', avatar: '', type: 'all' },
  { id: 2, name: '老董是我了_DongGaming', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop' },
  { id: 3, name: '企鹅带带北极...', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop' },
  { id: 4, name: '蓝若羽', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop' },
  { id: 5, name: '我是瑞斯拜', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop' },
  { id: 6, name: '磊哥游戏', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=60&h=60&fit=crop' },
  { id: 7, name: '焕彩GG', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop' },
  { id: 8, name: '小黛晨读', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop' },
  { id: 9, name: '网络小白_Uncle城', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&h=60&fit=crop' },
]

const FEED_POSTS = [
  {
    id: 1,
    user: { name: '老董是我了_DongGaming', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop', time: '4分钟前' },
    content: '🌾，社区还是有一部分玩家介意少女和木偶的关系比较亲昵的啊。但是我这种铁血老二次元是，当年玩白色相簿2都玩到一半，强行脑内补充了一个双人起飞的结局路线反手就删游戏的啊。直接跟少女木偶一起结婚有啥难度？她两还远没病到雪菜冬马的水平啊。二次元而已，不用太较真老弟们。28cm的好男孩是这样的，活得够洒脱🐵',
    stats: { likes: 234, comments: 56, shares: 12 },
    video: { title: '整点电子榨菜', thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=225&fit=crop' },
  },
  {
    id: 2,
    user: { name: '企鹅带带北极熊', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop', time: '1小时前' },
    content: '今天更新了新视频，大家记得三连支持一下～',
    stats: { likes: 567, comments: 89, shares: 23 },
    video: { title: '【原神】新版本角色测评', thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop' },
  },
  {
    id: 3,
    user: { name: '我是瑞斯拜', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', time: '2小时前' },
    content: '四级听力技巧更新了，这次讲的是同义替换的识别方法。',
    stats: { likes: 1234, comments: 234, shares: 67 },
  },
]

const HOT_SEARCH = [
  { rank: 1, title: 'BLG vs JDG LPL第二赛段', hot: true },
  { rank: 2, title: 'lex锐评歌手第三期', hot: true },
  { rank: 3, title: '布伦森庆祝总决赛2-0' },
  { rank: 4, title: 'TES送高考祝福' },
  { rank: 5, title: '2026高考倒计时1天', new: true },
  { rank: 6, title: '对线率防长那天发生了什么', hot: true },
  { rank: 7, title: '实拍揭秘顶尖专家近视手术全过程' },
  { rank: 8, title: '世界杯不是一个人在战斗名场面背后' },
  { rank: 9, title: '尼克斯客场胜马刺2比0领先' },
  { rank: 10, title: '全国首例盲人脑机接口复明成功' },
]

export default function Feed() {
  const { currentUser, users } = useStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('全部')
  const [activeFilter, setActiveFilter] = useState('全部')
  const [postContent, setPostContent] = useState('')

  const tabs = ['全部', '视频投稿', '追番追剧', '专栏']

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ====== 顶部导航 ====== */}
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
              <Link to="/" className="text-gray-800 hover:text-[#FB7299] flex items-center gap-1">
                <Download className="w-4 h-4" />下载客户端
              </Link>
            </nav>

            <div className="flex-1 max-w-[400px] mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索动态"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-12 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:border-[#FB7299] focus:bg-white transition-all text-gray-800"
                />
                <button className="absolute right-0 top-0 w-12 h-10 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-r-full flex items-center justify-center hover:opacity-90 transition-opacity">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {currentUser ? (
                <UserDropdown
                  currentUser={currentUser}
                  avatar={currentUser.username ? users.find(u => u.username === currentUser.username)?.avatar : undefined}
                />
              ) : (
                <Link to="/login/user" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] flex items-center justify-center group-hover:border-[#FB7299] transition-colors">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">登录</span>
                </Link>
              )}

              <div className="flex items-center gap-3">
                <button className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center group-hover:border-[#FB7299] transition-colors">
                    <span className="text-gray-700 font-bold text-base group-hover:text-[#FB7299]">大</span>
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">大会员</span>
                </button>

                <MessageDropdown currentUser={currentUser} />

                <FeedDropdown currentUser={currentUser} />

                <FavoriteDropdown currentUser={currentUser} />

                <HistoryDropdown currentUser={currentUser} />

                <Link to={currentUser ? "/creation" : "/login/user"} className="flex flex-col items-center hover:opacity-80 transition-opacity group">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-700 group-hover:text-[#FB7299]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C9.5 2 7 3.5 7 6C7 7.5 8 9 9 10.5C9.5 11.25 9.75 12 10 13H14C14.25 12 14.5 11.25 15 10.5C16 9 17 7.5 17 6C17 3.5 14.5 2 12 2Z" />
                      <path d="M10 14H14L15 18H9L10 14Z" />
                      <path d="M11 18L11 20H13L13 18" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">创作中心</span>
                </Link>

                <UploadDropdown currentUser={currentUser} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ====== 主体 ====== */}
      <div className="max-w-[1200px] mx-auto pt-24 pb-8 px-4">
        <div className="flex gap-6">
          {/* -------- 左侧边栏 -------- */}
          <aside className="w-64 flex-shrink-0 space-y-4">
            {/* 用户信息卡片 */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <img src={CURRENT_USER.avatar} alt="avatar" className="w-14 h-14 rounded-full object-cover" />
                <div>
                  <div className="font-bold text-gray-800">{CURRENT_USER.nickname}</div>
                  <div className="text-xs text-[#FB7299] bg-pink-50 px-2 py-0.5 rounded inline-block mt-1">{CURRENT_USER.level}</div>
                </div>
              </div>
              <div className="flex justify-around text-center">
                <div>
                  <div className="font-bold text-gray-800">{CURRENT_USER.following}</div>
                  <div className="text-xs text-gray-500">关注</div>
                </div>
                <div>
                  <div className="font-bold text-gray-800">{CURRENT_USER.followers}</div>
                  <div className="text-xs text-gray-500">粉丝</div>
                </div>
                <div>
                  <div className="font-bold text-gray-800">{CURRENT_USER.feeds}</div>
                  <div className="text-xs text-gray-500">动态</div>
                </div>
              </div>
            </div>

            {/* 正在直播 */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">正在直播</span>
                  <span className="text-xs text-gray-500">{LIVE_STREAMS.length}</span>
                </div>
                <Link to="/" className="text-xs text-gray-400 hover:text-[#FB7299]">更多关注 &gt;</Link>
              </div>
              <div className="space-y-3">
                {LIVE_STREAMS.map((live) => (
                  <div key={live.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded -mx-2 transition-colors">
                    <div className="relative">
                      <img src={live.avatar} alt={live.name} className="w-10 h-10 rounded-full object-cover" />
                      <span className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded">直播中</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-800 truncate">{live.name}</div>
                      <div className="text-xs text-gray-400 truncate">{live.title}</div>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {live.viewers}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* -------- 中间动态流 -------- */}
          <main className="flex-1 space-y-4">
            {/* 发布框 */}
            <div className="bg-white rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                <span className="text-gray-600">选择话题</span>
                <span>好的标题更容易获得支持，选填20字</span>
              </div>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="有什么想和大家分享的？"
                className="w-full h-20 resize-none border-0 focus:ring-0 text-sm text-gray-700 placeholder-gray-400"
              />
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <button className="text-gray-400 hover:text-[#FB7299] transition-colors">
                    <Smile className="w-5 h-5" />
                  </button>
                  <button className="text-gray-400 hover:text-[#FB7299] transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="text-gray-400 hover:text-[#FB7299] transition-colors">
                    <Hash className="w-5 h-5" />
                  </button>
                  <button className="text-gray-400 hover:text-[#FB7299] transition-colors">
                    <BarChart2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{postContent.length}/2000</span>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  <button className="bg-[#FB7299] hover:bg-pink-600 text-white px-4 py-1.5 rounded text-sm transition-colors">
                    发布
                  </button>
                </div>
              </div>
            </div>

            {/* 关注的人列表 */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {FOLLOWING_LIST.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setActiveTab(user.name)}
                    className={`flex flex-col items-center gap-1 min-w-[60px] ${activeTab === user.name ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.type === 'all' ? 'bg-[#FB7299] text-white' : 'bg-gray-100'}`}>
                      {user.type === 'all' ? '全部' : (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                      )}
                    </div>
                    <span className={`text-xs truncate max-w-[60px] ${activeTab === user.name ? 'text-[#FB7299]' : 'text-gray-600'}`}>
                      {user.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 内容过滤标签 */}
            <div className="flex items-center gap-4 px-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`text-sm pb-1 border-b-2 transition-colors ${
                    activeFilter === tab
                      ? 'text-[#FB7299] border-[#FB7299] font-medium'
                      : 'text-gray-600 border-transparent hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* 动态列表 */}
            <div className="space-y-4">
              {FEED_POSTS.map((post) => (
                <div key={post.id} className="bg-white rounded-lg p-4">
                  {/* 用户头 */}
                  <div className="flex items-start gap-3 mb-3">
                    <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{post.user.name}</div>
                      <div className="text-xs text-gray-400">{post.user.time}</div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 内容 */}
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">{post.content}</p>

                  {/* 视频卡片 */}
                  {post.video && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3 cursor-pointer hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          <img src={post.video.thumbnail} alt={post.video.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800 mb-1">{post.user.name} 投稿了视频</div>
                          <div className="text-xs text-[#FB7299]">{post.video.title}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 互动按钮 */}
                  <div className="flex items-center gap-6 text-gray-400">
                    <button className="flex items-center gap-1 hover:text-[#FB7299] transition-colors">
                      <Heart className="w-4 h-4" />
                      <span className="text-xs">{post.stats.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-[#FB7299] transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-xs">{post.stats.comments}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-[#FB7299] transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs">{post.stats.shares}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>

          {/* -------- 右侧 -------- */}
          <aside className="w-64 flex-shrink-0 space-y-4">
            {/* 社区中心广告位 */}
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold">bilibili</div>
                  <div className="text-sm opacity-90">社区中心</div>
                </div>
              </div>
              <div className="mt-3 text-xs opacity-80">
                参与社区建设，共建美好家园
              </div>
            </div>

            {/* 热搜榜 */}
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-800">bilibili热搜</span>
              </div>
              <div className="space-y-2">
                {HOT_SEARCH.map((item) => (
                  <div key={item.rank} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded -mx-1 transition-colors">
                    <span className={`w-5 h-5 rounded text-xs flex items-center justify-center flex-shrink-0 ${
                      item.rank <= 3 ? 'bg-[#FB7299] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.rank}
                    </span>
                    <span className="text-sm text-gray-700 truncate flex-1">{item.title}</span>
                    {item.hot && <span className="text-[10px] text-red-500 border border-red-500 px-1 rounded">热</span>}
                    {item.new && <span className="text-[10px] text-green-500 border border-green-500 px-1 rounded">新</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* 回到旧版 */}
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm py-2 rounded-lg transition-colors">
              回到旧版
            </button>
          </aside>
        </div>
      </div>
    </div>
  )
}
