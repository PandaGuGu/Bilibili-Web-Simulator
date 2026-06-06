import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, MessageCircle, Trash2, ChevronDown, ChevronUp, Send, Clock, Flame } from 'lucide-react';
import { api } from '../../../api/client';
import { useStore } from '../../../store/useStore';

interface CommentData {
  id: number;
  video_id?: number;
  article_id?: number;
  user_id: number;
  parent_id: number | null;
  reply_to_user_id: number | null;
  content: string;
  likes: number;
  status: string;
  created_at: string;
  username: string;
  user_avatar: string;
  nickname: string;
  level: number;
  reply_username?: string;
  replies: CommentData[];
}

export const CommentSection: React.FC<{ videoId: number }> = ({ videoId }) => {
  const currentUser = useStore((s) => s.currentUser);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<'time' | 'hot'>('hot');
  const [inputText, setInputText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; username: string } | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());

  const loadComments = useCallback(async () => {
    setLoading(true);
    const res = await api.getComments('video', videoId, { sort });
    if (res.success) {
      setComments(res.comments);
      setTotal(res.total);
    }
    setLoading(false);
  }, [videoId, sort]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async () => {
    if (!inputText.trim() || !currentUser) return;
    const res = await api.postComment({ videoId, content: inputText });
    if (res.success) {
      setInputText('');
      loadComments();
    }
  };

  const handleReply = async (parentId: number) => {
    if (!replyText.trim() || !currentUser) return;
    const target = comments.find(c => c.id === parentId);
    const res = await api.postComment({
      videoId,
      content: replyText,
      parentId,
      replyToUserId: target?.user_id,
    });
    if (res.success) {
      setReplyText('');
      setReplyTo(null);
      loadComments();
    }
  };

  const handleLike = async (id: number) => {
    await api.likeComment(id);
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, likes: c.likes + 1 } :
      { ...c, replies: c.replies.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r) }
    ));
  };

  const handleDelete = async (id: number) => {
    const res = await api.deleteComment(id);
    if (res.success) loadComments();
  };

  const toggleReplies = (id: number) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins}分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}天前`;
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  const renderComment = (c: CommentData, isReply = false) => (
    <div key={c.id} className={`flex gap-3 ${isReply ? 'pl-12' : ''}`}>
      <img src={c.user_avatar} alt="" className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#FB7299]">{c.nickname || c.username}</span>
          {c.level > 0 && (
            <span className="px-1.5 py-0.5 bg-[#FB7299]/10 text-[#FB7299] rounded text-[10px] font-bold">
              Lv{c.level}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-800 mt-1 leading-relaxed">
          {c.reply_username && <span className="text-[#FB7299]">@ {c.reply_username} </span>}
          {c.content}
        </p>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <span>{timeAgo(c.created_at)}</span>
          <button onClick={() => handleLike(c.id)} className="flex items-center gap-1 hover:text-[#FB7299] transition-colors">
            <ThumbsUp className="w-3.5 h-3.5" /> {c.likes}
          </button>
          {!isReply && (
            <button onClick={() => setReplyTo(replyTo?.id === c.id ? null : { id: c.id, username: c.nickname || c.username })}
              className="flex items-center gap-1 hover:text-[#FB7299] transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> 回复
            </button>
          )}
          {(currentUser?.username === c.username || currentUser?.role === 'admin') && (
            <button onClick={() => handleDelete(c.id)} className="flex items-center gap-1 hover:text-red-500 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> 删除
            </button>
          )}
        </div>
        {/* 回复输入框 */}
        {replyTo?.id === c.id && (
          <div className="mt-2 flex gap-2">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleReply(c.id)}
              placeholder={`回复 @${replyTo.username}...`}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#FB7299]"
              autoFocus
            />
            <button onClick={() => handleReply(c.id)}
              className="px-3 py-1.5 bg-[#FB7299] text-white text-sm rounded-lg hover:bg-[#e86185] transition-colors">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {/* 回复列表 */}
        {!isReply && c.replies?.length > 0 && (
          <div className="mt-2">
            <button onClick={() => toggleReplies(c.id)}
              className="flex items-center gap-1 text-xs text-[#FB7299] hover:underline">
              {expandedReplies.has(c.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expandedReplies.has(c.id) ? '收起回复' : `${c.replies.length}条回复`}
            </button>
            {expandedReplies.has(c.id) && (
              <div className="mt-2 space-y-3 pt-2 border-l-2 border-[#FB7299]/20">
                {c.replies.map(r => renderComment(r, true))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mt-6 bg-white rounded-xl p-5 shadow-sm">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-gray-800">
          评论 <span className="text-[#FB7299]">({total})</span>
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => setSort('hot')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors ${sort === 'hot' ? 'bg-[#FB7299] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            <Flame className="w-3.5 h-3.5" /> 最热
          </button>
          <button onClick={() => setSort('time')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-colors ${sort === 'time' ? 'bg-[#FB7299] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            <Clock className="w-3.5 h-3.5" /> 最新
          </button>
        </div>
      </div>

      {/* 评论输入框 */}
      {currentUser ? (
        <div className="flex gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 rounded-full flex-shrink-0 bg-gray-300 flex items-center justify-center text-white text-sm font-bold">
            {String(currentUser.username || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
              }}
              placeholder="发一条友善的评论吧..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#FB7299] resize-none"
              rows={2}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">{inputText.length}/500</span>
              <button onClick={handleSubmit} disabled={!inputText.trim()}
                className="px-4 py-1.5 bg-[#FB7299] text-white text-sm rounded-lg hover:bg-[#e86185] disabled:bg-gray-300 transition-colors">
                发表评论
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-6 bg-gray-50 rounded-xl text-center">
          <p className="text-sm text-gray-400">请<Link to="/login" className="text-[#FB7299]">登录</Link>后发表评论</p>
        </div>
      )}

      {/* 评论列表 */}
      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-[#FB7299] border-t-transparent rounded-full" /></div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">还没有评论，快来抢沙发吧~</p>
        </div>
      ) : (
        <div className="space-y-5">
          {comments.map(c => renderComment(c))}
        </div>
      )}
    </div>
  );
};
