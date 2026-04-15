import { Router } from 'express';
import supabase from '../config/supabase.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();

router.get('/:username/posts', async (req, res, next) => {
  try {
    const { data: profile } = await supabase
      .from('profiles').select('id').eq('username', req.params.username).single();
    if (!profile) return res.status(404).json({ error: 'User not found' });

    const { data: posts } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, type, cover_image_url, published_at, views, categories(name)')
      .eq('author_id', profile.id)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    res.json({ posts });
  } catch (err) { next(err); }
});

router.patch('/me', authenticate, async (req, res, next) => {
  try {
    const { bio, avatar_url } = req.body;
    await supabase.from('profiles').update({ bio, avatar_url }).eq('id', req.user.id);
    res.json({ message: 'Profile updated' });
  } catch (err) { next(err); }
});

export default router;
