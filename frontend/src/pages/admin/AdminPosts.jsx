import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi, postsApi } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { PenSquare, Trash2, CheckCircle, XCircle, Eye, Sparkles, Plus } from 'lucide-react';

const STATUSES = ['all','published','pending','draft','rejected'];
const statusBadge = s => ({ published:'badge-green', pending:'badge-amber', draft:'badge-gray', rejected:'badge-red' }[s]||'badge-gray');

export default function AdminPosts() {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get('status') || 'all';

  async function load() {
    setLoading(true);
    try {
      const params = activeStatus !== 'all' ? { status: activeStatus } : {};
      const { data } = await adminApi.listPosts(params);
      setPosts(data.posts || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [activeStatus]);

  async function handlePublish(id) {
    await postsApi.publish(id);
    toast.success('Post published');
    load();
  }

  async function handleReject(id) {
    const reason = prompt('Reason for rejection (optional):');
    await postsApi.reject(id, reason);
    toast.success('Post rejected');
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this post permanently?')) return;
    await postsApi.delete(id);
    toast.success('Post deleted');
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink-900">Posts</h1>
          <p className="font-sans text-sm text-ink-500 mt-0.5">{posts.length} posts</p>
        </div>
        <Link to="/admin/posts/new" className="btn-amber"><Plus size={16}/>New Post</Link>
      </div>

      <div className="flex gap-1 bg-ink-100 rounded-xl p-1 w-fit">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setSearchParams(s!=='all'?{status:s}:{})}
            className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium capitalize transition-colors
              ${activeStatus===s ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-ink-400 font-sans text-sm">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-ink-400 font-sans text-sm">No posts found.</div>
        ) : (
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-ink-100 text-xs text-ink-400 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Author</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Views</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3"/>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {posts.map(p => (
                <tr key={p.id} className="hover:bg-ink-50 transition-colors">
                  <td className="px-4 py-3 max-w-xs">
                    <div className="flex items-center gap-1.5">
                      {p.is_ai_generated && <Sparkles size={12} className="text-green-500 shrink-0"/>}
                      <span className="truncate font-medium text-ink-900">{p.title}</span>
                    </div>
                    {p.categories?.name && <span className="text-xs text-ink-400">{p.categories.name}</span>}
                  </td>
                  <td className="px-4 py-3 text-ink-600 whitespace-nowrap">{p.profiles?.username}</td>
                  <td className="px-4 py-3"><span className="badge badge-gray capitalize">{p.type}</span></td>
                  <td className="px-4 py-3"><span className={`badge ${statusBadge(p.status)}`}>{p.status}</span></td>
                  <td className="px-4 py-3 text-ink-500 whitespace-nowrap">
                    <span className="flex items-center gap-1"><Eye size={12}/>{p.views}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-400 whitespace-nowrap text-xs">
                    {formatDistanceToNow(new Date(p.created_at),{addSuffix:true})}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {(p.status==='pending'||p.status==='draft') && (
                        <button onClick={() => handlePublish(p.id)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors" title="Publish">
                          <CheckCircle size={15}/>
                        </button>
                      )}
                      {p.status==='pending' && (
                        <button onClick={() => handleReject(p.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Reject">
                          <XCircle size={15}/>
                        </button>
                      )}
                      <Link to={`/admin/posts/${p.id}/edit`} className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors">
                        <PenSquare size={15}/>
                      </Link>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
