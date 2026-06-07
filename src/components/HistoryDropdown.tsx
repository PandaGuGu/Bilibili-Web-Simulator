import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Play, Trash2 } from 'lucide-react'

interface HistoryDropdownProps {
  currentUser: { username: string; role: string } | null
  textColor?: string
  borderColor?: string
}

const TABS = ['视频', '直播', '专栏']

const HISTORY_VIDEOS = [
  {
    id: 1,
    title: '早昼，午昼，晚昼',
    up: '神威-狗剩',
    time: '今天17:55',
    duration: '02:34',
    progress: '01:51',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop',
  },
  {
    id: 2,
    title: '早昼，午昼，晚昼',
    up: '无蔗糖的纯牛奶',
    time: '今天17:55',
    duration: '00:23',
    progress: '00:09',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=120&fit=crop',
  },
  {
    id: 3,
    title: '【睡前消息1062】福建泡药杨梅 湖北"割四赔五"都是一...',
    up: '马督工',
    time: '今天17:53',
    duration: '17:48',
    progress: '00:04',
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&h=120&fit=crop',
  },
  {
    id: 4,
    title: '小时候写过的修辞句',
    up: '西维西师傅',
    time: '今天17:14',
    duration: '00:40',
    progress: '00:07',
    thumbnail: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=200&h=120&fit=crop',
  },
  {
    id: 5,
    title: '牢玩家误入伪人局，如同进入米缸的老鼠开始吃自助餐，...',
    up: '焕彩GG',
    time: '今天17:08',
    duration: '13:03',
    progress: '00:00',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=120&fit=crop',
  },
  {
    id: 6,
    title: '如何免费使用deepseek大模型的apikey',
    up: '技术分享官',
    time: '今天16:51',
    duration: '08:30',
    progress: '02:15',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop',
  },
]

export default function HistoryDropdown({ currentUser, textColor = 'text-gray-700', borderColor = 'border-gray-300' }: HistoryDropdownProps) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('视频')
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
              <div className="space-y-3">
                {HISTORY_VIDEOS.map((video) => (
                  <Link
                    key={video.id}
                    to="/"
                    className="flex items-start gap-3 group"
                  >
                    {/* 缩略图 + 进度条 */}
                    <div className="relative w-36 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                      {/* 进度条 */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                        <div
                          className="h-full bg-[#FB7299]"
                          style={{
                            width: `${(parseInt(video.progress.split(':')[0]) * 60 + parseInt(video.progress.split(':')[1])) /
                              (parseInt(video.duration.split(':')[0]) * 60 + parseInt(video.duration.split(':')[1])) * 100}%`
                          }}
                        />
                      </div>
                      {/* 时间 */}
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                        {video.progress}/{video.duration}
                      </span>
                      {/* 播放按钮 */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white" fill="white" />
                      </div>
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="text-sm text-gray-800 line-clamp-2 leading-snug group-hover:text-[#FB7299] transition-colors">
                        {video.title}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{video.time}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                        <span className="bg-gray-100 px-1 rounded text-[10px]">UP</span>
                        <span className="truncate">{video.up}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
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
