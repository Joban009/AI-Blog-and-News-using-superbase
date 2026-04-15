import { createClient } from '@supabase/supabase-js';

// Verify Supabase JWT and attach user to request
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.slice(7);

  // Verify token with Supabase
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user)
    return res.status(401).json({ error: 'Invalid or expired token' });

  // Get profile with role
  const { createClient: sc } = await import('@supabase/supabase-js');
  const admin = sc(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  req.user = { ...user, profile, role: profile?.role || 'user' };
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: 'Insufficient permissions' });
    next();
  };
}

export async function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) {
        const { createClient: sc } = await import('@supabase/supabase-js');
        const admin = sc(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        const { data: profile } = await admin
          .from('profiles').select('*').eq('id', user.id).single();
        req.user = { ...user, profile, role: profile?.role || 'user' };
      }
    } catch { /* ignore */ }
  }
  next();
}
