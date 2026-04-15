import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import MainLayout  from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

import HomePage       from './pages/HomePage';
import BlogListPage   from './pages/BlogListPage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import SubmitPostPage from './pages/SubmitPostPage';

import AdminDashboard  from './pages/admin/AdminDashboard';
import AdminPosts      from './pages/admin/AdminPosts';
import AdminComments   from './pages/admin/AdminComments';
import AdminUsers      from './pages/admin/AdminUsers';
import AdminCreatePost from './pages/admin/AdminCreatePost';
import AdminEditPost   from './pages/admin/AdminEditPost';

function RequireAuth({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const { user, profile, loading } = useAuthStore();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (profile?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const init = useAuthStore(s => s.init);
  useEffect(() => { init(); }, []);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index                element={<HomePage />} />
        <Route path="blog"          element={<BlogListPage type="blog" />} />
        <Route path="news"          element={<BlogListPage type="news" />} />
        <Route path="posts/:slug"   element={<PostDetailPage />} />
        <Route path="login"         element={<LoginPage />} />
        <Route path="register"      element={<RegisterPage />} />
        <Route path="submit"        element={<RequireAuth><SubmitPostPage /></RequireAuth>} />
      </Route>

      <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index                   element={<AdminDashboard />} />
        <Route path="posts"            element={<AdminPosts />} />
        <Route path="posts/new"        element={<AdminCreatePost />} />
        <Route path="posts/:id/edit"   element={<AdminEditPost />} />
        <Route path="comments"         element={<AdminComments />} />
        <Route path="users"            element={<AdminUsers />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
