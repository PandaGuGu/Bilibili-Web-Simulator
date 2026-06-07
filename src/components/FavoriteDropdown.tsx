import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, Star } from 'lucide-react'
import { api } from '@/api/client'

interface FavoriteDropdownProps {
  currentUser: { username: string; role: string } | null
  textColor?: string
}

export default function FavoriteDropdown({ currentUser, textColor = 'text-gray-700' }: FavoriteDropdownProps) {
  const [open, setOpen] = useState(false)
  const [activeFolder, setActiveFolder] = useState('')
  const [allFavorites, setAllFavorites] = useState<any[]>([])
  const closeTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (!currentUser) return
    api.getFavorites().then(res => {
      if (res?.success) {
        const favs = res.favorites || []
        setAllFavorites(favs)
        const firstFolder = favs.length > 0 ? favs[0].folder_name || '' : ''
        setActiveFolder(firstFolder)
      }
    }).catch(() => {})
  }, [currentUser?.username])

  // 按文件夹分组
  const folderMap: Record<string, any[]> = {}
  allFavorites.forEach((f: any) => {
    const name = f.folder_name || '默认收藏夹'
    if (!folderMap[name]) folderMap[name] = []
    folderMap[name].push(f)
  })
  const folders = Object.entries(folderMap).map(([name, items]) => ({
    name,
    count: items.length,
  }))

  // 默认收藏夹始终显示
  if (folders.length === 0) {
    folders.push({ name: '默认收藏夹', count: 0 })
  }

  const activeVideos = activeFolder ? (folderMap[activeFolder] || []) : []

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
        to="/favorites"
        onClick={(e) => { e.stopPropagation(); }}
        className="flex flex-col items-center hover:opacity-80 transition-opacity group relative pointer-events-auto"
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
              {folders.map((folder) => (
                <button
                  key={folder.name}
                  onClick={() => setActiveFolder(folder.name)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                    activeFolder === folder.name
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
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 overflow-y-auto p-3">
              {activeVideos.length > 0 ? activeVideos.map((fav) => (
                <Link
                  key={fav.id}
                  to={fav.video_id ? `/video/${fav.video_id}` : '/favorites'}
                  className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={fav.video_cover || `https://placehold.co/200x120/FB7299/white?text=视频`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white" fill="white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="text-sm text-gray-800 line-clamp-2 leading-snug group-hover:text-[#FB7299] transition-colors">
                      {fav.video_title || `收藏 #${fav.id}`}
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                      <span>{fav.favorited_at ? new Date(fav.created_at).toLocaleDateString('zh-CN') : ''}</span>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="text-center py-16">
                  <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">暂无收藏内容</p>
                  <p className="text-xs text-gray-300 mt-1">观看视频时点击收藏即可添加</p>
                </div>
              )}
              </div>

              {/* 底部操作 - 始终悬浮 */}
              <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-200 bg-white">
                <Link to="/favorites" className="text-sm text-gray-500 hover:text-[#FB7299]">
                  查看全部
                </Link>
                <div className="w-px h-5 bg-gray-300" />
                <Link to="/favorites" className="flex items-center gap-1 text-sm text-[#FB7299] hover:text-pink-600">
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
