import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UserLogin from "@/features/user/pages/UserLogin";
import UserRegister from "@/features/user/pages/UserRegister";
import AdminLogin from "@/features/admin/pages/AdminLogin";
import Dashboard from "@/features/admin/pages/Dashboard";
import Moderation from "@/features/admin/pages/Moderation";
import Accounts from "@/features/admin/pages/Accounts";
import HomePage from "@/features/user/pages/HomePage";
import VideoDetail from "@/features/user/pages/VideoDetail";
import UserProfile from "@/features/user/pages/UserProfile";
import CreationCenter from "@/features/user/pages/CreationCenter";
import { useStore } from "@/store/useStore";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useStore((state) => state.currentUser);
  if (!currentUser) {
    return <Navigate to="/login/user" replace />;
  }
  return <>{children}</>;
}

function App() {
  // 根据端口确定默认页面
  const port = window.location.port;
  const isAdminPort = port === '5174';
  
  // 管理员端口直接显示登录页，用户端口显示首页
  const defaultPath = isAdminPort ? '/login/admin' : '/';

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/video/:id" element={<VideoDetail />} />
        <Route path="/login/user" element={<UserLogin />} />
        <Route path="/register/user" element={<UserRegister />} />
        <Route path="/login/admin" element={<AdminLogin />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/moderation" element={
          <ProtectedRoute>
            <Moderation />
          </ProtectedRoute>
        } />
        <Route path="/accounts" element={
          <ProtectedRoute>
            <Accounts />
          </ProtectedRoute>
        } />
        <Route path="/user/:username" element={<UserProfile />} />
        <Route path="/creation" element={
          <ProtectedRoute>
            <CreationCenter />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
