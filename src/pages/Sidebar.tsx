import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/dashboard', label: '总览' },
  { path: '/admin/accounts', label: '用户管理' },
  { path: '/admin/moderation', label: '内容审核' },
]

export default function Sidebar({ children }: { children?: React.ReactNode }) {
  const location = useLocation()
  return (
    <div className="flex">
      <div className="w-48 bg-white border-r border-gray-200 min-h-screen p-4">
        <div className="text-sm font-bold text-gray-500 mb-4">管理后台</div>
        <nav className="space-y-1">
          {NAV_ITEMS.map(item => (
            <Link key={item.path} to={item.path}
              className={`block px-3 py-2 rounded text-sm ${location.pathname === item.path ? 'bg-[#FB7299]/10 text-[#FB7299] font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
