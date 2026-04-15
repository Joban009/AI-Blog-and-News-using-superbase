import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { PenLine, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function MainLayout() {
  const { user, profile, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const nl = ({ isActive }) =>
    `font-sans text-sm font-medium transition-colors ${isActive ? 'text-amber-600' : 'text-ink-600 hover:text-ink-900'}`;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-bold text-ink-900">
            AI<span className="text-amber-500">News</span>Blog
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/"    end className={nl}>Home</NavLink>
            <NavLink to="/blog"    className={nl}>Blog</NavLink>
            <NavLink to="/news"    className={nl}>News</NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {profile?.role === 'admin' && (
                  <button onClick={() => navigate('/admin')} className="btn-ghost text-xs">
                    <LayoutDashboard size={15} /> Admin
                  </button>
                )}
                <button onClick={() => navigate('/submit')} className="btn-outline text-xs">
                  <PenLine size={15} /> Submit
                </button>
                <div className="flex items-center gap-2 pl-3 border-l border-ink-100">
                  <span className="text-sm text-ink-600 font-sans">{profile?.username}</span>
                  <button onClick={logout} className="btn-ghost text-xs text-red-500 hover:bg-red-50">
                    <LogOut size={15} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm">Get started</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-ink-50" onClick={() => setOpen(o => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-ink-100 bg-white px-4 py-4 flex flex-col gap-4">
            <NavLink to="/"    end className={nl} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/blog"    className={nl} onClick={() => setOpen(false)}>Blog</NavLink>
            <NavLink to="/news"    className={nl} onClick={() => setOpen(false)}>News</NavLink>
            {user ? (
              <>
                {profile?.role === 'admin' && <Link to="/admin" className="text-sm text-ink-600" onClick={() => setOpen(false)}>Admin</Link>}
                <Link to="/submit" className="text-sm text-ink-600" onClick={() => setOpen(false)}>Submit Post</Link>
                <button onClick={logout} className="text-sm text-red-500 text-left">Sign out</button>
              </>
            ) : (
              <>
                <Link to="/login"    className="text-sm text-ink-600" onClick={() => setOpen(false)}>Sign in</Link>
                <Link to="/register" className="btn-primary w-fit"    onClick={() => setOpen(false)}>Get started</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1"><div className="page-enter"><Outlet /></div></main>

      <footer className="border-t border-ink-100 bg-ink-50 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg font-bold text-ink-800">AI<span className="text-amber-500">News</span>Blog</span>
          <p className="text-sm text-ink-500 font-sans">© {new Date().getFullYear()} AI News Blog. Powered by Gemini AI.</p>
          <div className="flex gap-4 text-sm text-ink-500">
            <Link to="/blog" className="hover:text-ink-800 transition-colors">Blog</Link>
            <Link to="/news" className="hover:text-ink-800 transition-colors">News</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
