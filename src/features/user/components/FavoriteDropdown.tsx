import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'

interface FavoriteDropdownProps {
  currentUser: { username: string; role: string } | null
  textColor?: string
}

const FAVORITE_FOLDERS = [
  { id: 1, name: '杂类', count: 46 },
  { id: 2, name: '稍后再看', count: 53 },
  { id: 3, name: '毕业设计', count: 9 },
  { id: 4, name: 'STM32', count: 7 },
  { id: 5, name: '编译器(技巧)', count: 5 },
  { id: 6, name: 'AI', count: 3 },
  { id: 7, name: '编程语言类', count: 19 },
  { id: 8, name: '数据库系统', count: 3 },
  { id: 9, name: '嵌入式', count: 24 },
  { id: 10, name: '算法与数据结构', count: 12 },
]

const FAVORITE_VIDEOS = [
  {
    id: 1,
    title: '2026瑞斯拜六级翻译预测 第2讲-必考点 茶马古道',
    up: '我是瑞斯拜',
    duration: '23:23',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=120&fit=crop',
    isNew: true,
  },
  {
    id: 2,
    title: '《单片机原理及应用》6小时期末速成课！期末速成 | 考前突击 | 不挂科',
    up: '数学建模老哥',
    duration: '05:58:03',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=120&fit=crop',
  },
  {
    id: 3,
    title: '【城】为什么你的WIFI会卡还断连？可能是信道出了问题',
    up: '网络小白_Uncle城',
    duration: '10:27',
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&h=120&fit=crop',
  },
  {
    id: 4,
    title: '26年瑞斯拜六级作文课 第一节考什么 最新真题带练',
    up: '我是瑞斯拜',
    duration: '22:41',
    thumbnail: 'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=200&h=120&fit=crop',
  },
  {
    id: 5,
    title: '过年两个月，我开发了20个嵌入式必备工具，十年工程师经验...',
    up: '小智-学长',
    duration: '02:42',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=120&fit=crop',
  },
]

export default function FavoriteDropdown({ currentUser, textColor = 'text-gray-700' }: FavoriteDropdownProps) {
  const [open, setOpen] = useState(false)
  const [activeFolder, setActiveFolder] = useState(1)
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
      {/* 触发器 - 收藏图标 */}
      <Link
        to="/"
        className="flex flex-col items-center hover:opacity-80 transition-opacity group relative"
      >
        <div className="w-10 h-10 flex items-center justify-center">
          <svg
            className={`w-6 h-6 ${textColor} group-hover:text-[#FB7299]`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <span className={`text-xs mt-1 ${textColor} group-hover:text-[#FB7299]`}>
          收藏
        </span>
      </Link>

      {/* 下拉面板 */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[480px] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          <div className="flex h-[400px]">
            {/* 左侧收藏夹列表 */}
            <div className="w-[160px] bg-gray-50 border-r border-gray-100 overflow-y-auto">
              {FAVORITE_FOLDERS.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                    activeFolder === folder.id
                      ? 'bg-white text-[#FB7299] font-medium border-l-4 border-[#FB7299]'
                      : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  <span className="truncate">{folder.name}</span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{folder.count}</span>
                </button>
              ))}
            </div>

            {/* 右侧视频列表 */}
            <div className="flex-1 overflow-y-auto p-3">
              {FAVORITE_VIDEOS.map((video) => (
                <Link
                  key={video.id}
                  to="/"
                  className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  {/* 缩略图 */}
                  <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white" fill="white" />
                    </div>
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                      {video.duration}
                    </span>
                  </div>

                  {/* 信息 */}
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="text-sm text-gray-800 line-clamp-2 leading-snug group-hover:text-[#FB7299] transition-colors">
                      {video.isNew && <span className="text-green-500 mr-1">2026</span>}
                      {video.title}
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                      <span className="bg-gray-100 px-1 rounded text-[10px]">UP</span>
                      <span className="truncate">{video.up}</span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* 底部操作 */}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100">
                <Link to="/" className="text-sm text-gray-500 hover:text-[#FB7299]">
                  查看全部
                </Link>
                <Link to="/" className="flex items-center gap-1 text-sm text-[#FB7299] hover:text-pink-600">
                  <Play className="w-4 h-4" />
                  播放全部
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
