import { Route, Navigate } from "react-router-dom"
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
import { useStore } from "@/store/index"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useStore((state) => state.currentUser)
  if (!currentUser) return <Navigate to="/login/user" replace />
  return <>{children}</>
}

// 分类页快捷包装
const AnimePage = () => <CategoryPage category="anime" />
const LiveListPage = () => <CategoryPage category="live" />
const GamePage = () => <CategoryPage category="game" />
const ComicPage = () => <CategoryPage category="comic" />
const EsportsPage = () => <CategoryPage category="esports" />
const GaokaoPage = () => <CategoryPage category="gaokao" />
const ColumnsPage = () => <CategoryPage category="columns" />
const EventsPage = () => <CategoryPage category="events" />
const CommunityPage = () => <CategoryPage category="community" />
const ClassroomPage = () => <CategoryPage category="classroom" />
const MusicPage = () => <CategoryPage category="music" />
// 新增分区
const GuoChuangPage = () => <CategoryPage category="guochuang" />
const DancePage = () => <CategoryPage category="dance" />
const KnowledgePage = () => <CategoryPage category="knowledge" />
const TechPage = () => <CategoryPage category="tech" />
const SportsPage = () => <CategoryPage category="sports" />
const CarPage = () => <CategoryPage category="car" />
const LifePage = () => <CategoryPage category="life" />
const FoodPage = () => <CategoryPage category="food" />
const AnimalPage = () => <CategoryPage category="animal" />
const KichikuPage = () => <CategoryPage category="kichiku" />
const FashionPage = () => <CategoryPage category="fashion" />
const EntertainmentPage = () => <CategoryPage category="entertainment" />
const MoviePage = () => <CategoryPage category="movie" />
const DocumentaryPage = () => <CategoryPage category="documentary" />

export const routes = (
  <>
    <Route path="/" element={<HomePage />} />
    <Route path="/video/:id" element={<VideoDetail />} />
    <Route path="/login/user" element={<UserLogin />} />
    <Route path="/register/user" element={<UserRegister />} />
    <Route path="/user/:username" element={<UserProfile />} />
    <Route path="/creation" element={<ProtectedRoute><CreationCenter /></ProtectedRoute>} />
    <Route path="/messages/:username" element={<Messages />} />
    <Route path="/messages" element={<Messages />} />
    <Route path="/feed" element={<Feed />} />
    <Route path="/search" element={<SearchResults />} />
    <Route path="/live/:id" element={<LiveRoom />} />
    {/* 导航页 */}
    <Route path="/anime" element={<AnimePage />} />
    <Route path="/live" element={<LiveListPage />} />
    <Route path="/game" element={<GamePage />} />
    <Route path="/vip" element={<VipPage />} />
    <Route path="/comic" element={<ComicPage />} />
    <Route path="/esports" element={<EsportsPage />} />
    <Route path="/gaokao" element={<GaokaoPage />} />
    <Route path="/columns" element={<ColumnsPage />} />
    <Route path="/events" element={<EventsPage />} />
    <Route path="/community" element={<CommunityPage />} />
    <Route path="/classroom" element={<ClassroomPage />} />
    <Route path="/music" element={<MusicPage />} />
    {/* 新增B站分区 */}
    <Route path="/guochuang" element={<GuoChuangPage />} />
    <Route path="/dance" element={<DancePage />} />
    <Route path="/knowledge" element={<KnowledgePage />} />
    <Route path="/tech" element={<TechPage />} />
    <Route path="/sports" element={<SportsPage />} />
    <Route path="/car" element={<CarPage />} />
    <Route path="/life" element={<LifePage />} />
    <Route path="/food" element={<FoodPage />} />
    <Route path="/animal" element={<AnimalPage />} />
    <Route path="/kichiku" element={<KichikuPage />} />
    <Route path="/fashion" element={<FashionPage />} />
    <Route path="/entertainment" element={<EntertainmentPage />} />
    <Route path="/movie" element={<MoviePage />} />
    <Route path="/documentary" element={<DocumentaryPage />} />
    {/* 用户 */}
    <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
    <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
    {/* 管理后台 (5174) */}
    <Route path="/login/admin" element={<AdminLogin />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/admin/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
    <Route path="/admin/moderation" element={<ProtectedRoute><Moderation /></ProtectedRoute>} />
  </>
)
