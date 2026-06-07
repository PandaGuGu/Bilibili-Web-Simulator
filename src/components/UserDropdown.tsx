import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/index'
import { User, FileText, Star, Moon, LogOut, ChevronRight } from 'lucide-react'

interface UserDropdownProps {
  currentUser: { username: string; role: string } | null
  avatar?: string
  textColor?: string
}

export default function UserDropdown({ currentUser, avatar, textColor = 'text-gray-700' }: UserDropdownProps) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>()
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const logout = useStore((s) => s.logout)

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setOpen(false)
  }

  if (!currentUser) {
    return (
      <Link to="/login/user" className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity group">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] flex items-center justify-center group-hover:border-[#FB7299] transition-colors">
          <User className="w-5 h-5 text-white" />
        </div>
        <span className={`text-xs mt-1 ${textColor} group-hover:text-[#FB7299]`}>登录</span>
      </Link>
    )
  }

  // 模拟数据
  const stats = {
    coins: 33.1,
    bCoins: 0,
    level: 5,
    exp: 19571,
    needExp: 9229,
    following: 157,
    followers: 16,
    feeds: 63,
  }

  const progress = (stats.exp / (stats.exp + stats.needExp)) * 100

  return (
    <div ref={ref} className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {/* 触发器 */}
      <button
        className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity group"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] flex items-center justify-center group-hover:border-[#FB7299] transition-colors overflow-hidden">
          {avatar ? (
            <img src={avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-sm font-bold">{currentUser.username[0].toUpperCase()}</span>
          )}
        </div>
        <span className={`text-xs mt-1 ${textColor} group-hover:text-[#FB7299]`}>头像</span>
      </button>

      {/* 下拉卡片 */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[280px] bg-white rounded-xl shadow-2xl border border-gray-100 py-4 z-50">
          {/* 头像 + 昵称 */}
          <div className="text-center px-4 pb-3 border-b border-gray-100">
            <div className="relative w-16 h-16 mx-auto -mt-2">
              <img
                src={avatar || `https://ui-avatars.com/api/?name=${currentUser.username}&background=FB7299&color=fff`}
                alt=""
                className="w-full h-full rounded-full object-cover border-2 border-white shadow"
              />
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="font-bold text-gray-800">{currentUser.username}</span>
              <span className="text-[10px] text-[#FB7299] bg-pink-50 px-1 rounded">正式会员</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">硬币: {stats.coins} B币: {stats.bCoins}</div>
          </div>

          {/* 等级进度条 */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#FB7299] font-bold">LV{stats.level}</span>
              <span className="text-gray-400">LV{stats.level + 1}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-[10px] text-gray-400 mt-1 text-center">
              当前成长{stats.exp}，距离升级Lv{stats.level + 1}还需要{stats.needExp}
            </div>
          </div>

          {/* 统计数据 */}
          <div className="flex justify-around px-4 py-2 border-t border-gray-100">
            <Link to="/feed" onClick={() => setOpen(false)} className="text-center hover:text-[#FB7299]">
              <div className="font-bold text-gray-800">{stats.following}</div>
              <div className="text-xs text-gray-500">关注</div>
            </Link>
            <Link to={`/user/${currentUser.username}`} onClick={() => setOpen(false)} className="text-center hover:text-[#FB7299]">
              <div className="font-bold text-gray-800">{stats.followers}</div>
              <div className="text-xs text-gray-500">粉丝</div>
            </Link>
            <Link to="/feed" onClick={() => setOpen(false)} className="text-center hover:text-[#FB7299]">
              <div className="font-bold text-gray-800">{stats.feeds}</div>
              <div className="text-xs text-gray-500">动态</div>
            </Link>
          </div>

          {/* 成为大会员 */}
          <div className="mx-4 my-3 p-3 bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[#FB7299]">成为大会员</div>
                <div className="text-xs text-gray-500">解锁会员专属内容</div>
              </div>
              <button className="text-xs text-[#FB7299] border border-[#FB7299] px-2 py-1 rounded-full hover:bg-[#FB7299] hover:text-white transition-colors">
                大会员中心
              </button>
            </div>
          </div>

          {/* 菜单项 */}
          <div className="border-t border-gray-100 pt-2">
            <Link
              to={`/user/${currentUser.username}`}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">个人中心</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/creation"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">投稿管理</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">推荐服务</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Link>
          </div>

          {/* 主题 + 退出 */}
          <div className="border-t border-gray-100 mt-2 pt-2">
            <button className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-gray-50 transition-colors">
              <Moon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">主题：浅色</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-gray-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">退出登录</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
