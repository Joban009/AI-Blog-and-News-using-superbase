import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RichTextEditor from '../ui/RichTextEditor';
import AIGenerator from './AIGenerator';
import { postsApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Save, Send } from 'lucide-react';

const CATEGORIES = ['Technology','News','Science','Business','Health','World'];

export default function PostForm({ initialData, postId, isEdit = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', cover_image_url: '',
    type: 'blog', tags: '', category_id: '',
    ...initialData,
  });
  const [saving,     setSaving]     = useState(false);
  const [publishing, setPublishing] = useState(false);

  const set = field => e => setForm(f => ({ ...f, [field]: e?.target?.value ?? e }));

  function handleAIGenerated(g) {
    setForm(f => ({ ...f, title: g.title || f.title, excerpt: g.excerpt || f.excerpt, content: g.content || f.content }));
  }

  async function save(publish = false) {
    if (!form.title.trim())                          { toast.error('Title required'); return; }
    if (!form.content || form.content === '<p></p>') { toast.error('Content required'); return; }

    const setter = publish ? setPublishing : setSaving;
    setter(true);
    try {
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const payload = { ...form, tags };

      if (isEdit) {
        await postsApi.update(postId, payload);
        if (publish) await postsApi.publish(postId);
        toast.success(publish ? 'Post published!' : 'Draft saved');
      } else {
        await postsApi.create(payload);
        toast.success(publish ? 'Created — set to published in Posts list' : 'Draft saved');
      }
      navigate('/admin/posts');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); setPublishing(false); }
  }

  return (
    <div className="max-w-4xl space-y-5">
      <AIGenerator onGenerated={handleAIGenerated} />

      {/* Type */}
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
        <input className="input text-lg font-serif" placeholder="Post title" value={form.title} onChange={set('title')} required/>
      </div>

      <div>
        <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Excerpt</label>
        <textarea className="input resize-none" rows={2} placeholder="Short description"
          value={form.excerpt} onChange={set('excerpt')}/>
      </div>

      <div>
        <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Cover Image URL</label>
        <input className="input" type="url" placeholder="https://..." value={form.cover_image_url} onChange={set('cover_image_url')}/>
        {form.cover_image_url && (
          <div className="mt-2 h-32 rounded-xl overflow-hidden bg-ink-50">
            <img src={form.cover_image_url} alt="" className="h-full w-full object-cover"/>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Category</label>
          <select className="input" value={form.category_id} onChange={set('category_id')}>
            <option value="">— None —</option>
            {CATEGORIES.map((c,i) => <option key={c} value={i+1}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Tags (comma separated)</label>
          <input className="input" placeholder="ai, tech, news" value={form.tags} onChange={set('tags')}/>
        </div>
      </div>

      <div>
        <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Content *</label>
        <RichTextEditor content={form.content} onChange={set('content')}/>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-ink-100">
        <button type="button" onClick={() => navigate('/admin/posts')} className="btn-outline">Cancel</button>
        <button type="button" onClick={() => save(false)} disabled={saving} className="btn-outline">
          <Save size={15}/>{saving ? 'Saving…' : 'Save Draft'}
        </button>
        <button type="button" onClick={() => save(true)} disabled={publishing} className="btn-amber">
          <Send size={15}/>{publishing ? 'Publishing…' : 'Save & Publish'}
        </button>
      </div>
    </div>
  );
}
