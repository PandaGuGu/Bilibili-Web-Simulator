import { useState } from 'react';
import Sidebar from '@/features/admin/components/Sidebar';
import { useStore } from '@/store/useStore';
import { Users, CheckSquare, Video, MessageSquare, TrendingUp, Clock, Award, Edit, Trash2, Eye, ThumbsUp, AlertCircle, Search, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { users, contents, comments, approveContent, rejectContent, deleteContent, deleteComment } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const pendingContents = contents.filter((c) => c.status === 'pending');
  const approvedContents = contents.filter((c) => c.status === 'approved');
  const rejectedContents = contents.filter((c) => c.status === 'rejected');
  const activeUsers = users.filter((u) => u.status === 'active');
  const bannedUsers = users.filter((u) => u.status === 'banned');

  const videoCount = contents.filter((c) => c.type === 'video').length;
  const articleCount = contents.filter((c) => c.type === 'article').length;
  const commentCount = contents.filter((c) => c.type === 'comment').length;

  const filteredContents = contents.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = [
    { label: '待审核内容', value: pendingContents.length, icon: Clock, color: 'from-amber-500 to-orange-500' },
    { label: '已通过内容', value: approvedContents.length, icon: CheckSquare, color: 'from-green-500 to-emerald-500' },
    { label: '已驳回内容', value: rejectedContents.length, icon: X, color: 'from-red-500 to-rose-500' },
    { label: '活跃用户', value: activeUsers.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: '总用户数', value: users.length, icon: Users, color: 'from-purple-500 to-pink-500' },
    { label: '评论总数', value: comments.length, icon: MessageSquare, color: 'from-cyan-500 to-blue-500' },
  ];

  // 最近活动 - 使用真实数据
  const recentContents = [...contents]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  return (
    <Sidebar>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">数据概览</h1>
          <p className="text-slate-500 mt-2">欢迎回来！这是平台的实时数据统计</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                <div className={`w-8 h-8 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">内容类型分布</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Video className="w-4 h-4 text-pink-500" /> 视频
                  </span>
                  <span className="font-medium text-slate-800">{videoCount}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-pink-600 rounded-full" style={{ width: `${(videoCount / contents.length) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Award className="w-4 h-4 text-cyan-500" /> 专栏
                  </span>
                  <span className="font-medium text-slate-800">{articleCount}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full" style={{ width: `${(articleCount / contents.length) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" /> 评论
                  </span>
                  <span className="font-medium text-slate-800">{commentCount}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: `${(commentCount / contents.length) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-800 mb-4">最近提交</h2>
            <div className="space-y-3">
              {recentContents.map((content) => (
                <div key={content.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-all">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    content.type === 'video' ? 'bg-pink-100 text-pink-600' :
                    content.type === 'article' ? 'bg-cyan-100 text-cyan-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {content.type === 'video' ? <Video className="w-5 h-5" /> :
                     content.type === 'article' ? <Award className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{content.title}</p>
                    <p className="text-xs text-slate-400">@{content.author} · {content.submittedAt}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    content.status === 'approved' ? 'bg-green-100 text-green-600' :
                    content.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {content.status === 'approved' ? '已通过' : content.status === 'pending' ? '待审核' : '已驳回'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 内容管理区域 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">内容管理</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索内容..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">全部类型</option>
                <option value="video">视频</option>
                <option value="article">专栏</option>
                <option value="comment">评论</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">内容</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">作者</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">类型</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">状态</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">日期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredContents.map((content) => (
                  <tr key={content.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {content.thumbnail && (
                          <img src={content.thumbnail} alt="" className="w-12 h-8 rounded object-cover" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-800 truncate max-w-[200px]">{content.title}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">{content.preview}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/user/${content.author}`} className="text-sm text-pink-500 hover:underline">
                        @{content.author}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        content.type === 'video' ? 'bg-pink-100 text-pink-600' :
                        content.type === 'article' ? 'bg-cyan-100 text-cyan-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {content.type === 'video' ? '视频' : content.type === 'article' ? '专栏' : '评论'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        content.status === 'approved' ? 'bg-green-100 text-green-600' :
                        content.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {content.status === 'approved' ? '已通过' : content.status === 'pending' ? '待审核' : '已驳回'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-500">{content.submittedAt}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {content.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveContent(content.id)}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                              title="通过"
                            >
                              <CheckSquare className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => rejectContent(content.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                              title="驳回"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </>
                        )}
                        {content.status === 'approved' && (
                          <button
                            onClick={() => rejectContent(content.id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="下架"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('确定要删除这条内容吗？')) {
                              deleteContent(content.id);
                            }
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
