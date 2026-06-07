import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { useLiveStore } from '@/store/live'
import { api } from '@/api/client'

interface FeedDropdownProps {
  currentUser: { username: string; role: string } | null
  textColor?: string
}

export default function FeedDropdown({ currentUser, textColor = 'text-gray-700' }: FeedDropdownProps) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>()
  const liveRooms = useLiveStore((s) => s.liveRooms)
  const [historyItems, setHistoryItems] = useState<any[]>([])

  useEffect(() => {
    if (!currentUser) return
    api.getHistory().then(res => {
      if (res?.success && res.history?.length > 0) setHistoryItems(res.history.slice(0, 5))
    }).catch(() => {})
  }, [currentUser?.username])

  const livingRooms = liveRooms.filter((r: any) => r.status === 'living')

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
              {livingRooms.length > 0 ? livingRooms.map((live: any) => (
                <Link key={live.id} to={`/live/${live.id}`} className="flex-shrink-0 text-center group">
                  <div className="relative w-12 h-12 mx-auto mb-1">
                    <img
                      src={live.coverUrl || `https://placehold.co/80/FB7299/white?text=Live`}
                      alt={live.title}
                    className="w-full h-full rounded-full object-cover border-[3px] border-red-400 group-hover:border-[#FB7299] transition-colors"
                  />
                  </div>
                  <div className="text-[10px] text-gray-600 truncate w-12">{(live.title||'').slice(0, 6)}</div>
                </Link>
              )) : (
                <div className="text-center py-4 text-sm text-gray-400 w-full">暂无直播</div>
              )}
            </div>
          </div>

          {/* 历史动态 */}
          <div className="max-h-[320px] overflow-y-auto">
            <div className="px-4 py-2 text-xs text-gray-400 text-center border-b border-gray-50">历史动态</div>
            {historyItems.length > 0 ? historyItems.map((item: any, i: number) => (
              <Link
                key={item.id || i}
                to={`/video/${item.video_id || item.id}`}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
              >
                <img src={item.video_avatar || `https://placehold.co/80/FB7299/white?text=V`} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">观看了视频</div>
                  <div className="text-sm text-gray-800 line-clamp-2 mb-1">{item.video_title || '未知视频'}</div>
                  <div className="text-xs text-gray-400">{item.watched_at ? new Date(item.watched_at).toLocaleDateString('zh-CN') : ''}</div>
                </div>
              </Link>
            )) : (
              <div className="text-center py-8 text-sm text-gray-400">暂无观看记录</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
