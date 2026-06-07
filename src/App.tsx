import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { useStore } from "@/store/index"
import { api } from "@/api/client"
import HomePage from "@/pages/HomePage"
import VideoDetail from "@/pages/VideoDetail"
import UserLogin from "@/pages/UserLogin"
import UserRegister from "@/pages/UserRegister"
import UserProfile from "@/pages/UserProfile"
import CreationCenter from "@/pages/CreationCenter"
import Messages from "@/pages/Messages"
import Feed from "@/pages/Feed"
import SearchResults from "@/pages/SearchResults"
import LiveRoom from "@/pages/LiveRoom"
import CategoryPage from "@/pages/CategoryPage"
import VipPage from "@/pages/VipPage"
import HistoryPage from "@/pages/HistoryPage"
import FavoritesPage from "@/pages/FavoritesPage"
import AdminLogin from "@/pages/AdminLogin"
import Dashboard from "@/pages/Dashboard"
import Accounts from "@/pages/Accounts"
import Moderation from "@/pages/Moderation"
import RelationshipPage from "@/pages/RelationshipPage"
import SuperAdmin from "@/pages/SuperAdmin"
import AccountCenter from "@/pages/AccountCenter"
import DataManage from "@/pages/DataManage"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/login/user" replace />
  return <>{children}</>
}

function App() {
  const port = window.location.port
  const isAdminPort = port >= '5174'
  const setCurrentUser = useStore((s) => s.setCurrentUser)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const token = sessionStorage.getItem('bilibili-token') || localStorage.getItem('bilibili-token')
    if (!token) { setAuthLoading(false); return }
    api.getMe().then(res => {
      if (res.success) setCurrentUser({ id: res.user.id, username: res.user.username, role: res.user.role, avatar: res.user.avatar, nickname: res.user.nickname })
      setAuthLoading(false)
    }).catch(() => setAuthLoading(false))
  }, [])

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-[#FB7299] border-t-transparent rounded-full" /></div>

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAdminPort ? <Navigate to="/login/admin" replace /> : <HomePage />} />
        <Route path="/video/:id" element={<VideoDetail />} />
        <Route path="/login/user" element={<UserLogin />} />
        <Route path="/register/user" element={<UserRegister />} />
        <Route path="/user/:username" element={<UserProfile />} />
        <Route path="/user/:username/following" element={<RelationshipPage />} />
        <Route path="/user/:username/followers" element={<RelationshipPage />} />
        <Route path="/creation" element={<ProtectedRoute><CreationCenter /></ProtectedRoute>} />
        <Route path="/messages/:username" element={<Messages />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/live/:id" element={<LiveRoom />} />
        <Route path="/anime" element={<CategoryPage category="anime" />} />
        <Route path="/live" element={<CategoryPage category="live" />} />
        <Route path="/game" element={<CategoryPage category="game" />} />
        <Route path="/vip" element={<VipPage />} />
        <Route path="/comic" element={<CategoryPage category="comic" />} />
        <Route path="/esports" element={<CategoryPage category="esports" />} />
        <Route path="/gaokao" element={<CategoryPage category="gaokao" />} />
        <Route path="/columns" element={<CategoryPage category="columns" />} />
        <Route path="/events" element={<CategoryPage category="events" />} />
        <Route path="/community" element={<CategoryPage category="community" />} />
        <Route path="/classroom" element={<CategoryPage category="classroom" />} />
        <Route path="/music" element={<CategoryPage category="music" />} />
        <Route path="/guochuang" element={<CategoryPage category="guochuang" />} />
        <Route path="/dance" element={<CategoryPage category="dance" />} />
        <Route path="/knowledge" element={<CategoryPage category="knowledge" />} />
        <Route path="/tech" element={<CategoryPage category="tech" />} />
        <Route path="/sports" element={<CategoryPage category="sports" />} />
        <Route path="/car" element={<CategoryPage category="car" />} />
        <Route path="/life" element={<CategoryPage category="life" />} />
        <Route path="/food" element={<CategoryPage category="food" />} />
        <Route path="/animal" element={<CategoryPage category="animal" />} />
        <Route path="/kichiku" element={<CategoryPage category="kichiku" />} />
        <Route path="/fashion" element={<CategoryPage category="fashion" />} />
        <Route path="/entertainment" element={<CategoryPage category="entertainment" />} />
        <Route path="/movie" element={<CategoryPage category="movie" />} />
        <Route path="/documentary" element={<CategoryPage category="documentary" />} />
        <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
        <Route path="/login/admin" element={isAdminPort ? <AdminLogin /> : <Navigate to="/" replace />} />
        <Route path="/dashboard" element={isAdminPort ? <ProtectedRoute><Dashboard /></ProtectedRoute> : <Navigate to="/" replace />} />
        <Route path="/admin/super" element={<SuperAdmin />} />
        <Route path="/account/home" element={<AccountCenter />} />
        <Route path="/admin/accounts" element={isAdminPort ? <ProtectedRoute><Accounts /></ProtectedRoute> : <Navigate to="/" replace />} />
        <Route path="/admin/moderation" element={isAdminPort ? <ProtectedRoute><Moderation /></ProtectedRoute> : <Navigate to="/" replace />} />
        <Route path="/dashboard/Datamanage" element={isAdminPort ? <ProtectedRoute><DataManage /></ProtectedRoute> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
export default App
