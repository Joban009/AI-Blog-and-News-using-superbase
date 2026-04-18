import { createClient } from "@supabase/supabase-js";

// reuse this helper instead of dynamic import
const adminClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ error: "No token provided" });

  const token = authHeader.slice(7);

  const anonClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
  );

  const {
    data: { user },
    error,
  } = await anonClient.auth.getUser(token);
  if (error || !user)
    return res.status(401).json({ error: "Invalid or expired token" });

  // ✅ Use adminClient directly — no dynamic import needed
  const { data: profile } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  req.user = { ...user, profile, role: profile?.role || "user" };
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: "Insufficient permissions" });
    next();
  };
}

export async function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const anonClient = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
      );
      const {
        data: { user },
      } = await anonClient.auth.getUser(token);
      if (user) {
        // ✅ Use adminClient directly
        const { data: profile } = await adminClient
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        req.user = { ...user, profile, role: profile?.role || "user" };
      }
    } catch {
      /* ignore */
    }
  }
  next();
}
