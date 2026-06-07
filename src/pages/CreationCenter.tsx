import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/index';
import { Search, Bell, Video, Edit, ChartBar, MessageSquare, Star, Folder, Upload, Eye, ThumbsUp, Calendar, TrendingUp, Users, Clock, CheckCircle2, XCircle, AlertCircle, ChevronDown, Plus, Settings, HelpCircle } from 'lucide-react';

export default function CreationCenter() {
  const currentUser = useStore((state) => state.currentUser);
  const contents = useStore((state) => state.contents);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Mock统计数据
  const stats = {
    totalViews: '125.6万',
    totalLikes: '8.3万',
    totalFans: '1.2万',
    todayViews: '+2,345',
  };

  // 最近作品
  const recentWorks = [
    { id: 1, title: '【教程】React 18 新特性详解', views: '12.3万', likes: '8,234', status: 'approved', time: '2024-06-01' },
    { id: 2, title: 'Python入门教程第一期', views: '8.7万', likes: '5,123', status: 'pending', time: '2024-06-02' },
    { id: 3, title: '2024年必看番剧推荐', views: '15.6万', likes: '9,876', status: 'approved', time: '2024-06-03' },
    { id: 4, title: '美食制作：红烧肉教程', views: '6.2万', likes: '3,456', status: 'rejected', time: '2024-06-04' },
  ];

  const tabs = [
    { id: 'overview', label: '数据概览', icon: ChartBar },
    { id: 'works', label: '作品管理', icon: Video },
    { id: 'submissions', label: '投稿管理', icon: Upload },
    { id: 'messages', label: '消息中心', icon: MessageSquare },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
            <CheckCircle2 className="w-3 h-3" /> 已通过
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs">
            <Clock className="w-3 h-3" /> 审核中
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs">
            <XCircle className="w-3 h-3" /> 未通过
          </span>
        );
      default:
        return null;
    }
  };

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
                <span className="font-bold text-gray-800">哔哩哔哩创作中心</span>
              </Link>
              <nav className="flex items-center gap-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 text-sm transition-colors ${
                      activeTab === tab.id ? 'text-pink-500' : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              {currentUser ? (
                <>
                  <button className="relative">
                    <Bell className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <img src={currentUser?.username ? `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop` : ''} alt="" className="w-8 h-8 rounded-full" />
                    <span className="text-sm text-gray-700">{currentUser.username}</span>
                  </div>
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

      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* 快捷入口 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg"
          >
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-semibold">上传视频</p>
              <p className="text-xs opacity-80">发布你的作品</p>
            </div>
          </button>
          
          <Link to="/editor" className="flex items-center gap-4 p-4 bg-white rounded-xl hover:shadow-md transition-all">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Edit className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800">内容编辑</p>
              <p className="text-xs text-gray-500">编辑草稿内容</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Folder className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800">素材库</p>
              <p className="text-xs text-gray-500">管理你的素材</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-white rounded-xl">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800">设置</p>
              <p className="text-xs text-gray-500">账号设置</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧主内容区 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 数据概览 */}
            {activeTab === 'overview' && (
              <>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">数据概览</h2>
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-1">
                      <option>近7天</option>
                      <option>近30天</option>
                      <option>近90天</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
                      <div className="flex items-center gap-2 text-pink-600 mb-2">
                        <Eye className="w-5 h-5" />
                        <span className="text-sm">总播放</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{stats.totalViews}</p>
                      <p className="text-xs text-green-600 mt-1">{stats.todayViews} 今日</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <div className="flex items-center gap-2 text-blue-600 mb-2">
                        <ThumbsUp className="w-5 h-5" />
                        <span className="text-sm">总点赞</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{stats.totalLikes}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <Users className="w-5 h-5" />
                        <span className="text-sm">粉丝数</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{stats.totalFans}</p>
                      <p className="text-xs text-green-600 mt-1">+128 本周</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                      <div className="flex items-center gap-2 text-purple-600 mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-sm">互动率</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">6.8%</p>
                      <p className="text-xs text-green-600 mt-1">+0.5%</p>
                    </div>
                  </div>
                </div>

                {/* 趋势图placeholder */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">播放趋势</h2>
                  <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <ChartBar className="w-12 h-12 mx-auto mb-2" />
                      <p>近7天播放趋势图</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* 作品管理 */}
            {activeTab === 'works' && (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">我的作品</h2>
                  <div className="flex items-center gap-2">
                    <select className="text-sm border border-gray-200 rounded-lg px-3 py-1">
                      <option>全部</option>
                      <option>视频</option>
                      <option>专栏</option>
                      <option>音频</option>
                    </select>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Search className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="divide-y">
                  {recentWorks.map((work) => (
                    <div key={work.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                      <div className="w-32 h-18 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={`https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200&h=120&fit=crop`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 truncate">{work.title}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {work.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3" /> {work.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {work.time}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(work.status)}
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 投稿管理 */}
            {activeTab === 'submissions' && (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">投稿管理</h2>
                  <button 
                    onClick={() => setUploadModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                  >
                    <Upload className="w-4 h-4" />
                    专栏投稿
                  </button>
                </div>
                <div className="p-8 text-center text-gray-500">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无投稿记录</p>
                  <button 
                    onClick={() => setUploadModalOpen(true)}
                    className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600"
                  >
                    发布你的第一个作品
                  </button>
                </div>
              </div>
            )}

            {/* 消息中心 */}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 border-b">
                  <h2 className="font-semibold text-gray-800">消息中心</h2>
                </div>
                <div className="divide-y">
                  {[
                    { type: 'comment', title: '收到新评论', content: '用户"动漫爱好者"评论了你的视频', time: '2小时前', unread: true },
                    { type: 'like', title: '收到新点赞', content: '你的视频获得500个赞', time: '5小时前', unread: true },
                    { type: 'system', title: '系统通知', content: '你的视频审核已通过', time: '1天前', unread: false },
                  ].map((msg, idx) => (
                    <div key={idx} className={`p-4 flex items-start gap-3 ${msg.unread ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        msg.type === 'comment' ? 'bg-green-100 text-green-600' :
                        msg.type === 'like' ? 'bg-pink-100 text-pink-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {msg.type === 'comment' ? <MessageSquare className="w-5 h-5" /> :
                         msg.type === 'like' ? <ThumbsUp className="w-5 h-5" /> :
                         <AlertCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800">{msg.title}</p>
                          <span className="text-xs text-gray-500">{msg.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{msg.content}</p>
                      </div>
                      {msg.unread && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 右侧边栏 */}
          <div className="space-y-6">
            {/* 创作激励 */}
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-5 text-white">
              <h3 className="font-semibold mb-3">创作激励计划</h3>
              <p className="text-sm opacity-90 mb-4">加入创作激励，获得更多收益和曝光机会</p>
              <button className="w-full bg-white text-pink-600 py-2 rounded-lg font-medium hover:bg-pink-50 transition-colors">
                了解更多
              </button>
            </div>

            {/* 成长数据 */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">成长数据</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">创作者等级</span>
                  <span className="text-sm font-medium text-pink-500">Lv.3</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs text-gray-500 text-right">还需 3500 成长值升级</p>
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-800">68</p>
                    <p className="text-xs text-gray-500">作品数</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">1.2万</p>
                    <p className="text-xs text-gray-500">粉丝数</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 帮助 */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">帮助与建议</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                  <HelpCircle className="w-4 h-4" />
                  创作指南
                </button>
                <button className="w-full flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  常见问题
                </button>
                <button className="w-full flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                  联系客服
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 上传弹窗 */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">上传视频</h2>
              <button onClick={() => setUploadModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-2">拖拽视频文件到此处，或</p>
              <button className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600">
                选择文件
              </button>
              <p className="text-xs text-gray-400 mt-4">支持 MP4、AVI、MOV 格式，最大 2GB</p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setUploadModalOpen(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
