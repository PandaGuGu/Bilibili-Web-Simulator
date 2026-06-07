import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AtSign, Heart, Bell, Mail } from 'lucide-react'
import { api } from '@/api/client'

interface MessageDropdownProps {
  currentUser: { username: string; role: string } | null
  textColor?: string
  hideBadge?: boolean
}

const MENU_ITEMS = [
  { key: 'reply', label: '回复我的', icon: Mail },
  { key: 'at', label: '@我的', icon: AtSign },
  { key: 'likes', label: '收到的赞', icon: Heart },
  { key: 'system', label: '系统消息', icon: Bell },
  { key: 'messages', label: '我的消息', icon: Mail },
]

export default function MessageDropdown({ currentUser, textColor = 'text-gray-700', hideBadge = false }: MessageDropdownProps) {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>()

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

  const handleClickMessage = () => {
    // 点击消息立即消去红点
    setUnreadCount(0)
  }

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
      {/* 触发器 - 消息图标 */}
      <Link
        to={currentUser ? `/messages/${currentUser.username}` : '/login/user'}
        onClick={(e) => { e.stopPropagation(); handleClickMessage() }}
        className="flex flex-col items-center hover:opacity-80 transition-opacity group relative pointer-events-auto"
      >
        <div className="w-10 h-10 flex items-center justify-center">
          <svg
            className={`w-6 h-6 ${textColor} group-hover:text-[#FB7299]`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        {currentUser && unreadCount > 0 && !hideBadge && (
          <span className="absolute -top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        <span className={`text-xs mt-1 ${textColor} group-hover:text-[#FB7299]`}>
          消息
        </span>
      </Link>

      {/* 下拉菜单 */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[140px] bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.key}
                to={currentUser ? `/messages/${currentUser.username}` : '/login/user'}
                onClick={() => { setOpen(false); setUnreadCount(0) }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
