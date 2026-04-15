import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, FileText, MessageSquare, Users, LogOut, PenSquare, ExternalLink } from 'lucide-react';

const nav = [
  { to: '/admin',          label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/posts',    label: 'Posts',     icon: FileText },
  { to: '/admin/comments', label: 'Comments',  icon: MessageSquare },
  { to: '/admin/users',    label: 'Users',     icon: Users },
];

export default function AdminLayout() {
  const { user, profile, logout } = useAuthStore();

  const lnk = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium font-sans transition-colors
     ${isActive ? 'bg-amber-50 text-amber-700' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'}`;

  return (
    <div className="min-h-screen flex bg-ink-50">
      <aside className="w-60 shrink-0 bg-white border-r border-ink-100 flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-ink-100 gap-2">
          <Link to="/" className="font-serif text-lg font-bold text-ink-900">AI<span className="text-amber-500">News</span>Blog</Link>
          <span className="badge badge-amber text-[10px]">Admin</span>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={lnk}>
              <Icon size={17} />{label}
            </NavLink>
          ))}
          <div className="mt-2 pt-2 border-t border-ink-100">
            <NavLink to="/admin/posts/new" className={lnk}><PenSquare size={17} />New Post</NavLink>
            <Link to="/" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium font-sans text-ink-600 hover:bg-ink-50 transition-colors">
              <ExternalLink size={17} />View Site
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-ink-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-serif font-bold text-sm">
              {profile?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-900 truncate">{profile?.username}</p>
              <p className="text-xs text-ink-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-sans text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={16} />Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <main className="p-6 page-enter"><Outlet /></main>
      </div>
    </div>
  );
}
