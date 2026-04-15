import supabase from '../config/supabase.js';

// GET /api/comments?post_id=:id
export async function listComments(req, res, next) {
  try {
    const { post_id } = req.query;
    if (!post_id) return res.status(400).json({ error: 'post_id required' });

    const isAdmin = req.user?.role === 'admin';
    let query = supabase
      .from('comments')
      .select(`*, profiles!author_id ( username, avatar_url )`)
      .eq('post_id', post_id)
      .order('created_at', { ascending: true });

    if (!isAdmin) query = query.eq('status', 'approved');

    const { data: comments, error } = await query;
    if (error) throw error;
    res.json({ comments });
  } catch (err) { next(err); }
}

// POST /api/comments
export async function createComment(req, res, next) {
  try {
    const { post_id, content, parent_id } = req.body;

    const { data: post } = await supabase
      .from('posts').select('id').eq('id', post_id).eq('status', 'published').single();
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const { data, error } = await supabase.from('comments').insert({
      post_id,
      author_id: req.user.id,
      content,
      parent_id: parent_id || null,
      status: 'pending',
    }).select().single();

    if (error) throw error;
    res.status(201).json({ message: 'Comment submitted for review', commentId: data.id });
  } catch (err) { next(err); }
}

// DELETE /api/comments/:id
export async function deleteComment(req, res, next) {
  try {
    const { id } = req.params;
    const { data: comment } = await supabase.from('comments').select('author_id').eq('id', id).single();
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && comment.author_id !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    await supabase.from('comments').delete().eq('id', id);
    res.json({ message: 'Comment deleted' });
  } catch (err) { next(err); }
}

// PATCH /api/comments/:id/approve
export async function approveComment(req, res, next) {
  try {
    await supabase.from('comments').update({
      status: 'approved',
      moderated_by: req.user.id,
      moderated_at: new Date().toISOString(),
    }).eq('id', req.params.id);
    res.json({ message: 'Comment approved' });
  } catch (err) { next(err); }
}

// PATCH /api/comments/:id/reject
export async function rejectComment(req, res, next) {
  try {
    await supabase.from('comments').update({
      status: 'rejected',
      moderated_by: req.user.id,
      moderated_at: new Date().toISOString(),
    }).eq('id', req.params.id);
    res.json({ message: 'Comment rejected' });
  } catch (err) { next(err); }
}
