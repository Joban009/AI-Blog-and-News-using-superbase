import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../services/api';
import PostCard from '../components/blog/PostCard';
import { ArrowRight, Rss, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [blogs,   setBlogs]   = useState([]);
  const [news,    setNews]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      postsApi.list({ limit: 4, type: 'blog' }),
      postsApi.list({ limit: 5, type: 'news' }),
    ]).then(([b, n]) => {
      setBlogs(b.data.posts || []);
      setNews(n.data.posts  || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  return (
    <div>
      {/* Hero */}
      <section className="bg-ink-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-400 text-xs font-sans font-medium px-3 py-1.5 rounded-full mb-6">
            <Sparkles size={13} /> Powered by Gemini AI
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold leading-tight mb-5">
            Stories that <em className="text-amber-400 not-italic">inform</em><br />and inspire.
          </h1>
          <p className="font-sans text-ink-200 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Curated news and expert blogs — enhanced with AI to bring you richer, deeper content.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/blog" className="btn-amber">Browse Blog <ArrowRight size={16} /></Link>
            <Link to="/news" className="btn bg-white/10 text-white hover:bg-white/20 border border-white/20">
              <Rss size={16} /> Latest News
            </Link>
          </div>
        </div>
      </section>

      {/* Content grid */}
      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Featured blogs */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-ink-900">Featured Posts</h2>
            <Link to="/blog" className="text-sm text-amber-600 hover:text-amber-700 font-sans flex items-center gap-1">
              All posts <ArrowRight size={14} />
            </Link>
          </div>
          {blogs.length === 0 ? (
            <Empty label="No blog posts yet." />
          ) : (
            <div className="space-y-6">
              {blogs[0] && <PostCard post={blogs[0]} featured />}
              {blogs.length > 1 && (
                <div className="card divide-y divide-ink-100">
                  {blogs.slice(1).map(p => <PostCard key={p.id} post={p} />)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* News sidebar */}
        <aside>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-bold text-ink-900">Latest News</h2>
            <Link to="/news" className="text-sm text-amber-600 hover:text-amber-700 font-sans flex items-center gap-1">
              All <ArrowRight size={14} />
            </Link>
          </div>
          {news.length === 0 ? (
            <Empty label="No news yet." />
          ) : (
            <div className="card divide-y divide-ink-100">
              {news.map(p => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Empty({ label }) {
  return <div className="card p-10 text-center text-ink-400 font-sans text-sm">{label}</div>;
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-ink-100 h-72 w-full" />
      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-ink-100 rounded-2xl" />)}
      </div>
    </div>
  );
}
