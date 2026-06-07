import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '@/store/index'
import { api } from '@/api/client'
import {
  Database, Users, Video, FileText, MessageCircle, Radio,
  Heart, Clock, MessageSquare, ArrowLeft, RefreshCw,
  CheckCircle2, XCircle, Edit, Trash2, Save, Eye, Search,
  Layers, TrendingUp
} from 'lucide-react'

type TabKey = 'users' | 'videos' | 'articles' | 'comments' | 'live' | 'follows' | 'messages'

interface OverviewCounts {
  users: number; videos: number; articles: number
  comments: number; follows: number; messages: number; live_rooms: number
}

export default function DataManage() {
  const navigate = useNavigate()
  const currentUser = useStore(s => s.currentUser)
  const [activeTab, setActiveTab] = useState<TabKey>('users')
  const [overview, setOverview] = useState<OverviewCounts | null>(null)
  const [tableData, setTableData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'super_admin') {
      navigate('/login/admin')
      return
    }
    loadOverview()
  }, [currentUser])

  useEffect(() => {
    loadTabData(activeTab)
  }, [activeTab])

  const loadOverview = async () => {
    const res = await api.adminOverview()
    if (res.success) setOverview(res.counts)
  }

  const loadTabData = async (tab: TabKey) => {
    setLoading(true)
    setEditingId(null)
    let res: any
    switch (tab) {
      case 'users': res = await api.adminUsers(); break
      case 'videos': res = await api.adminVideos(); break
      case 'articles': res = await api.adminArticles(); break
      case 'comments': res = await api.adminComments(); break
      case 'live': res = await api.adminLiveRooms(); break
      case 'follows': res = await api.adminFollows(); break
      case 'messages': res = await api.adminMessages(); break
    }
    if (res?.success) setTableData(res.data || [])
    setLoading(false)
  }

  const startEdit = (row: any) => {
    setEditingId(row.id)
    if (activeTab === 'users') {
      setEditForm({ nickname: row.nickname || '', signature: row.signature || '', role: row.role || 'user', status: row.status || 'active', level: row.level || 1, coins: row.coins || 0 })
    } else if (activeTab === 'videos') {
      setEditForm({ title: row.title || '', description: row.description || '', category: row.category || '', status: row.status || 'approved', views: row.views || 0, likes: row.likes || 0 })
    } else if (activeTab === 'articles') {
      setEditForm({ title: row.title || '', summary: row.summary || '', category: row.category || '', status: row.status || 'approved', views: row.views || 0, likes: row.likes || 0 })
    }
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = async () => {
    if (!editingId) return
    let res: any
    if (activeTab === 'users') res = await api.adminUpdateUser(editingId, editForm)
    else if (activeTab === 'videos') res = await api.adminUpdateVideo(editingId, editForm)
    else if (activeTab === 'articles') res = await api.adminUpdateArticle(editingId, editForm)
    if (res?.success) {
      setEditingId(null)
      loadTabData(activeTab)
    } else {
      alert('保存失败: ' + (res?.message || '未知错误'))
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确认删除？此操作不可恢复。')) return
    if (activeTab === 'videos') await api.adminDeleteVideo(id)
    else if (activeTab === 'comments') await api.adminDeleteComment(id)
    loadTabData(activeTab)
  }

  const tabs: { key: TabKey; icon: any; label: string; countKey?: keyof OverviewCounts }[] = [
    { key: 'users', icon: Users, label: '用户', countKey: 'users' },
    { key: 'videos', icon: Video, label: '视频', countKey: 'videos' },
    { key: 'articles', icon: FileText, label: '文章', countKey: 'articles' },
    { key: 'comments', icon: MessageCircle, label: '评论', countKey: 'comments' },
    { key: 'live', icon: Radio, label: '直播间', countKey: 'live_rooms' },
    { key: 'follows', icon: Heart, label: '关注关系', countKey: 'follows' },
    { key: 'messages', icon: MessageSquare, label: '私信', countKey: 'messages' },
  ]

  const filtered = tableData.filter((row: any) => {
    if (!search.trim()) return true
    const s = search.toLowerCase()
    return JSON.stringify(row).toLowerCase().includes(s)
  })

  const renderUsersTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">用户名</th>
            <th className="py-3 px-4 text-left">昵称</th>
            <th className="py-3 px-4 text-left">邮箱</th>
            <th className="py-3 px-4 text-left">角色</th>
            <th className="py-3 px-4 text-left">等级</th>
            <th className="py-3 px-4 text-left">金币</th>
            <th className="py-3 px-4 text-left">状态</th>
            <th className="py-3 px-4 text-left">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filtered.map((u: any) => (
            <tr key={u.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 text-gray-400">{u.id}</td>
              {editingId === u.id ? (
                <>
                  <td className="py-2 px-4 text-gray-800 font-medium">{u.username}</td>
                  <td className="py-2 px-4"><input value={editForm.nickname} onChange={e => setEditForm({...editForm, nickname: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" /></td>
                  <td className="py-2 px-4 text-gray-400 text-xs">{u.email}</td>
                  <td className="py-2 px-4">
                    <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="border rounded px-1 py-0.5 text-xs">
                      <option value="user">user</option>
                      <option value="moderator">moderator</option>
                      <option value="admin">admin</option>
                      <option value="super_admin">super_admin</option>
                    </select>
                  </td>
                  <td className="py-2 px-4"><input type="number" value={editForm.level} onChange={e => setEditForm({...editForm, level: Number(e.target.value)})} className="w-16 border rounded px-1 py-0.5 text-xs" /></td>
                  <td className="py-2 px-4"><input type="number" step="0.01" value={editForm.coins} onChange={e => setEditForm({...editForm, coins: e.target.value})} className="w-24 border rounded px-1 py-0.5 text-xs" /></td>
                  <td className="py-2 px-4">
                    <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="border rounded px-1 py-0.5 text-xs">
                      <option value="active">活跃</option>
                      <option value="banned">封禁</option>
                    </select>
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button onClick={saveEdit} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save className="w-4 h-4" /></button>
                    <button onClick={cancelEdit} className="text-gray-400 hover:bg-gray-100 p-1 rounded"><XCircle className="w-4 h-4" /></button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 px-4 text-gray-800 font-medium">{u.username}</td>
                  <td className="py-2 px-4">{u.nickname || '-'}</td>
                  <td className="py-2 px-4 text-gray-400 text-xs">{u.email || '-'}</td>
                  <td className="py-2 px-4"><span className={`px-2 py-0.5 rounded text-xs ${u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : u.role === 'admin' ? 'bg-blue-100 text-blue-700' : u.role === 'moderator' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{u.role}</span></td>
                  <td className="py-2 px-4">Lv.{u.level}</td>
                  <td className="py-2 px-4">{u.coins}</td>
                  <td className="py-2 px-4"><span className={`px-2 py-0.5 rounded text-xs ${u.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{u.status === 'active' ? '活跃' : '封禁'}</span></td>
                  <td className="py-2 px-4">
                    <button onClick={() => startEdit(u)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit className="w-4 h-4" /></button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderVideosTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">标题</th>
            <th className="py-3 px-4 text-left">作者</th>
            <th className="py-3 px-4 text-left">分类</th>
            <th className="py-3 px-4 text-left">播放</th>
            <th className="py-3 px-4 text-left">点赞</th>
            <th className="py-3 px-4 text-left">状态</th>
            <th className="py-3 px-4 text-left">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filtered.map((v: any) => (
            <tr key={v.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 text-gray-400">{v.id}</td>
              {editingId === v.id ? (
                <>
                  <td className="py-2 px-4"><input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" /></td>
                  <td className="py-2 px-4 text-gray-600 text-xs">{v.username}</td>
                  <td className="py-2 px-4"><input value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-20 border rounded px-1 py-0.5 text-xs" /></td>
                  <td className="py-2 px-4"><input type="number" value={editForm.views} onChange={e => setEditForm({...editForm, views: Number(e.target.value)})} className="w-20 border rounded px-1 py-0.5 text-xs" /></td>
                  <td className="py-2 px-4"><input type="number" value={editForm.likes} onChange={e => setEditForm({...editForm, likes: Number(e.target.value)})} className="w-16 border rounded px-1 py-0.5 text-xs" /></td>
                  <td className="py-2 px-4">
                    <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="border rounded px-1 py-0.5 text-xs">
                      <option value="pending">审核中</option>
                      <option value="approved">已通过</option>
                      <option value="rejected">已驳回</option>
                    </select>
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button onClick={saveEdit} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save className="w-4 h-4" /></button>
                    <button onClick={cancelEdit} className="text-gray-400 hover:bg-gray-100 p-1 rounded"><XCircle className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 px-4 max-w-[200px] truncate" title={v.title}>{v.title}</td>
                  <td className="py-2 px-4 text-gray-600 text-xs">{v.username}</td>
                  <td className="py-2 px-4 text-xs">{v.category || '-'}</td>
                  <td className="py-2 px-4">{v.views?.toLocaleString() || 0}</td>
                  <td className="py-2 px-4">{v.likes?.toLocaleString() || 0}</td>
                  <td className="py-2 px-4"><span className={`px-2 py-0.5 rounded text-xs ${v.status === 'approved' ? 'bg-green-100 text-green-600' : v.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>{v.status === 'approved' ? '已通过' : v.status === 'pending' ? '审核中' : '已驳回'}</span></td>
                  <td className="py-2 px-4 flex gap-1">
                    <button onClick={() => startEdit(v)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(v.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderArticlesTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">标题</th>
            <th className="py-3 px-4 text-left">作者</th>
            <th className="py-3 px-4 text-left">分类</th>
            <th className="py-3 px-4 text-left">浏览</th>
            <th className="py-3 px-4 text-left">点赞</th>
            <th className="py-3 px-4 text-left">状态</th>
            <th className="py-3 px-4 text-left">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filtered.map((a: any) => (
            <tr key={a.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 text-gray-400">{a.id}</td>
              {editingId === a.id ? (
                <>
                  <td className="py-2 px-4"><input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full border rounded px-2 py-1 text-sm" /></td>
                  <td className="py-2 px-4 text-gray-600 text-xs">{a.username}</td>
                  <td className="py-2 px-4"><input value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})} className="w-20 border rounded px-1 py-0.5 text-xs" /></td>
                  <td className="py-2 px-4"><input type="number" value={editForm.views} onChange={e => setEditForm({...editForm, views: Number(e.target.value)})} className="w-20 border rounded px-1 py-0.5 text-xs" /></td>
                  <td className="py-2 px-4"><input type="number" value={editForm.likes} onChange={e => setEditForm({...editForm, likes: Number(e.target.value)})} className="w-16 border rounded px-1 py-0.5 text-xs" /></td>
                  <td className="py-2 px-4">
                    <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value})} className="border rounded px-1 py-0.5 text-xs">
                      <option value="pending">审核中</option>
                      <option value="approved">已通过</option>
                      <option value="rejected">已驳回</option>
                    </select>
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button onClick={saveEdit} className="text-green-600 hover:bg-green-50 p-1 rounded"><Save className="w-4 h-4" /></button>
                    <button onClick={cancelEdit} className="text-gray-400 hover:bg-gray-100 p-1 rounded"><XCircle className="w-4 h-4" /></button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 px-4 max-w-[200px] truncate" title={a.title}>{a.title}</td>
                  <td className="py-2 px-4 text-gray-600 text-xs">{a.username}</td>
                  <td className="py-2 px-4 text-xs">{a.category || '-'}</td>
                  <td className="py-2 px-4">{a.views?.toLocaleString() || 0}</td>
                  <td className="py-2 px-4">{a.likes?.toLocaleString() || 0}</td>
                  <td className="py-2 px-4"><span className={`px-2 py-0.5 rounded text-xs ${a.status === 'approved' ? 'bg-green-100 text-green-600' : a.status === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>{a.status === 'approved' ? '已通过' : a.status === 'pending' ? '审核中' : '已驳回'}</span></td>
                  <td className="py-2 px-4">
                    <button onClick={() => startEdit(a)} className="text-blue-600 hover:bg-blue-50 p-1 rounded"><Edit className="w-4 h-4" /></button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderCommentsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">内容</th>
            <th className="py-3 px-4 text-left">作者</th>
            <th className="py-3 px-4 text-left">目标类型</th>
            <th className="py-3 px-4 text-left">目标ID</th>
            <th className="py-3 px-4 text-left">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filtered.map((c: any) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 text-gray-400">{c.id}</td>
              <td className="py-2 px-4 max-w-[300px] truncate" title={c.content}>{c.content}</td>
              <td className="py-2 px-4 text-gray-600 text-xs">{c.username}</td>
              <td className="py-2 px-4 text-xs">{c.content_type || '-'}</td>
              <td className="py-2 px-4 text-xs text-gray-400">{c.content_id || '-'}</td>
              <td className="py-2 px-4">
                <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderLiveTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">标题</th>
            <th className="py-3 px-4 text-left">主播</th>
            <th className="py-3 px-4 text-left">状态</th>
            <th className="py-3 px-4 text-left">观看数</th>
            <th className="py-3 px-4 text-left">点赞</th>
            <th className="py-3 px-4 text-left">分类</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filtered.map((r: any) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 text-gray-400">{r.id}</td>
              <td className="py-2 px-4 max-w-[200px] truncate" title={r.title}>{r.title}</td>
              <td className="py-2 px-4 text-gray-600 text-xs">{r.username}</td>
              <td className="py-2 px-4"><span className={`px-2 py-0.5 rounded text-xs ${r.status === 'living' ? 'bg-red-100 text-red-600' : r.status === 'preview' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>{r.status === 'living' ? '直播中' : r.status === 'preview' ? '预告' : '已结束'}</span></td>
              <td className="py-2 px-4">{r.current_viewer_count?.toLocaleString() || 0}</td>
              <td className="py-2 px-4">{r.like_count?.toLocaleString() || 0}</td>
              <td className="py-2 px-4 text-xs">{r.category || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderFollowsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">关注者</th>
            <th className="py-3 px-4 text-left">被关注者</th>
            <th className="py-3 px-4 text-left">分组</th>
            <th className="py-3 px-4 text-left">时间</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filtered.map((f: any) => (
            <tr key={f.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 text-gray-400">{f.id}</td>
              <td className="py-2 px-4 text-gray-800">{f.follower_name}</td>
              <td className="py-2 px-4 text-gray-800">{f.following_name}</td>
              <td className="py-2 px-4 text-xs">{f.group_name || '默认'}</td>
              <td className="py-2 px-4 text-xs text-gray-400">{f.created_at ? new Date(f.created_at).toLocaleString('zh-CN') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderMessagesTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs">
          <tr>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">发送者</th>
            <th className="py-3 px-4 text-left">接收者</th>
            <th className="py-3 px-4 text-left">内容</th>
            <th className="py-3 px-4 text-left">已读</th>
            <th className="py-3 px-4 text-left">时间</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filtered.map((m: any) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 text-gray-400">{m.id}</td>
              <td className="py-2 px-4 text-gray-800">{m.sender_name}</td>
              <td className="py-2 px-4 text-gray-800">{m.receiver_name}</td>
              <td className="py-2 px-4 max-w-[300px] truncate" title={m.content}>{m.content}</td>
              <td className="py-2 px-4">{m.is_read ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-gray-400" />}</td>
              <td className="py-2 px-4 text-xs text-gray-400">{m.created_at ? new Date(m.created_at).toLocaleString('zh-CN') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (!currentUser || currentUser.role !== 'super_admin') return null

  return (
    <div className="min-h-screen bg-[#f1f2f3]">
      {/* 顶部导航 */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="flex items-center h-14 justify-between">
            <nav className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />返回控制台
              </Link>
              <span className="w-px h-6 bg-gray-200" />
              <div className="flex items-center gap-2 text-indigo-600 font-bold">
                <Database className="w-5 h-5" />
                <span>后台数据管理</span>
              </div>
            </nav>

            <div className="flex items-center gap-4">
              <button onClick={() => loadTabData(activeTab)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                <RefreshCw className="w-4 h-4" />刷新
              </button>
              <button onClick={loadOverview} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                <TrendingUp className="w-4 h-4" />更新概览
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 pt-24 pb-8">
        {/* 数据概览 */}
        {overview && (
          <div className="grid grid-cols-7 gap-3 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:shadow-md'
                }`}
              >
                <tab.icon className="w-5 h-5 mb-1" />
                <span className="text-xs mb-1">{tab.label}</span>
                <span className={`text-lg font-bold ${activeTab === tab.key ? 'text-white' : 'text-gray-800'}`}>
                  {tab.countKey ? overview[tab.countKey] : '-'}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* 搜索栏 */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`搜索${tabs.find(t => t.key === activeTab)?.label || ''}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-sm text-gray-400">
            共 {tableData.length} 条，筛选 {filtered.length} 条
          </span>
        </div>

        {/* 数据表格 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin" />
              <span className="ml-2 text-gray-500">加载中...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Layers className="w-12 h-12 mx-auto mb-3" />
              <p>{search ? '无匹配结果' : '暂无数据'}</p>
            </div>
          ) : (
            <>
              {activeTab === 'users' && renderUsersTable()}
              {activeTab === 'videos' && renderVideosTable()}
              {activeTab === 'articles' && renderArticlesTable()}
              {activeTab === 'comments' && renderCommentsTable()}
              {activeTab === 'live' && renderLiveTable()}
              {activeTab === 'follows' && renderFollowsTable()}
              {activeTab === 'messages' && renderMessagesTable()}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
