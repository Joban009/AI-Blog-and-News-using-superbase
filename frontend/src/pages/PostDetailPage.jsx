import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { postsApi, commentsApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow, format } from 'date-fns';
import toast from 'react-hot-toast';
import { Eye, Calendar, Sparkles, Trash2, CheckCircle, XCircle, Send, ArrowLeft, MessageCircle } from 'lucide-react';

export default function PostDetailPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const { user, profile } = useAuthStore();

  const [post,     setPost]     = useState(null);
  const [comments, setComments] = useState([]);
  const [body,     setBody]     = useState('');
  const [loading,  setLoading]  = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await postsApi.get(slug);
        setPost(data.post);
        const { data: cd } = await commentsApi.list(data.post.id);
        setComments(cd.comments || []);
      } catch { navigate('/'); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  async function submitComment(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await commentsApi.create({ post_id: post.id, content: body.trim() });
      toast.success('Comment submitted — awaiting approval.');
      setBody('');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  }

  async function handleApprove(id) {
    await commentsApi.approve(id);
    setComments(cs => cs.map(c => c.id === id ? { ...c, status: 'approved' } : c));
    toast.success('Comment approved');
  }

  async function handleReject(id) {
    await commentsApi.reject(id);
    setComments(cs => cs.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
    toast.success('Comment rejected');
  }

  async function handleDelete(id) {
    if (!confirm('Delete this comment?')) return;
    await commentsApi.delete(id);
    setComments(cs => cs.filter(c => c.id !== id));
    toast.success('Deleted');
  }

  if (loading) return <Skeleton />;
  if (!post)   return null;

  const isAdmin = profile?.role === 'admin';
  const author  = post.profiles?.username || 'Unknown';
  const tags    = post.post_tags?.map(pt => pt.tags) || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-8 -ml-2 text-sm text-ink-500">
        <ArrowLeft size={16}/> Back
      </button>

      {post.status !== 'published' && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-sans text-sm">
          This post is <strong>{post.status}</strong>
          {post.rejection_reason && <> — {post.rejection_reason}</>}
        </div>
      )}

      {post.cover_image_url && (
        <div className="rounded-2xl overflow-hidden mb-8 aspect-[16/7]">
          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover"/>
        </div>
      )}

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <span className={`badge ${post.type === 'news' ? 'badge-amber' : 'badge-gray'}`}>{post.type}</span>
        {post.categories?.name && <span className="badge badge-gray">{post.categories.name}</span>}
        {post.is_ai_generated && <span className="badge badge-green"><Sparkles size={10} className="mr-0.5"/>AI</span>}
      </div>

      <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink-900 leading-tight mb-6">{post.title}</h1>

      <div className="flex items-center gap-4 pb-6 mb-8 border-b border-ink-100">
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-serif font-bold">
          {author[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-sans font-medium text-ink-900 text-sm">{author}</p>
          <div className="flex items-center gap-3 text-xs text-ink-400 font-sans mt-0.5">
            <span className="flex items-center gap-1"><Calendar size={11}/>{format(new Date(post.published_at || post.created_at), 'MMM d, yyyy')}</span>
            <span className="flex items-center gap-1"><Eye size={11}/>{post.views} views</span>
          </div>
        </div>
      </div>

      <div className="prose-content mb-12" dangerouslySetInnerHTML={{ __html: post.content }}/>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-12">
          {tags.map(t => t && <span key={t.slug} className="badge badge-gray">#{t.name}</span>)}
        </div>
      )}

      {/* Comments */}
      <section>
        <h2 className="font-serif text-2xl font-bold text-ink-900 mb-6 flex items-center gap-2">
          <MessageCircle size={22}/>Comments
          <span className="text-ink-400 font-sans text-base font-normal">
            ({comments.filter(c => c.status === 'approved').length})
          </span>
        </h2>

        <div className="space-y-4 mb-8">
          {comments.length === 0 && (
            <p className="text-ink-400 font-sans text-sm py-6 text-center">No comments yet. Be the first!</p>
          )}
          {comments.map(c => (
            <div key={c.id} className={`card p-4 ${c.status==='pending' ? 'border-amber-200 bg-amber-50' : ''} ${c.status==='rejected' ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="w-7 h-7 rounded-full bg-ink-100 flex items-center justify-center text-xs font-serif font-bold text-ink-600">
                    {c.profiles?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="font-sans text-sm font-medium text-ink-900">{c.profiles?.username}</span>
                  <span className="text-xs text-ink-400 font-sans">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                  {c.status !== 'approved' && (
                    <span className={`badge ${c.status==='pending' ? 'badge-amber' : 'badge-red'}`}>{c.status}</span>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex gap-1 shrink-0">
                    {c.status === 'pending' && <>
                      <button onClick={() => handleApprove(c.id)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"><CheckCircle size={16}/></button>
                      <button onClick={() => handleReject(c.id)}  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><XCircle size={16}/></button>
                    </>}
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={15}/></button>
                  </div>
                )}
              </div>
              <p className="font-sans text-sm text-ink-800 leading-relaxed pl-9">{c.content}</p>
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={submitComment} className="card p-5">
            <h3 className="font-sans font-medium text-ink-900 text-sm mb-3">Leave a comment</h3>
            <textarea className="input resize-none mb-3" rows={4} placeholder="Share your thoughts…"
              value={body} onChange={e => setBody(e.target.value)} required/>
            <button type="submit" className="btn-primary" disabled={submitting}>
              <Send size={15}/>{submitting ? 'Submitting…' : 'Submit Comment'}
            </button>
            <p className="text-xs text-ink-400 font-sans mt-2">Comments are reviewed before publishing.</p>
          </form>
        ) : (
          <div className="card p-6 text-center">
            <p className="font-sans text-sm text-ink-600 mb-3">Sign in to leave a comment.</p>
            <Link to="/login" className="btn-primary">Sign in</Link>
          </div>
        )}
      </section>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse space-y-4">
      <div className="h-8 bg-ink-100 rounded w-2/3"/>
      <div className="h-72 bg-ink-100 rounded-2xl"/>
      {[...Array(5)].map((_,i) => <div key={i} className="h-4 bg-ink-100 rounded"/>)}
    </div>
  );
}
