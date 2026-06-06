import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Home, CheckSquare, Users, BarChart3, LogOut, LayoutDashboard } from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useStore();

  const handleLogout = () => {
    logout();
    navigate('/login/user');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: '数据概览' },
    { path: '/moderation', icon: CheckSquare, label: '内容审核' },
    { path: '/accounts', icon: Users, label: '用户管理' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-800">Bilibili 管理</h1>
              <p className="text-xs text-slate-500">{currentUser?.role === 'admin' ? '超级管理员' : currentUser?.role === 'moderator' ? '审核专员' : '普通用户'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <div className="mb-4 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm font-medium text-slate-700">{currentUser?.username}</p>
            <p className="text-xs text-slate-500">{currentUser?.role === 'admin' ? '超级管理员' : currentUser?.role === 'moderator' ? '审核专员' : '普通用户'}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
