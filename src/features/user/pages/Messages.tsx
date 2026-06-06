import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { api } from '@/api/client'
import MessageDropdown from '@/features/user/components/MessageDropdown'
import FeedDropdown from '@/features/user/components/FeedDropdown'
import FavoriteDropdown from '@/features/user/components/FavoriteDropdown'
import HistoryDropdown from '@/features/user/components/HistoryDropdown'
import UploadDropdown from '@/features/user/components/UploadDropdown'
import UserDropdown from '@/features/user/components/UserDropdown'
import { Search, User, Download, ArrowLeft, MessageCircle, Clock, ExternalLink, AtSign, Heart, Bell, Settings, Reply } from 'lucide-react'

interface Conversation {
  other_id: number
  username: string
  nickname: string
  avatar: string
  last_message: string | null
  last_time: string
  unread_count: number
}

interface Message {
  id: number
  sender_id: number
  receiver_id: number
  content: string
  is_read: number
  created_at: string
  sender_name: string
  sender_nickname: string
  sender_avatar: string
  receiver_name: string
  receiver_nickname: string
}

export default function Messages() {
  const navigate = useNavigate()
  const { username: routeUsername } = useParams<{ username?: string }>()
  const [searchParams] = useSearchParams()
  const currentUser = useStore(s => s.currentUser)
  const users = useStore(s => s.users)
  const [searchQuery, setSearchQuery] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('messages')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval>>()

  const categories = [
    { id: 'messages', label: '我的消息', icon: MessageCircle, count: conversations.length },
    { id: 'replies', label: '回复我的', icon: Reply },
    { id: 'at', label: '@我的', icon: AtSign },
    { id: 'likes', label: '收到的赞', icon: Heart },
    { id: 'system', label: '系统通知', icon: Bell },
    { id: 'settings', label: '消息设置', icon: Settings },
  ]

  const loadConversations = useCallback(async () => {
    if (!currentUser) return
    const res = await api.getConversations()
    if (res.success) setConversations(res.conversations)
  }, [currentUser])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // 如果URL带了user参数且会话列表已加载，自动选中
  useEffect(() => {
    const targetUser = searchParams.get('user')
    if (targetUser && conversations.length > 0 && !selectedUser) {
      const found = conversations.find((c: Conversation) => c.username === targetUser)
      if (found) selectConversation(found)
    }
  }, [conversations, searchParams])

  // 定时刷新会话列表（双向通信）
  useEffect(() => {
    if (!currentUser) return
    const interval = setInterval(() => loadConversations(), 5000)
    return () => clearInterval(interval)
  }, [currentUser])

  // 选择用户并加载消息（每个对话独立实例）
  const selectConversation = async (conv: Conversation) => {
    if (selectedUser?.other_id === conv.other_id) return
    setSelectedUser(conv)
    setMessages([]) // 清空旧消息
    setConversations(prev => prev.map(c =>
      c.other_id === conv.other_id ? { ...c, unread_count: 0 } : c
    ))
    setLoading(true)
    const res = await api.getMessages(conv.other_id)
    if (res.success) setMessages(res.messages)
    setLoading(false)
    loadConversations()
  }

  // 轮询新消息（当前选中聊天）
  useEffect(() => {
    if (!selectedUser) return
    pollRef.current = setInterval(async () => {
      const res = await api.getMessages(selectedUser.other_id)
      if (res.success) setMessages(res.messages)
      // 选中对话时确保未读数为0
      setConversations(prev => prev.map(c =>
        c.other_id === selectedUser.other_id ? { ...c, unread_count: 0 } : c
      ))
    }, 3000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [selectedUser?.other_id])

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 发送消息
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !selectedUser) return
    if (inputText.length > 500) return
    const content = inputText.slice(0, 500)
    const res = await api.sendMessage(selectedUser.other_id, content)
    if (res.success) {
      setMessages(prev => [...prev, res.message])
      setInputText('')
      const convRes = await api.getConversations()
      if (convRes.success) {
        setConversations(convRes.conversations)
        const updated = convRes.conversations.find((c: Conversation) => c.other_id === selectedUser.other_id)
        if (updated) setSelectedUser(updated)
      }
    }
  }

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return '刚刚'
    if (mins < 60) return `${mins}分钟前`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}天前`
    return new Date(d).toLocaleDateString('zh-CN')
  }

  const formatTime = (d: string) => {
    const date = new Date(d)
    return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`
  }

  // 重定向：无路由参数时跳转
  useEffect(() => {
    if (!routeUsername && currentUser) {
      navigate(`/messages/${currentUser.username}`, { replace: true })
    }
  }, [routeUsername, currentUser, navigate])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">请先登录</p>
          <p className="text-gray-400 text-sm mb-4">查看 {routeUsername || ''} 的私信需要登录该账号</p>
          <Link to="/login/user" className="inline-block px-6 py-2 bg-[#FB7299] text-white rounded-full text-sm">前往登录</Link>
        </div>
      </div>
    )
  }

  // 已登录但用户名不匹配 → 提示切换账号
  if (routeUsername && routeUsername !== currentUser.username) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">账号不匹配</p>
          <p className="text-gray-400 text-sm mb-1">当前登录：<span className="text-[#FB7299] font-medium">{currentUser.nickname || currentUser.username}</span></p>
          <p className="text-gray-400 text-sm mb-4">目标账户：<span className="font-medium">{routeUsername}</span></p>
          <div className="flex items-center justify-center gap-3">
            <Link to={`/messages/${currentUser.username}`} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full text-sm hover:bg-gray-300">进入我的消息</Link>
            <button onClick={() => { sessionStorage.removeItem('bilibili-token'); window.location.href = `/login/user` }}
              className="px-4 py-2 bg-[#FB7299] text-white rounded-full text-sm hover:bg-[#e86185]">切换账号登录</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="flex items-center h-14 justify-between">
            <nav className="hidden md:flex items-center gap-3 text-sm">
              <Link to="/" className="text-gray-800 hover:text-[#FB7299] font-medium">首页</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">番剧</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">直播</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">游戏中心</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">会员购</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">漫画</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299]">赛事</Link>
              <Link to="/" className="text-gray-800 hover:text-[#FB7299] flex items-center gap-1">
                <Download className="w-4 h-4" />下载客户端
              </Link>
            </nav>

            <div className="flex-1 max-w-[400px] mx-4">
              <div className="relative">
                <input type="text" placeholder="搜索内容/用户..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-4 pr-12 bg-gray-100 rounded-full text-sm focus:outline-none focus:border-[#FB7299] focus:bg-white transition-all" />
                <button className="absolute right-0 top-0 w-12 h-10 bg-gradient-to-r from-[#FB7299] to-[#FF9EB1] rounded-r-full flex items-center justify-center">
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {currentUser ? (
                <UserDropdown currentUser={currentUser}
                  avatar={currentUser.username ? users.find(u => u.username === currentUser.username)?.avatar : undefined} />
              ) : (
                <Link to="/login/user" className="flex flex-col items-center hover:opacity-80 group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FB7299] to-[#FF9EB1] flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-700 mt-1 group-hover:text-[#FB7299]">登录</span>
                </Link>
              )}
              <div className="flex items-center gap-3 ml-2">
                <MessageDropdown currentUser={currentUser} />
                <FeedDropdown currentUser={currentUser} />
                <FavoriteDropdown currentUser={currentUser} />
                <HistoryDropdown currentUser={currentUser} />
                <UploadDropdown currentUser={currentUser} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主体 */}
      <div className="flex-1 pt-20">
        <div className="h-[calc(100vh-80px)] max-w-[1200px] mx-auto flex bg-white rounded-t-xl shadow-sm overflow-hidden mt-2">
          {/* 最左侧：消息分类导航 */}
          <div className="w-48 border-r border-gray-100 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">消息中心</h2>
            </div>
            <div className="flex-1 py-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-[#FB7299]/10 text-[#FB7299] font-medium border-r-2 border-[#FB7299]'
                      : 'text-gray-600 hover:bg-gray-50 border-r-2 border-transparent'
                  }`}>
                  <cat.icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{cat.label}</span>
                  {cat.count !== undefined && cat.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      activeCategory === cat.id ? 'bg-[#FB7299] text-white' : 'bg-gray-200 text-gray-500'
                    }`}>{cat.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 中间：会话列表 */}
          <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-800">最近消息</h3>
              {/* 关注用户头像列表 - 点击即可发起聊天 */}
              <div className="flex items-center gap-1">
                {conversations.length > 0 ? conversations.slice(0, 6).map(conv => (
                  <button key={conv.other_id} onClick={() => selectConversation(conv)}
                    title={conv.nickname || conv.username} className="hover:opacity-80 transition-opacity">
                    <img src={conv.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop`}
                      alt="" className="w-7 h-7 rounded-full object-cover border border-white -ml-1 first:ml-0 shadow-sm" />
                  </button>
                )) : (
                  <span className="text-xs text-gray-400">暂无关注用户</span>
                )}
                {conversations.length > 6 && (
                  <span className="text-xs text-gray-400 ml-1">等{conversations.length}人</span>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">暂无消息</p>
                  <p className="text-xs text-gray-300 mt-1">关注其他用户后即可私信聊天</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <button
                    key={conv.other_id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full p-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
                      selectedUser?.other_id === conv.other_id ? 'bg-[#FB7299]/5 border-l-2 border-[#FB7299]' : 'border-l-2 border-transparent'
                    }`}>
                    <Link to={`/user/${conv.username}`} onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0 hover:opacity-80 transition-opacity">
                      <div className="relative">
                        <img src={conv.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop`}
                          alt="" className="w-10 h-10 rounded-full object-cover" />
                        {conv.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                            {conv.unread_count > 99 ? '99+' : conv.unread_count}
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Link to={`/user/${conv.username}`} onClick={(e) => e.stopPropagation()}
                          className="text-xs font-medium text-gray-800 hover:text-[#FB7299] transition-colors truncate">
                          {conv.nickname || conv.username}
                        </Link>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{conv.last_time ? timeAgo(conv.last_time) : ''}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">{conv.last_message || '点击开始聊天'}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* 右侧：聊天区域 */}
          <div className="flex-1 flex flex-col min-w-0">
            {!selectedUser ? (
              /* 空状态 */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <MessageCircle className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-400">选择一个会话开始聊天</p>
                </div>
              </div>
            ) : (
              <>
                {/* 聊天头部 */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link to={`/user/${selectedUser.username}`}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
                      <img src={selectedUser.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop`}
                        alt="" className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800 group-hover:text-[#FB7299] transition-colors">
                            {selectedUser.nickname || selectedUser.username}
                          </span>
                          <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-[#FB7299]" />
                        </div>
                      </div>
                    </Link>
                  </div>
                  <Link to={`/user/${selectedUser.username}`}
                    className="text-xs text-[#FB7299] hover:underline">
                    查看主页
                  </Link>
                </div>

                {/* 消息列表 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <div className="animate-spin w-6 h-6 border-2 border-[#FB7299] border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isMe = msg.sender_id === currentUser?.id
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-end gap-2 max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                            {/* 头像 */}
                            <Link to={`/user/${msg.sender_name}`}
                              className="flex-shrink-0 hover:opacity-80">
                              <img src={msg.sender_avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop`}
                                alt="" className="w-8 h-8 rounded-full object-cover" />
                            </Link>
                            {/* 消息气泡 */}
                            <div>
                              <div className={`px-3 py-2 rounded-xl text-sm leading-relaxed ${
                                isMe
                                  ? 'bg-[#FB7299] text-white rounded-br-sm'
                                  : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                              }`}>
                                {msg.content}
                              </div>
                              <div className={`text-[10px] text-gray-400 mt-0.5 ${isMe ? 'text-right' : 'text-left'}`}>
                                {formatTime(msg.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* 输入区域 */}
                <form onSubmit={handleSend} className="p-4 border-t border-gray-100">
                  <div className="relative rounded-xl border border-gray-200 bg-gray-50 focus-within:border-[#FB7299] focus-within:bg-white transition-colors overflow-hidden">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value.slice(0, 500))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e) }
                      }}
                      placeholder="请输入消息内容"
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 pt-3 pb-10 text-sm bg-transparent focus:outline-none resize-none"
                    />
                    {/* 底部工具栏 */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-gray-50/80">
                      <div className="flex items-center gap-2">
                        <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors" title="表情">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="8" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/><path d="M8 15c1.5 2 4.5 2 6 0" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
                        </button>
                        <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors" title="图片">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${inputText.length >= 500 ? 'text-red-500' : 'text-gray-400'}`}>
                          {inputText.length}/500
                        </span>
                        <button type="submit" disabled={!inputText.trim()}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            inputText.trim()
                              ? 'bg-[#FB7299] text-white hover:bg-[#e86185]'
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                          发送
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
