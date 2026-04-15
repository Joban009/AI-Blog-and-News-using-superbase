import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });
dotenv.config({ path: resolve(__dirname, '../.env') });

import express     from 'express';
import cors        from 'cors';
import helmet      from 'helmet';
import morgan      from 'morgan';
import { rateLimit } from 'express-rate-limit';

import authRoutes    from './routes/auth.js';
import postRoutes    from './routes/posts.js';
import commentRoutes from './routes/comments.js';
import adminRoutes   from './routes/admin.js';
import aiRoutes      from './routes/ai.js';
import userRoutes    from './routes/users.js';

// ── Startup validation ────────────────────────────────────────
const REQUIRED = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY'];
const missing  = REQUIRED.filter(k => !process.env[k] || process.env[k].includes('your-'));
if (missing.length) {
  console.error('\n❌  Missing environment variables:');
  missing.forEach(k => console.error(`   • ${k}`));
  console.error('\n   Fill in your .env.local file and restart.\n');
  process.exit(1);
}

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin:      process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api/auth',     authRoutes);
app.use('/api/posts',    postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/ai',       aiRoutes);
app.use('/api/users',    userRoutes);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
