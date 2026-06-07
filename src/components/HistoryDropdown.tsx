import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Play, Trash2 } from 'lucide-react'
import { api } from '@/api/client'

interface HistoryDropdownProps {
  currentUser: { username: string; role: string } | null
  textColor?: string
  borderColor?: string
}

const TABS = ['视频', '直播', '专栏']

export default function HistoryDropdown({ currentUser, textColor = 'text-gray-700', borderColor = 'border-gray-300' }: HistoryDropdownProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('视频')
  const [historyItems, setHistoryItems] = useState<any[]>([])
  const closeTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!currentUser) return
    api.getHistory().then(res => {
      if (res?.success) setHistoryItems(res.history || [])
    }).catch(() => {})
  }, [currentUser?.username])

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
      {/* 触发器 - 历史图标 */}
      <Link
        to="/history"
        onClick={(e) => { e.stopPropagation(); }}
        className="flex flex-col items-center hover:opacity-80 transition-opacity group relative pointer-events-auto"
      >
        <div className={`w-10 h-10 rounded-full border-2 ${borderColor} flex items-center justify-center group-hover:border-[#FB7299] transition-colors`}>
          <Clock className={`w-5 h-5 ${textColor} group-hover:text-[#FB7299]`} />
        </div>
        <span className={`text-xs mt-1 ${textColor} group-hover:text-[#FB7299]`}>
          历史
        </span>
      </Link>

      {/* 下拉面板 */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[400px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {/* 标签切换 */}
          <div className="flex border-b border-gray-100">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm transition-colors ${
                  activeTab === tab
                    ? 'text-[#FB7299] border-b-2 border-[#FB7299] font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 历史列表 */}
          <div className="max-h-[400px] overflow-y-auto p-3">
            {activeTab === '视频' && (
              historyItems.length > 0 ? (
                <div className="space-y-3">
                  {historyItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/video/${item.video_id || item.id}`}
                      className="flex items-start gap-3 group"
                    >
                      {/* 缩略图 */}
                      <div className="relative w-36 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <img src={item.video_cover || `https://placehold.co/320x180/FB7299/white?text=视频`} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-8 h-8 text-white" fill="white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <div className="text-sm text-gray-800 line-clamp-2 leading-snug group-hover:text-[#FB7299] transition-colors">
                          {item.video_title || '未知视频'}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{item.watched_at ? new Date(item.watched_at).toLocaleString('zh-CN') : ''}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm">暂无观看记录</div>
              )
            )}

            {activeTab === '直播' && (
              <div className="text-center py-10 text-gray-400 text-sm">
                暂无直播观看记录
              </div>
            )}

            {activeTab === '专栏' && (
              <div className="text-center py-10 text-gray-400 text-sm">
                暂无专栏阅读记录
              </div>
            )}
          </div>

          {/* 底部操作 */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <Link to="/" className="text-sm text-gray-500 hover:text-[#FB7299]">
              查看全部
            </Link>
            <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="w-4 h-4" />
              清空历史
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
