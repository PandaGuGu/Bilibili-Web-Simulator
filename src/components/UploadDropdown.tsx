import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Smile, Play, Settings } from 'lucide-react'

interface UploadDropdownProps {
  currentUser: { username: string; role: string } | null
  textColor?: string
}

const UPLOAD_OPTIONS = [
  { key: 'column', label: '专栏投稿', icon: FileText },
  { key: 'sticker', label: '贴纸投稿', icon: Smile },
  { key: 'video', label: '视频投稿', icon: Play },
  { key: 'manage', label: '投稿管理', icon: Settings },
]

export default function UploadDropdown({ currentUser, textColor = 'text-white' }: UploadDropdownProps) {
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
      {/* 触发器 - 投稿按钮 */}
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

      {/* 下拉面板 */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-xl shadow-2xl border border-gray-100 p-3 z-50">
          <div className="grid grid-cols-4 gap-2">
            {UPLOAD_OPTIONS.map((option) => {
              const Icon = option.icon
              return (
                <Link
                  key={option.key}
                  to={currentUser ? "/creation" : "/login/user"}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center group-hover:border-[#FB7299] group-hover:bg-pink-50 transition-colors">
                    <Icon className="w-5 h-5 text-gray-600 group-hover:text-[#FB7299]" />
                  </div>
                  <span className="text-xs text-gray-600 group-hover:text-[#FB7299]">{option.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
