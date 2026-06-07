import { useState, useEffect } from 'react'
import { useStore } from '@/store/index'
import { api } from '@/api/client'

type Table = 'users' | 'videos' | 'articles' | 'comments' | 'follows' | 'messages' | 'live'

interface Overview { users: number; videos: number; articles: number; comments: number; follows: number; messages: number; live_rooms: number }

const SUPER_ADMIN_API = 'http://localhost:3001/api/admin';

function superFetch(path: string, opts?: RequestInit) {
  const token = sessionStorage.getItem('bilibili-token') || localStorage.getItem('bilibili-token') || '';
  return fetch(`${SUPER_ADMIN_API}${path}`, {
    ...opts,
    headers: { ...opts?.headers, 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  }).then(r => r.json());
}

export default function SuperAdmin() {
  const currentUser = useStore(s => s.currentUser);
  const [tab, setTab] = useState<Table>('users');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => { superFetch('/overview').then(r => { if (r.success) setOverview(r.counts) }) }, []);

  const loadTable = async (t: Table) => {
    setTab(t);
    setEditingId(null);
    setLoading(true);
    const r = await superFetch(`/${t}`);
    if (r.success) setData(r.data);
    setLoading(false);
  };

  useEffect(() => { loadTable('users') }, []);

  const startEdit = (item: any) => { setEditingId(item.id); setEditForm({ ...item }) };
  const cancelEdit = () => { setEditingId(null); setEditForm({}) };

  const handleSave = async () => {
    const r = await superFetch(`/${tab}/${editingId}`, {
      method: 'PUT', body: JSON.stringify(editForm)
    });
    if (r.success) { cancelEdit(); loadTable(tab); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return;
    const r = await superFetch(`/${tab}/${id}`, { method: 'DELETE' });
    if (r.success) loadTable(tab);
  };

  const tabs: { key: Table; label: string }[] = [
    { key: 'users', label: '👤 用户' },
    { key: 'videos', label: '🎬 视频' },
    { key: 'articles', label: '📝 文章' },
    { key: 'comments', label: '💬 评论' },
    { key: 'follows', label: '👥 关注' },
    { key: 'messages', label: '✉️ 私信' },
    { key: 'live', label: '📺 直播' },
  ];

  if (!currentUser || currentUser.role !== 'super_admin') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center"><p className="text-xl text-gray-600">需要超级管理员权限</p><p className="text-sm text-gray-400 mt-2">请用 admin 账号登录</p></div>
    </div>;
  }

  const renderEditForm = () => {
    if (tab === 'users') return (
      <div className="space-y-2">
        <input className="w-full px-2 py-1 border rounded text-sm" value={editForm.nickname || ''} onChange={e => setEditForm({ ...editForm, nickname: e.target.value })} placeholder="昵称" />
        <input className="w-full px-2 py-1 border rounded text-sm" value={editForm.signature || ''} onChange={e => setEditForm({ ...editForm, signature: e.target.value })} placeholder="签名" />
        <select className="w-full px-2 py-1 border rounded text-sm" value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
          <option value="user">user</option><option value="admin">admin</option><option value="super_admin">super_admin</option>
        </select>
        <select className="w-full px-2 py-1 border rounded text-sm" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
          <option value="active">active</option><option value="banned">banned</option>
        </select>
      </div>
    );
    if (tab === 'videos' || tab === 'articles') return (
      <div className="space-y-2">
        <input className="w-full px-2 py-1 border rounded text-sm" value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="标题" />
        <select className="w-full px-2 py-1 border rounded text-sm" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
          <option value="approved">approved</option><option value="pending">pending</option><option value="rejected">rejected</option>
        </select>
      </div>
    );
    return <p className="text-xs text-gray-500">仅支持删除操作</p>;
  };

  const renderTable = (cols: string[], row: any) => cols.map(c => (
    <td key={c} className="px-3 py-2 text-xs max-w-[200px] truncate">{String(row[c] ?? '')}</td>
  ));

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#FB7299]">🛡️ 超级管理员后台</h1>
        <span className="text-xs text-gray-400">{currentUser.username} | super_admin</span>
      </header>

      {/* 概览 */}
      {overview && (
        <div className="px-6 py-4 grid grid-cols-7 gap-3 border-b border-gray-700">
          {Object.entries(overview).map(([k, v]) => (
            <div key={k} className="bg-gray-800 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-[#FB7299]">{v}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{k}</div>
            </div>
          ))}
        </div>
      )}

      {/* 标签页 */}
      <div className="flex gap-1 px-6 py-3 border-b border-gray-700">
        {tabs.map(t => (
          <button key={t.key} onClick={() => loadTable(t.key)}
            className={`px-4 py-1.5 rounded text-xs ${tab === t.key ? 'bg-[#FB7299] text-white' : 'text-gray-400 hover:bg-gray-800'}`}>{t.label}</button>
        ))}
      </div>

      {/* 数据表 */}
      <div className="p-6">
        {loading ? <div className="text-center py-10 text-gray-500">加载中...</div> : (
          <div className="overflow-x-auto bg-gray-800 rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 text-left">
                  {data.length > 0 && Object.keys(data[0]).slice(0, 8).map(k => (
                    <th key={k} className="px-3 py-2 text-xs text-gray-400 font-medium">{k}</th>
                  ))}
                  <th className="px-3 py-2 text-xs text-gray-400 font-medium w-24">操作</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => (
                  <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    {editingId === item.id ? (
                      <td colSpan={10} className="px-3 py-2">
                        <div className="flex gap-2 items-start">
                          <div className="flex-1">{renderEditForm()}</div>
                          <button onClick={handleSave} className="px-3 py-1 bg-green-600 text-white rounded text-xs">保存</button>
                          <button onClick={cancelEdit} className="px-3 py-1 bg-gray-600 rounded text-xs">取消</button>
                        </div>
                      </td>
                    ) : (
                      <>
                        {renderTable(Object.keys(item).slice(0, 8), item)}
                        <td className="px-3 py-2">
                          <div className="flex gap-1">
                            {(tab === 'users' || tab === 'videos' || tab === 'articles') && (
                              <button onClick={() => startEdit(item)} className="px-2 py-1 bg-blue-600 text-white rounded text-[10px]">编辑</button>
                            )}
                            {tab !== 'follows' && tab !== 'messages' && (
                              <button onClick={() => handleDelete(item.id)} className="px-2 py-1 bg-red-600 text-white rounded text-[10px]">删除</button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
