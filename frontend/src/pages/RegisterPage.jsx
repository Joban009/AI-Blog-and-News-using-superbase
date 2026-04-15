import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm]     = useState({ username: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-ink-900 mb-1">Create account</h1>
          <p className="font-sans text-sm text-ink-500">Join the AI News Blog community</p>
        </div>
        <div className="card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Username</label>
              <input type="text" className="input" placeholder="johndoe"
                value={form.username} onChange={e => setForm(f=>({...f,username:e.target.value}))}
                required minLength={3} maxLength={50} autoFocus/>
            </div>
            <div>
              <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Email</label>
              <input type="email" className="input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} required/>
            </div>
            <div>
              <label className="block text-xs font-sans font-medium text-ink-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw?'text':'password'} className="input pr-10" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} required minLength={6}/>
                <button type="button" onClick={()=>setShowPw(s=>!s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              <UserPlus size={16}/>{loading ? 'Creating…' : 'Create account'}
            </button>
          </form>
        </div>
        <p className="text-center font-sans text-sm text-ink-500 mt-6">
          Have an account? <Link to="/login" className="text-amber-600 hover:text-amber-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
