import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../services/api';
import RichTextEditor from '../components/ui/RichTextEditor';
import toast from 'react-hot-toast';
import { Send, Info } from 'lucide-react';

export default function SubmitPostPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', cover_image_url: '', type: 'blog', tags: '' });
  const [loading, setLoading] = useState(false);

  const set = f => e => setForm(prev => ({ ...prev, [f]: e?.target?.value ?? e }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.content || form.content === '<p></p>') { toast.error('Content cannot be empty'); return; }
    setLoading(true);
    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      await postsApi.create({ ...form, tags });
      toast.success('Post submitted! It will be published after admin review.');
      navigate('/');
    } catch (err) { toast.error(err.response?.data?.error || 'Submission failed'); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-ink-900 mb-2">Submit a Post</h1>
        <div className="flex items-start gap-2 bg-ink-50 border border-ink-200 rounded-xl p-4 text-sm text-ink-600 font-sans">
          <Info size={16} className="shrink-0 mt-0.5 text-amber-500"/>
          Your post will be reviewed by an admin before it appears on the site.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-3">
          {['blog','news'].map(t => (
            <label key={t} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer font-sans text-sm capitalize transition-colors
              ${form.type===t ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-ink-200 text-ink-600 hover:border-ink-300'}`}>
              <input type="radio" name="type" value={t} checked={form.type===t} onChange={set('type')} className="sr-only"/>
              {t}
            </label>
          ))}
        </div>

        <div>
          <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Title *</label>
          <input className="input text-lg font-serif" placeholder="Give your post a compelling title"
            value={form.title} onChange={set('title')} required/>
        </div>

        <div>
          <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Excerpt</label>
          <textarea className="input resize-none" rows={2} placeholder="A short description"
            value={form.excerpt} onChange={set('excerpt')}/>
        </div>

        <div>
          <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Cover Image URL</label>
          <input className="input" type="url" placeholder="https://..." value={form.cover_image_url} onChange={set('cover_image_url')}/>
        </div>

        <div>
          <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Content *</label>
          <RichTextEditor content={form.content} onChange={set('content')}/>
        </div>

        <div>
          <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Tags</label>
          <input className="input" placeholder="ai, technology, future (comma separated)"
            value={form.tags} onChange={set('tags')}/>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-outline">Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            <Send size={15}/>{loading ? 'Submitting…' : 'Submit for Review'}
          </button>
        </div>
      </form>
    </div>
  );
}
