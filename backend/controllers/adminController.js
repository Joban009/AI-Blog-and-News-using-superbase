import supabase from '../config/supabase.js';

// GET /api/admin/dashboard
export async function getDashboard(req, res, next) {
  try {
    const [
      { count: total_posts },
      { count: published },
      { count: pending_posts },
      { count: total_comments },
      { count: pending_comments },
      { count: total_users },
      { data: recent_posts },
    ] = await Promise.all([
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('posts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('posts')
        .select('id, title, status, type, created_at, profiles!author_id(username)')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    res.json({
      stats: { total_posts, published, pending_posts, total_comments, pending_comments, total_users },
      recent_posts,
    });
  } catch (err) { next(err); }
}

// GET /api/admin/posts
export async function adminListPosts(req, res, next) {
  try {
    const { status } = req.query;
    let query = supabase
      .from('posts')
      .select(`
        id, title, slug, type, status, views, is_ai_generated, created_at, published_at,
        profiles!author_id ( username ),
        categories ( name )
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: posts, error } = await query;
    if (error) throw error;
    res.json({ posts });
  } catch (err) { next(err); }
}

// GET /api/admin/comments
export async function adminListComments(req, res, next) {
  try {
    const { status } = req.query;
    let query = supabase
      .from('comments')
      .select(`
        id, content, status, created_at,
        profiles!author_id ( username ),
        posts ( title, slug )
      `)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: comments, error } = await query;
    if (error) throw error;
    res.json({ comments });
  } catch (err) { next(err); }
}

// GET /api/admin/users
export async function listUsers(req, res, next) {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ users });
  } catch (err) { next(err); }
}

// PATCH /api/admin/users/:id
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { role, is_active } = req.body;
    const updates = {};
    if (role)              updates.role      = role;
    if (is_active !== undefined) updates.is_active = is_active;
    await supabase.from('profiles').update(updates).eq('id', id);
    res.json({ message: 'User updated' });
  } catch (err) { next(err); }
}
