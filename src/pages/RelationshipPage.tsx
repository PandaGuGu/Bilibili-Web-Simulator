import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/index';
import { api } from '@/api/client';
import UserDropdown from '@/components/UserDropdown';
import MessageDropdown from '@/components/MessageDropdown';
import FeedDropdown from '@/components/FeedDropdown';
import FavoriteDropdown from '@/components/FavoriteDropdown';
import HistoryDropdown from '@/components/HistoryDropdown';
import { Search, User, ArrowLeft, UserPlus, UserCheck, MoreHorizontal } from 'lucide-react';

type Tab = 'following' | 'fans';

interface RelationUser {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  signature: string;
  followers_count: number;
  level: number;
  group_name?: string;
  follow_time: string;
  is_following?: boolean;
}

export default function RelationshipPage() {
  const { username } = useParams<{ username?: string }>();
  const navigate = useNavigate();
  const currentUser = useStore(s => s.currentUser);
  const users = useStore(s => s.users);
  const [activeTab, setActiveTab] = useState<Tab>('following');
  const [list, setList] = useState<RelationUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  const loadData = async (tab: Tab, p: number) => {
    if (!username) return;
    setLoading(true);
    const userId = users.find(u => u.username === username)?.id || 0;
    const res = tab === 'following'
      ? await api.getFollowings(userId, p)
      : await api.getFollowers(userId, p);
    if (res.success) {
      setList(res.list);
      setTotal(res.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (username) {
      setPage(1);
      loadData(activeTab, 1);
    }
  }, [username, activeTab]);

  useEffect(() => {
    if (page > 1) loadData(activeTab, page);
  }, [page]);

  const handleFollow = async (userId: number, following: boolean) => {
    if (!currentUser) return;
    const res = following ? await api.unfollow(userId) : await api.follow(userId);
    if (res.success) {
      setList(prev => prev.map(u => u.id === userId ? { ...u, is_following: !following } : u));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-3">
          <div className="flex items-center h-14 justify-between">
            <nav className="flex items-center gap-3 text-sm">
              <Link to="/" className="text-gray-800 hover:text-[#FB7299] font-medium">首页</Link>
              <Link to="/anime" className="text-gray-800 hover:text-[#FB7299]">番剧</Link>
              <Link to="/live" className="text-gray-800 hover:text-[#FB7299]">直播</Link>
            </nav>
            <div className="flex items-center gap-1">
              {currentUser ? (
                <UserDropdown currentUser={currentUser}
                  avatar={users.find(u => u.username === currentUser.username)?.avatar} />
              ) : (
                <Link to="/login/user" className="flex flex-col items-center group">
                  <div className="w-10 h-10 rounded-full bg-[#FB7299] flex items-center justify-center"><User className="w-5 h-5 text-white" /></div>
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

      {/* 内容 */}
      <div className="max-w-[1200px] mx-auto px-4 pt-24 pb-8">
        {/* 用户信息 */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-[#FB7299]">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Link to={`/user/${username}`}>
              <img src={users.find(u => u.username === username)?.avatar || ''} alt="" className="w-12 h-12 rounded-full object-cover" />
            </Link>
            <div>
              <Link to={`/user/${username}`} className="text-lg font-bold text-gray-900 hover:text-[#FB7299]">{username}</Link>
              <p className="text-xs text-gray-500">查看个人主页</p>
            </div>
          </div>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-6 mb-6">
          <button onClick={() => setActiveTab('following')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'following' ? 'border-[#FB7299] text-[#FB7299]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            关注列表 ({total})
          </button>
          <button onClick={() => setActiveTab('fans')}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'fans' ? 'border-[#FB7299] text-[#FB7299]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            粉丝列表 ({total})
          </button>
        </div>

        {/* 用户网格 */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-[#FB7299] border-t-transparent rounded-full" /></div>
        ) : list.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <User className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400">暂无{activeTab === 'following' ? '关注' : '粉丝'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {list.map(u => (
              <div key={u.id} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <Link to={`/user/${u.username}`} className="relative">
                    <img src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                      alt="" className="w-16 h-16 rounded-full object-cover hover:opacity-80 transition-opacity" />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#FB7299] text-white text-[10px] rounded-full flex items-center justify-center">Lv{u.level}</span>
                  </Link>
                  <Link to={`/user/${u.username}`} className="font-semibold text-gray-800 mt-3 hover:text-[#FB7299] transition-colors">{u.nickname || u.username}</Link>
                  <p className="text-xs text-gray-400 mt-0.5">@{u.username}</p>
                  <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{u.signature || '这个人很懒，什么都没写~'}</p>
                  <div className="text-xs text-gray-400 mt-2">{u.followers_count} 粉丝</div>
                  {/* 操作按钮 */}
                  {currentUser && currentUser.username !== u.username && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleFollow(u.id, !!u.is_following)}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${u.is_following ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-[#FB7299] text-white hover:bg-[#e86185]'}`}>
                        {u.is_following ? '已关注' : '+ 关注'}
                      </button>
                      <Link to={`/messages/${currentUser.username}?user=${u.username}`}
                        className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200">私信</Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {total > limit && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-full text-sm ${page === i + 1 ? 'bg-[#FB7299] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
