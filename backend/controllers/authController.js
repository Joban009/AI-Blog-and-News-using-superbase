import { createClient } from '@supabase/supabase-js';
import supabase from '../config/supabase.js';

function userClient(token) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;

    // Check username taken
    const { data: existing } = await supabase
      .from('profiles').select('id').eq('username', username).single();
    if (existing)
      return res.status(409).json({ error: 'Username already taken' });

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip email confirmation for dev
      user_metadata: { username },
    });

    if (error) return res.status(400).json({ error: error.message });

    // Sign in to get session token
    const anonClient = createClient(
      process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY
    );
    const { data: session, error: signInErr } = await anonClient.auth.signInWithPassword({
      email, password,
    });
    if (signInErr) return res.status(400).json({ error: signInErr.message });

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', data.user.id).single();

    res.status(201).json({
      token: session.session.access_token,
      user: { ...data.user, profile },
    });
  } catch (err) { next(err); }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const anonClient = createClient(
      process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY
    );
    const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: 'Invalid credentials' });

    // Check active
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', data.user.id).single();

    if (!profile?.is_active)
      return res.status(403).json({ error: 'Account deactivated' });

    res.json({
      token: data.session.access_token,
      user: { ...data.user, profile },
    });
  } catch (err) { next(err); }
}

// GET /api/auth/me
export async function me(req, res, next) {
  try {
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', req.user.id).single();
    res.json({ user: { ...req.user, profile } });
  } catch (err) { next(err); }
}
