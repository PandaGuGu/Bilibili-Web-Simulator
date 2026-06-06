import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Search, Bell, Video, Grid, Image, Star, MessageSquare, Settings, Edit, CheckCircle2, User as UserIcon, ChevronDown, Play, ThumbsUp, Eye, Plus } from 'lucide-react';

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const currentUser = useStore((state) => state.currentUser);
  const users = useStore((state) => state.users);
  const contents = useStore((state) => state.contents);
  const comments = useStore((state) => state.comments);
  const [activeTab, setActiveTab] = useState('video');
  
  // 找到目标用户
  const profileUser = username 
    ? users.find(u => u.username === username) 
    : users[0];
  
  // 获取该用户的视频内容
  const userVideos = contents.filter(c => c.author === profileUser?.username && c.type === 'video' && c.status === 'approved');
  // 获取该用户的文章
  const userArticles = contents.filter(c => c.author === profileUser?.username && c.type === 'article' && c.status === 'approved');
  // 获取该用户的评论
  const userComments = comments.filter(c => c.author === profileUser?.username);

  const tabs = [
    { id: 'video', label: '视频', icon: Video, count: userVideos.length },
    { id: 'article', label: '专栏', icon: Edit, count: userArticles.length },
    { id: 'comment', label: '评论', icon: MessageSquare, count: userComments.length },
  ];

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#f1f2f3] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">用户不存在</h2>
          <Link to="/" className="text-pink-500 hover:text-pink-600">返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f2f3]">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="font-bold text-gray-800 hidden md:block">哔哩哔哩</span>
              </Link>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索视频、番剧、用户"
                  className="w-80 pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              {currentUser ? (
                <>
                  <Link to="/creation" className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-medium hover:bg-pink-600 transition-colors">
                    <Plus className="w-4 h-4" />
                    创作中心
                  </Link>
                  <button className="relative">
                    <Bell className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                  </button>
                  <Link to={`/user/${currentUser.username}`} className="flex items-center gap-2">
                    <img src={currentUser?.username ? users.find(u => u.username === currentUser.username)?.avatar : ''} alt="" className="w-8 h-8 rounded-full" />
                  </Link>
                </>
              ) : (
                <Link to="/login/user" className="px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-medium">
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 用户信息区域 */}
      <div className="bg-gradient-to-b from-pink-200 to-pink-100 h-48"></div>
      <div className="bg-white border-b">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-end gap-6 -mt-16 pb-4">
            <div className="relative">
              <img 
                src={profileUser?.avatar} 
                alt={profileUser?.username} 
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              />
              {profileUser?.status === 'active' && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{profileUser?.username}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <UserIcon className="w-4 h-4" />
                  UID: {profileUser?.id || 12345678}
                </span>
                <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded">Lv.6</span>
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded">正式会员</span>
              </div>
            </div>
            <div className="flex gap-3">
              {currentUser?.username === profileUser?.username ? (
                <>
                  <Link to="/creation" className="px-6 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition-colors">
                    编辑资料
                  </Link>
                  <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
                    设置
                  </button>
                </>
              ) : currentUser ? (
                <>
                  <button className="px-6 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition-colors">
                    + 关注
                  </button>
                  <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors">
                    发消息
                  </button>
                </>
              ) : (
                <Link to="/login/user" className="px-6 py-2 bg-pink-500 text-white rounded-full font-medium hover:bg-pink-600 transition-colors">
                  + 关注
                </Link>
              )}
            </div>
          </div>
          
          {/* 标签页 */}
          <div className="flex gap-8 mt-4 border-t">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-pink-500 text-pink-500' 
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                <span className="text-xs text-gray-400 ml-1">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {activeTab === 'video' && (
          <div className="space-y-6">
            {userVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userVideos.map((video) => (
                  <Link key={video.id} to={`/video/${video.id}`} className="group">
                    <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden">
                      <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.preview.split('').length > 20 ? '...' : ''}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-14 h-14 bg-black/50 rounded-full flex items-center justify-center">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <h3 className="mt-3 text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-pink-500">
                      {video.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {(video.views || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {(video.likes || 0).toLocaleString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Video className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>暂无视频内容</p>
                {currentUser?.username === profileUser?.username && (
                  <Link to="/creation" className="mt-4 inline-block px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600">
                    发布第一个视频
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'article' && (
          <div className="space-y-6">
            {userArticles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userArticles.map((article) => (
                  <Link key={article.id} to={`/video/${article.id}`} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-800 line-clamp-2 mb-2">{article.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-3 mb-2">{article.preview}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{article.submittedAt}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {(article.views || 0).toLocaleString()}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Edit className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>暂无专栏内容</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comment' && (
          <div className="space-y-4">
            {userComments.length > 0 ? (
              userComments.map((comment) => {
                const content = contents.find(c => c.id === comment.contentId);
                return (
                  <div key={comment.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-xs text-gray-500 mb-2">
                      评论于视频：<Link to={`/video/${comment.contentId}`} className="text-pink-500 hover:underline">{content?.title || '未知视频'}</Link>
                    </div>
                    <p className="text-gray-700 mb-3">{comment.text}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{comment.createdAt}</span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> {comment.likes}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>暂无评论记录</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
