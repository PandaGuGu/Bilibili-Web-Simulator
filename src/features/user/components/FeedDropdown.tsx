import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'

interface FeedDropdownProps {
  currentUser: { username: string; role: string } | null
  textColor?: string
}

const LIVE_STREAMS = [
  { id: 1, name: '一只白色QvQ', title: '对抗路逆天大变', viewers: '1.2万', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop' },
  { id: 2, name: '虾仁不眨眼', title: '夜班超市异常', viewers: '8.5万', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop' },
  { id: 3, name: '白大厨', title: '扫号！今日是大顷野人！', viewers: '2.3万', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop' },
  { id: 4, name: '赖神无所畏惧', title: '什么赖神开播了？', viewers: '5.1万', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' },
  { id: 5, name: '罗太又破防了', title: '我吃 好了', viewers: '3.8万', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop' },
]

const HISTORY_FEEDS = [
  {
    id: 1,
    user: { name: '微雨定风波', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop' },
    title: '高考，但是可以携带植物挂件神器各一个进入考场（结尾有彩蛋）',
    time: '1分钟前',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=120&fit=crop',
  },
  {
    id: 2,
    user: { name: '萝太永不破防', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop' },
    title: '船上有危险了',
    time: '3分钟前',
    thumbnail: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=200&h=120&fit=crop',
  },
  {
    id: 3,
    user: { name: '熊熊仔的沙雕动画', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop' },
    title: '《规则之下150》—水涨船高的天衍。',
    time: '9分钟前',
    thumbnail: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&h=120&fit=crop',
  },
]

export default function FeedDropdown({ currentUser, textColor = 'text-gray-700' }: FeedDropdownProps) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>()

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200)
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 触发器 - 动态图标 */}
      <Link
        to="/feed"
        onClick={(e) => { e.stopPropagation(); }}
        className="flex flex-col items-center hover:opacity-80 transition-opacity group relative pointer-events-auto"
      >
        <div className="w-10 h-10 flex items-center justify-center">
          <svg
            className={`w-6 h-6 ${textColor} group-hover:text-[#FB7299]`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L14.5 8H21L16 12L18 19L12 15L6 19L8 12L3 8H9.5L12 2Z" />
          </svg>
        </div>
        <span className={`text-xs mt-1 ${textColor} group-hover:text-[#FB7299]`}>
          动态
        </span>
      </Link>

      {/* 下拉面板 */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {/* 正在直播 */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-800">正在直播</span>
              <Link to="/feed" className="text-xs text-gray-400 hover:text-[#FB7299] flex items-center gap-0.5">
                查看更多 <span className="text-xs">›</span>
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {LIVE_STREAMS.map((live) => (
                <Link key={live.id} to="/feed" className="flex-shrink-0 text-center group">
                  <div className="relative w-12 h-12 mx-auto mb-1">
                    <img
                      src={live.avatar}
                      alt={live.name}
                    className="w-full h-full rounded-full object-cover border-[3px] border-red-400 group-hover:border-[#FB7299] transition-colors"
                  />
                  </div>
                  <div className="text-[10px] text-gray-600 truncate w-12">{live.name.slice(0, 6)}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* 历史动态 */}
          <div className="max-h-[320px] overflow-y-auto">
            <div className="px-4 py-2 text-xs text-gray-400 text-center border-b border-gray-50">历史动态</div>
            {HISTORY_FEEDS.map((feed) => (
              <Link
                key={feed.id}
                to="/feed"
                className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
              >
                <img src={feed.user.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">{feed.user.name}</div>
                  <div className="text-sm text-gray-800 line-clamp-2 mb-1">{feed.title}</div>
                  <div className="text-xs text-gray-400">{feed.time}</div>
                </div>
                {feed.thumbnail && (
                  <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img src={feed.thumbnail} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <Play className="w-5 h-5 text-white" fill="white" />
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
