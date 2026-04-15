import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { FileText, MessageSquare, Users, Clock, CheckCircle } from 'lucide-react';

function StatCard({ label, value, icon: Icon, color = 'amber', sub }) {
  const colors = { amber: 'bg-amber-50 text-amber-600', green: 'bg-green-50 text-green-600', blue: 'bg-blue-50 text-blue-600', red: 'bg-red-50 text-red-600' };
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="font-sans text-xs font-medium text-ink-500 uppercase tracking-wide">{label}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}><Icon size={16}/></div>
      </div>
      <p className="font-serif text-3xl font-bold text-ink-900">{value ?? '—'}</p>
      {sub && <p className="font-sans text-xs text-ink-400 mt-1">{sub}</p>}
    </div>
  );
}

const statusBadge = s => ({ published:'badge-green', pending:'badge-amber', draft:'badge-gray', rejected:'badge-red' }[s] || 'badge-gray');

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { adminApi.dashboard().then(r => setData(r.data)); }, []);

  if (!data) return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[...Array(6)].map((_,i) => <div key={i} className="h-28 bg-white rounded-2xl border border-ink-100"/>)}
    </div>
  );

  const { stats, recent_posts } = data;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink-900 mb-1">Dashboard</h1>
        <p className="font-sans text-sm text-ink-500">Overview of your AI News Blog</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Posts"      value={stats.total_posts}      icon={FileText}      color="blue"  sub={`${stats.published} published`}/>
        <StatCard label="Pending Posts"    value={stats.pending_posts}    icon={Clock}         color="amber" sub="Awaiting review"/>
        <StatCard label="Total Comments"   value={stats.total_comments}   icon={MessageSquare} color="blue"  sub={`${stats.pending_comments} pending`}/>
        <StatCard label="Pending Comments" value={stats.pending_comments} icon={Clock}         color="red"   sub="Need moderation"/>
        <StatCard label="Published"        value={stats.published}        icon={CheckCircle}   color="green"/>
        <StatCard label="Total Users"      value={stats.total_users}      icon={Users}         color="blue"/>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/admin/posts/new"                    className="btn-amber">+ New Post</Link>
        <Link to="/admin/posts?status=pending"         className="btn-outline">Review Posts ({stats.pending_posts})</Link>
        <Link to="/admin/comments?status=pending"      className="btn-outline">Review Comments ({stats.pending_comments})</Link>
      </div>

      <div className="card">
        <div className="px-5 py-4 border-b border-ink-100">
          <h2 className="font-sans font-semibold text-ink-900 text-sm">Recent Activity</h2>
        </div>
        <div className="divide-y divide-ink-100">
          {(recent_posts || []).map(p => (
            <div key={p.id} className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="font-sans text-sm font-medium text-ink-900 truncate">{p.title}</p>
                <p className="text-xs text-ink-400 font-sans mt-0.5">
                  by {p.profiles?.username} · {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`badge ${statusBadge(p.status)}`}>{p.status}</span>
                <span className="badge badge-gray capitalize">{p.type}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-ink-100">
          <Link to="/admin/posts" className="text-xs text-amber-600 hover:text-amber-700 font-sans font-medium">View all posts →</Link>
        </div>
      </div>
    </div>
  );
}
