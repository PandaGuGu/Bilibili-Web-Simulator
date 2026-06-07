import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import UserLogin from "@/features/user/pages/UserLogin";
import UserRegister from "@/features/user/pages/UserRegister";
import AdminLogin from "@/features/admin/pages/AdminLogin";
import AdminDashboard from "@/features/admin/pages/Dashboard";
import HomePage from "@/features/user/pages/HomePage";
import VideoDetail from "@/features/user/pages/VideoDetail";
import UserProfile from "@/features/user/pages/UserProfile";
import CreationCenter from "@/features/user/pages/CreationCenter";
import Messages from "@/features/user/pages/Messages";
import Feed from "@/features/user/pages/Feed";
import SearchResults from "@/features/user/pages/SearchResults";
import LiveRoom from "@/features/user/pages/LiveRoom";
import { useStore } from "@/store/useStore";
import { api } from "@/api/client";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useStore((state) => state.currentUser);
  if (!currentUser) {
    return <Navigate to="/login/user" replace />;
  }
  return <>{children}</>;
}

function App() {
  const port = window.location.port;
  const isAdminPort = port >= '5174' && port < '5180';
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const currentUser = useStore((s) => s.currentUser);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bilibili-token');
    if (!token) { setAuthLoading(false); return; }
    api.getMe().then(res => {
      if (res.success) {
        setCurrentUser({
          id: res.user.id,
          username: res.user.username,
          role: res.user.role,
          avatar: res.user.avatar,
          nickname: res.user.nickname,
        });
      }
      setAuthLoading(false);
    }).catch(() => setAuthLoading(false));
  }, []);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-6 h-6 border-2 border-[#FB7299] border-t-transparent rounded-full" /></div>

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          isAdminPort ? <Navigate to="/login/admin" replace /> : <HomePage />
        } />
        <Route path="/video/:id" element={<VideoDetail />} />
        <Route path="/login/user" element={<UserLogin />} />
        <Route path="/register/user" element={<UserRegister />} />
        <Route path="/login/admin" element={isAdminPort ? <AdminLogin /> : <Navigate to="/" replace />} />
        <Route path="/dashboard" element={
          isAdminPort ? (
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          ) : <Navigate to="/" replace />
        } />
        <Route path="/user/:username" element={<UserProfile />} />
        <Route path="/creation" element={
          <ProtectedRoute>
            <CreationCenter />
          </ProtectedRoute>
        } />
        <Route path="/messages/:username" element={<Messages />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/live/:id" element={<LiveRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
