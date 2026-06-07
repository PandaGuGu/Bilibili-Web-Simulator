import { useState } from 'react';
import Sidebar from '@/pages/Sidebar';
import { useStore, Content, ContentStatus } from '@/store/index';
import { Check, X, Search, Filter, Video, MessageSquare, FileText, Clock } from 'lucide-react';

export default function Moderation() {
  const { contents, approveContent, rejectContent } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | Content['type']>('all');

  const filteredContents = contents.filter((content) => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || content.status === statusFilter;
    const matchesType = typeFilter === 'all' || content.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: ContentStatus) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    const labels = {
      pending: '待审核',
      approved: '已通过',
      rejected: '已驳回',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getTypeIcon = (type: Content['type']) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-pink-500" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'article':
        return <FileText className="w-5 h-5 text-cyan-500" />;
    }
  };

  const getTypeLabel = (type: Content['type']) => {
    const labels = { video: '视频', comment: '评论', article: '文章' };
    return labels[type];
  };

  return (
    <Sidebar>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">内容审核</h1>
          <p className="text-slate-500 mt-2">审核和管理平台用户提交的内容</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="搜索内容..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="pending">待审核</option>
                <option value="approved">已通过</option>
                <option value="rejected">已驳回</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="all">全部类型</option>
                <option value="video">视频</option>
                <option value="comment">评论</option>
                <option value="article">文章</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredContents.map((content) => (
            <div key={content.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row gap-6">
                {content.thumbnail && (
                  <div className="lg:w-48 h-32 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={content.thumbnail}
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(content.type)}
                      <div>
                        <h3 className="font-semibold text-slate-800 text-lg">{content.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-slate-500">{getTypeLabel(content.type)}</span>
                          <span className="text-slate-300">•</span>
                          <div className="flex items-center gap-2">
                            <img
                              src={content.authorAvatar}
                              alt={content.author}
                              className="w-5 h-5 rounded-full"
                            />
                            <span className="text-sm text-slate-600">{content.author}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(content.status)}
                  </div>
                  <p className="text-slate-600 mb-4 line-clamp-2">{content.preview}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{content.submittedAt}</span>
                    </div>
                    {content.status === 'pending' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => approveContent(content.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          通过
                        </button>
                        <button
                          onClick={() => rejectContent(content.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          驳回
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredContents.length === 0 && (
          <div className="text-center py-16">
            <div className="text-slate-300 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-2">没有找到内容</h3>
            <p className="text-slate-400">尝试调整筛选条件</p>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
