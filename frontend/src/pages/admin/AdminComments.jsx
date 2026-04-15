import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { adminApi, commentsApi } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

const STATUSES = ['pending','approved','rejected','all'];
const statusBadge = s => ({ approved:'badge-green', pending:'badge-amber', rejected:'badge-red' }[s]||'badge-gray');

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeStatus = searchParams.get('status') || 'pending';

  async function load() {
    setLoading(true);
    try {
      const params = activeStatus !== 'all' ? { status: activeStatus } : {};
      const { data } = await adminApi.listComments(params);
      setComments(data.comments || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [activeStatus]);

  async function handle(action, id) {
    try {
      if (action==='approve') await commentsApi.approve(id);
      if (action==='reject')  await commentsApi.reject(id);
      if (action==='delete') {
        if (!confirm('Delete this comment?')) return;
        await commentsApi.delete(id);
      }
      toast.success(`Comment ${action}d`);
      load();
    } catch { toast.error('Action failed'); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink-900">Comments</h1>
        <p className="font-sans text-sm text-ink-500 mt-0.5">Moderate user comments</p>
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

      <div className="card divide-y divide-ink-100">
        {loading ? (
          <div className="p-8 text-center text-ink-400 font-sans text-sm">Loading…</div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center text-ink-400 font-sans text-sm">No comments found.</div>
        ) : comments.map(c => (
          <div key={c.id} className="p-4 flex gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-sans text-sm font-semibold text-ink-900">{c.profiles?.username}</span>
                <span className={`badge ${statusBadge(c.status)}`}>{c.status}</span>
                <span className="text-xs text-ink-400 font-sans">{formatDistanceToNow(new Date(c.created_at),{addSuffix:true})}</span>
              </div>
              <p className="font-sans text-sm text-ink-700 leading-relaxed mb-2">{c.content}</p>
              <Link to={`/posts/${c.posts?.slug}`} className="text-xs text-amber-600 hover:text-amber-700 font-sans">
                On: {c.posts?.title}
              </Link>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              {c.status==='pending' && <>
                <button onClick={() => handle('approve',c.id)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"><CheckCircle size={16}/></button>
                <button onClick={() => handle('reject', c.id)} className="p-1.5 rounded-lg text-red-500  hover:bg-red-50   transition-colors"><XCircle size={16}/></button>
              </>}
              <button onClick={() => handle('delete', c.id)} className="p-1.5 rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={15}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
