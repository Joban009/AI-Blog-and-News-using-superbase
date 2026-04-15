import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { postsApi } from '../services/api';
import PostCard from '../components/blog/PostCard';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const LIMIT = 9;

export default function BlogListPage({ type }) {
  const [posts,   setPosts]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const page   = Number(searchParams.get('page')   || 1);
  const search = searchParams.get('search') || '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await postsApi.list({ type, page, limit: LIMIT, search: search || undefined });
      setPosts(data.posts  || []);
      setTotal(data.total  || 0);
    } finally { setLoading(false); }
  }, [type, page, search]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-ink-900 mb-2 capitalize">{type}</h1>
        <p className="font-sans text-ink-500">{total} {type === 'news' ? 'news articles' : 'blog posts'} published</p>
      </div>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input className="input pl-9" placeholder={`Search ${type}…`} defaultValue={search}
          onKeyDown={e => { if (e.key === 'Enter') setSearchParams({ search: e.target.value, page: '1' }); }} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_,i) => <div key={i} className="h-64 bg-ink-100 rounded-2xl animate-pulse"/>)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-ink-400 font-sans">No {type} posts found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(p => <PostCard key={p.id} post={p} featured />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-12">
          <button className="btn-outline" disabled={page<=1}
            onClick={() => setSearchParams({ search, page: String(page-1) })}>
            <ChevronLeft size={16}/>Prev
          </button>
          <span className="font-sans text-sm text-ink-600">Page {page} of {totalPages}</span>
          <button className="btn-outline" disabled={page>=totalPages}
            onClick={() => setSearchParams({ search, page: String(page+1) })}>
            Next<ChevronRight size={16}/>
          </button>
        </div>
      )}
    </div>
  );
}
