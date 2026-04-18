# Fix Render Deployment Error

## Steps (Dashboard-only, no code changes):

- [x] Log into [Render dashboard](https://dashboard.render.com)
- [x] Select your service (likely named "ai-blog-backend" or similar)
- [x] Settings > **Root Directory**: `backend`
- [x] Settings > **Build Command**: `npm install` (or empty)
- [x] Settings > **Start Command**: `npm start`
- [x] Environment > Add vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY (from your .env.local), PORT=10000 optional
- [x] Manual Deploy > Clear build cache & deploy
- [x] Check Logs for "Missing environment variables" or startup success

**Expected:** Runs `cd backend && npm start` → `node server.js`, avoids "server.jsnode" error.

## Verification:

```
curl https://your-render-url.onrender.com/api/health  # Should return {"status":"ok"}
```

**Note:** Vercel config irrelevant for Render; uses direct Node server.
