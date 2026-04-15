import { useState } from 'react';
import { aiApi } from '../../services/api';
import toast from 'react-hot-toast';
import { Sparkles, Wand2, Loader2, ChevronDown } from 'lucide-react';

export default function AIGenerator({ onGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [type,   setType]   = useState('blog');
  const [tone,   setTone]   = useState('professional');
  const [length, setLength] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [open,   setOpen]   = useState(false);

  async function generate() {
    if (!prompt.trim()) { toast.error('Enter a topic'); return; }
    setLoading(true);
    try {
      const { data } = await aiApi.generate({ prompt, type, tone, length });
      onGenerated(data.generated);
      toast.success('Content generated! Review before publishing.');
      setOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI generation failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-100 transition-colors">
        <div className="flex items-center gap-2 text-amber-700 font-sans font-medium text-sm">
          <Sparkles size={16} />Generate with Gemini AI
        </div>
        <ChevronDown size={16} className={`text-amber-600 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-amber-200 pt-4 space-y-3">
          <div>
            <label className="block text-xs font-sans font-medium text-amber-800 mb-1.5">Topic / Prompt *</label>
            <textarea className="input text-sm resize-none" rows={3}
              placeholder="e.g. The future of renewable energy in Nepal"
              value={prompt} onChange={e => setPrompt(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['Type',['blog','news'],type,setType],['Tone',['professional','casual','journalistic','academic'],tone,setTone],['Length',['short','medium','long'],length,setLength]].map(([label,opts,val,setter]) => (
              <div key={label}>
                <label className="block text-xs font-sans font-medium text-amber-800 mb-1.5">{label}</label>
                <select className="input text-sm" value={val} onChange={e => setter(e.target.value)}>
                  {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button type="button" onClick={generate} disabled={loading} className="btn-amber w-full justify-center">
            {loading ? <><Loader2 size={15} className="animate-spin"/>Generating…</> : <><Wand2 size={15}/>Generate Content</>}
          </button>
          <p className="text-xs text-amber-700 font-sans opacity-80">AI content fills Title, Excerpt, and Content fields. Review carefully before publishing.</p>
        </div>
      )}
    </div>
  );
}
