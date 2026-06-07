import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/index'
import { api } from '@/api/client'
import UserDropdown from '@/components/UserDropdown'
import MessageDropdown from '@/components/MessageDropdown'
import FeedDropdown from '@/components/FeedDropdown'
import FavoriteDropdown from '@/components/FavoriteDropdown'
import HistoryDropdown from '@/components/HistoryDropdown'
import { 
  Home, Crown, Gift, User, Camera, Medal, Shield, Lock, 
  Ban, Coins, ChevronRight, CheckCircle2, Star, Clock,
  Search as SearchIcon
} from 'lucide-react'

type MenuKey = 'home' | 'vip' | 'points' | 'profile' | 'avatar' | 'fans' | 
               'achieve' | 'security' | 'blacklist' | 'coins'

export default function AccountCenter() {
  const navigate = useNavigate()
  const currentUser = useStore(s => s.currentUser)
  const users = useStore(s => s.users)
  const [activeMenu, setActiveMenu] = useState<MenuKey>('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    nickname: '',
    signature: '',
    gender: '保密',
    birthday: '',
  })

  const profileUser = currentUser ? users.find(u => u.username === currentUser.username) : null

  useEffect(() => {
    if (!currentUser) {
      navigate('/login/user')
      return
    }
    document.title = '个人中心 - 哔哩哔哩'
    if (profileUser) {
      setEditForm({
        nickname: (profileUser as any).nickname || profileUser.username,
        signature: '',
        gender: '保密',
        birthday: '',
      })
    }
  }, [currentUser, navigate, profileUser])

  const handleSave = async () => {
    setLoading(true)
    // 模拟保存
    await new Promise(r => setTimeout(r, 500))
    setLoading(false)
    alert('保存成功')
  }

  const menuItems: { key: MenuKey; icon: any; label: string }[] = [
    { key: 'home', icon: Home, label: '首页' },
    { key: 'vip', icon: Crown, label: '大会员' },
    { key: 'points', icon: Gift, label: '会员积分' },
    { key: 'profile', icon: User, label: '我的信息' },
    { key: 'avatar', icon: Camera, label: '我的头像' },
    { key: 'fans', icon: Star, label: '粉丝勋章' },
    { key: 'achieve', icon: Medal, label: '成就勋章' },
    { key: 'security', icon: Shield, label: '账号安全' },
    { key: 'blacklist', icon: Ban, label: '黑名单管理' },
    { key: 'coins', icon: Coins, label: '我的硬币' },
  ]

  // 每日奖励数据
  const dailyRewards = [
    { icon: CheckCircle2, label: '每日登录', exp: '5经验值到手', done: true, color: 'text-green-500' },
    { icon: CheckCircle2, label: '每日观看视频', exp: '5经验值到手', done: true, color: 'text-green-500' },
    { icon: Coins, label: '每日投币', exp: '已获得0/50', done: false, color: 'text-[#00a1d6]' },
    { icon: Share, label: '每日分享视频(客户端)', exp: '未完成', done: false, color: 'text-[#00a1d6]' },
  ]

  if (!currentUser || !profileUser) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">加载中...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ========== 顶部导航栏 ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="flex items-center h-14 justify-between">
            <nav className="hidden md:flex items-center gap-3 text-sm">
              <Link to="/" className="text-gray-800 hover:text-[#FB7299] font-medium">首页</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">番剧</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">直播</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">游戏中心</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">会员购</Link>
            </nav>

            <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); }} className="flex-1 max-w-[400px] mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索你感兴趣的内容"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-12 bg-gray-100 border border-transparent rounded-full text-sm focus:outline-none focus:border-[#FB7299] focus:bg-white transition-all"
                />
                <button type="submit" className="absolute right-0 top-0 w-12 h-10 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-r-full flex items-center justify-center">
                  <SearchIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </form>

            <div className="flex items-center gap-1">
              {currentUser ? (
                <UserDropdown currentUser={currentUser}
                  avatar={users.find(u => u.username === currentUser.username)?.avatar} />
              ) : (
                <Link to="/login/user" className="flex flex-col items-center group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-700 mt-1">登录</span>
                </Link>
              )}
              <div className="flex items-center gap-3 ml-2">
                <MessageDropdown currentUser={currentUser} />
                <FeedDropdown currentUser={currentUser} />
                <FavoriteDropdown currentUser={currentUser} />
                <HistoryDropdown currentUser={currentUser} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ========== 蓝色横幅 ========== */}
      <div className="h-[180px] bg-[#00a1d6] relative overflow-hidden mt-16">
        {/* 装饰云 */}
        <div className="absolute bottom-0 left-0 right-0 flex">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-[150px] h-[60px] bg-white rounded-t-full -mb-[20px]" 
              style={{ marginLeft: i === 0 ? '-30px' : '-40px' }} />
          ))}
        </div>
        {/* B站 Logo */}
        <div className="max-w-[1200px] mx-auto px-4 pt-6">
          <Link to="/" className="text-white text-3xl font-bold">bilibili</Link>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 -mt-10 relative z-10">
        <div className="flex gap-4">
          {/* 左侧菜单 */}
          <aside className="w-[200px] flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 text-sm text-gray-500 border-b border-gray-100">个人中心</div>
              {menuItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => setActiveMenu(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    activeMenu === item.key 
                      ? 'bg-[#00a1d6] text-white' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </aside>

          {/* 右侧内容 */}
          <main className="flex-1 min-w-0">
            {activeMenu === 'home' && (
              <div className="space-y-4">
                {/* 用户信息卡片 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start gap-6">
                    {/* 头像 */}
                    <div className="relative">
                      <img 
                        src={profileUser.avatar} 
                        alt="" 
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    </div>
                    
                    {/* 信息 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-xl font-bold text-gray-800">{(profileUser as any).nickname || profileUser.username}</h1>
                        <span className="px-2 py-0.5 bg-[#FB7299] text-white text-xs rounded">正式会员</span>
                      </div>
                      
                      {/* 等级进度 */}
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-[#FB7299] font-bold">LV5</span>
                        <div className="flex-1 max-w-[300px] h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full w-[68%] bg-gradient-to-r from-[#FB7299] to-orange-400 rounded-full" />
                        </div>
                        <span className="text-xs text-gray-400">19601 / 28800</span>
                      </div>

                      {/* 硬币信息 */}
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-yellow-500" /> 0
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-[#00a1d6] font-bold">币</span> 32.1
                        </span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded text-sm hover:bg-gray-50">
                        修改资料
                      </button>
                      <Link 
                        to={`/user/${currentUser.username}`}
                        className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded text-sm hover:bg-gray-50 flex items-center gap-1"
                      >
                        个人空间 <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* 每日奖励 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Gift className="w-5 h-5 text-green-500" />
                    <h2 className="font-bold text-gray-800">每日奖励</h2>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {dailyRewards.map((reward, i) => (
                      <div key={i} className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                          reward.done ? 'bg-green-100' : 'bg-blue-50'
                        }`}>
                          <reward.icon className={`w-8 h-8 ${reward.color}`} />
                        </div>
                        <div className="text-sm text-gray-700 mb-1">{reward.label}</div>
                        <div className="text-xs text-gray-400">{reward.exp}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 成就勋章 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Medal className="w-5 h-5 text-yellow-500" />
                      <h2 className="font-bold text-gray-800">成就勋章</h2>
                    </div>
                    <button className="text-xs text-[#00a1d6] hover:underline">查看全部勋章 &gt;</button>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { title: '收集萌新', desc: '表白爱抖露，这份心情请收下！', icon: '🌸', bg: 'from-pink-100 to-pink-50', border: 'border-pink-200' },
                      { title: '有爱大佬', desc: '传说中的存在，花式打Call带你飞。', icon: '👑', bg: 'from-amber-100 to-amber-50', border: 'border-amber-200' },
                      { title: '有爱楷模', desc: '体力满档，有爱抖露在的地方就有我！', icon: '💪', bg: 'from-blue-100 to-blue-50', border: 'border-blue-200' },
                      { title: '有爱萌新', desc: '初入萌新，打Call姿势蓄力中', icon: '🎀', bg: 'from-green-100 to-green-50', border: 'border-green-200' },
                    ].map((a, i) => (
                      <div key={i} className={`bg-gradient-to-br ${a.bg} border ${a.border} rounded-lg p-4 text-center`}>
                        <div className="text-3xl mb-2">{a.icon}</div>
                        <div className="text-sm font-bold text-gray-800 mb-1">{a.title}</div>
                        <div className="text-[10px] text-gray-500 leading-relaxed">{a.desc}</div>
                        <div className="mt-2 text-[10px] text-gray-400">普通勋章</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 账号安全 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-gray-700" />
                      <h2 className="font-bold text-gray-800">账号安全</h2>
                    </div>
                    <button className="text-xs text-[#00a1d6] hover:underline">更多账号安全 &gt;</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: '我的邮箱', desc: '绑定邮箱后即可使用邮箱登录', status: '已绑定', action: '更改邮箱' },
                      { label: '我的手机', desc: '绑定手机后即可使用手机号登录', status: '已绑定', action: '更改手机' },
                      { label: '我的密保', desc: '设置密保，账号更安全', status: '已设置', action: '查看并设置' },
                      { label: '实名认证', desc: '实名认证成功后，可享受开通直播间等服务', status: '已认证', action: '' },
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-800">{s.label}</span>
                            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{s.status}</span>
                          </div>
                          <p className="text-xs text-gray-400">{s.desc}</p>
                        </div>
                        {s.action && (
                          <button className="text-xs text-[#00a1d6] hover:underline flex items-center gap-0.5">
                            {s.action} <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-6">我的信息</h2>
                <div className="space-y-4 max-w-[500px]">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">昵称</label>
                    <input 
                      type="text" 
                      value={editForm.nickname}
                      onChange={e => setEditForm({...editForm, nickname: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#00a1d6]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">签名</label>
                    <textarea 
                      value={editForm.signature}
                      onChange={e => setEditForm({...editForm, signature: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#00a1d6]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">性别</label>
                    <select 
                      value={editForm.gender}
                      onChange={e => setEditForm({...editForm, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#00a1d6]"
                    >
                      <option>保密</option>
                      <option>男</option>
                      <option>女</option>
                    </select>
                  </div>
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-[#00a1d6] text-white rounded hover:bg-[#008fb3] transition-colors disabled:opacity-60"
                  >
                    {loading ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            )}

            {/* 其他菜单占位 */}
            {!['home', 'profile'].includes(activeMenu) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
                <div className="text-gray-400 mb-2">功能开发中</div>
                <p className="text-sm text-gray-300">敬请期待</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

// 分享图标组件
function Share({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  )
}
