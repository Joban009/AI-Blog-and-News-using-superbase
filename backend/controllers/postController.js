import supabase from '../config/supabase.js';
import slugify  from 'slugify';

function makeSlug(title) {
  return slugify(title, { lower: true, strict: true }) + '-' + Date.now().toString(36);
}

// GET /api/posts
export async function listPosts(req, res, next) {
  try {
    const { type, category, page = 1, limit = 10, search } = req.query;
    const from = (page - 1) * limit;
    const to   = from + Number(limit) - 1;

    let query = supabase
      .from('posts')
      .select(`
        id, title, slug, excerpt, cover_image_url, type, views,
        published_at, is_ai_generated, created_at,
        profiles!author_id ( username, avatar_url ),
        categories ( name, slug )
      `, { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to);

    if (type)     query = query.eq('type', type);
    if (search)   query = query.ilike('title', `%${search}%`);
    if (category) {
      const { data: cat } = await supabase
        .from('categories').select('id').eq('slug', category).single();
      if (cat) query = query.eq('category_id', cat.id);
    }

    const { data: posts, error, count } = await query;
    if (error) throw error;

    res.json({ posts, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) { next(err); }
}

// GET /api/posts/:slug
export async function getPost(req, res, next) {
  try {
    const { slug } = req.params;
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!author_id ( username, avatar_url, bio ),
        categories ( name, slug ),
        post_tags ( tags ( name, slug ) )
      `)
      .eq('slug', slug)
      .single();

    if (error || !post) return res.status(404).json({ error: 'Post not found' });

    const isAdmin  = req.user?.role === 'admin';
    const isAuthor = req.user?.id === post.author_id;
    if (post.status !== 'published' && !isAdmin && !isAuthor)
      return res.status(403).json({ error: 'Post not available' });

    // Increment views
    if (post.status === 'published')
      await supabase.from('posts').update({ views: post.views + 1 }).eq('id', post.id);

    res.json({ post });
  } catch (err) { next(err); }
}

// POST /api/posts
export async function createPost(req, res, next) {
  try {
    const { title, content, excerpt, cover_image_url,
            type = 'blog', category_id, tags = [], ai_prompt } = req.body;
    const isAdmin = req.user.role === 'admin';
    const slug    = makeSlug(title);

    const { data: post, error } = await supabase.from('posts').insert({
      author_id: req.user.id,
      category_id: category_id || null,
      title, slug, excerpt: excerpt || null, content,
      cover_image_url: cover_image_url || null,
      type,
      status: isAdmin ? 'draft' : 'pending',
      is_ai_generated: !!ai_prompt,
      ai_prompt: ai_prompt || null,
    }).select().single();

    if (error) throw error;

    // Attach tags
    for (const tagName of tags) {
      const tagSlug = slugify(tagName, { lower: true, strict: true });
      await supabase.from('tags').upsert({ name: tagName, slug: tagSlug }, { onConflict: 'slug' });
      const { data: tag } = await supabase.from('tags').select('id').eq('slug', tagSlug).single();
      if (tag) await supabase.from('post_tags').upsert({ post_id: post.id, tag_id: tag.id });
    }

    res.status(201).json({
      message: isAdmin ? 'Draft created' : 'Post submitted for review',
      slug: post.slug,
    });
  } catch (err) { next(err); }
}

// PUT /api/posts/:id
export async function updatePost(req, res, next) {
  try {
    const { id } = req.params;
    const { data: post } = await supabase.from('posts').select('*').eq('id', id).single();
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && post.author_id !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    const { title, content, excerpt, cover_image_url, type, category_id } = req.body;
    const newSlug = title && title !== post.title ? makeSlug(title) : post.slug;

    const { error } = await supabase.from('posts').update({
      title:           title           ?? post.title,
      slug:            newSlug,
      content:         content         ?? post.content,
      excerpt:         excerpt         ?? post.excerpt,
      cover_image_url: cover_image_url ?? post.cover_image_url,
      type:            type            ?? post.type,
      category_id:     category_id     ?? post.category_id,
    }).eq('id', id);

    if (error) throw error;
    res.json({ message: 'Post updated', slug: newSlug });
  } catch (err) { next(err); }
}

// DELETE /api/posts/:id
export async function deletePost(req, res, next) {
  try {
    const { id } = req.params;
    const { data: post } = await supabase.from('posts').select('author_id').eq('id', id).single();
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && post.author_id !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    await supabase.from('posts').delete().eq('id', id);
    res.json({ message: 'Post deleted' });
  } catch (err) { next(err); }
}

// POST /api/posts/:id/publish  (admin)
export async function publishPost(req, res, next) {
  try {
    const { id } = req.params;
    await supabase.from('posts').update({
      status: 'published',
      published_at: new Date().toISOString(),
      moderated_by: req.user.id,
      moderated_at: new Date().toISOString(),
    }).eq('id', id);
    res.json({ message: 'Post published' });
  } catch (err) { next(err); }
}

// POST /api/posts/:id/reject  (admin)
export async function rejectPost(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    await supabase.from('posts').update({
      status: 'rejected',
      moderated_by: req.user.id,
      moderated_at: new Date().toISOString(),
      rejection_reason: reason || null,
    }).eq('id', id);
    res.json({ message: 'Post rejected' });
  } catch (err) { next(err); }
}
