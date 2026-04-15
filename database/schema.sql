-- ─────────────────────────────────────────────────────────────
-- AI News Blog System — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────

-- ── Enable UUID extension ─────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles (extends Supabase auth.users) ────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  role        text not null default 'user' check (role in ('admin','user')),
  avatar_url  text,
  bio         text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Categories ────────────────────────────────────────────────
create table public.categories (
  id          serial primary key,
  name        text not null unique,
  slug        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);

insert into public.categories (name, slug) values
  ('Technology', 'technology'),
  ('News',       'news'),
  ('Science',    'science'),
  ('Business',   'business'),
  ('Health',     'health'),
  ('World',      'world');

-- ── Tags ──────────────────────────────────────────────────────
create table public.tags (
  id   serial primary key,
  name text not null unique,
  slug text not null unique
);

-- ── Posts ─────────────────────────────────────────────────────
create table public.posts (
  id               uuid primary key default uuid_generate_v4(),
  author_id        uuid not null references public.profiles(id) on delete cascade,
  category_id      int references public.categories(id) on delete set null,
  title            text not null,
  slug             text not null unique,
  excerpt          text,
  content          text not null,
  cover_image_url  text,
  type             text not null default 'blog' check (type in ('blog','news')),
  status           text not null default 'draft' check (status in ('draft','pending','published','rejected')),
  is_ai_generated  boolean not null default false,
  ai_prompt        text,
  views            int not null default 0,
  moderated_by     uuid references public.profiles(id) on delete set null,
  moderated_at     timestamptz,
  rejection_reason text,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index idx_posts_status on public.posts(status);
create index idx_posts_type   on public.posts(type);
create index idx_posts_author on public.posts(author_id);

-- ── Post Tags ─────────────────────────────────────────────────
create table public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id  int  references public.tags(id)  on delete cascade,
  primary key (post_id, tag_id)
);

-- ── Comments ──────────────────────────────────────────────────
create table public.comments (
  id           uuid primary key default uuid_generate_v4(),
  post_id      uuid not null references public.posts(id) on delete cascade,
  author_id    uuid not null references public.profiles(id) on delete cascade,
  parent_id    uuid references public.comments(id) on delete set null,
  content      text not null,
  status       text not null default 'pending' check (status in ('pending','approved','rejected')),
  moderated_by uuid references public.profiles(id) on delete set null,
  moderated_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_comments_post_status on public.comments(post_id, status);

-- ── Row Level Security ────────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.posts     enable row level security;
alter table public.comments  enable row level security;
alter table public.categories enable row level security;
alter table public.tags      enable row level security;
alter table public.post_tags enable row level security;

-- Profiles: anyone can read, users can update own
create policy "Public profiles are viewable" on public.profiles for select using (true);
create policy "Users can update own profile"  on public.profiles for update using (auth.uid() = id);

-- Categories & Tags: public read
create policy "Categories are public" on public.categories for select using (true);
create policy "Tags are public"       on public.tags       for select using (true);
create policy "Post tags are public"  on public.post_tags  for select using (true);

-- Posts: published posts are public; authors see own; admins see all
create policy "Published posts are public" on public.posts for select
  using (status = 'published');

create policy "Authors see own posts" on public.posts for select
  using (auth.uid() = author_id);

create policy "Admins see all posts" on public.posts for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Authenticated users can create posts" on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Authors can update own posts" on public.posts for update
  using (auth.uid() = author_id);

create policy "Admins can update any post" on public.posts for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Authors can delete own posts" on public.posts for delete
  using (auth.uid() = author_id);

create policy "Admins can delete any post" on public.posts for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Comments: approved comments are public; admins see all
create policy "Approved comments are public" on public.comments for select
  using (status = 'approved');

create policy "Authors see own comments" on public.comments for select
  using (auth.uid() = author_id);

create policy "Admins see all comments" on public.comments for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Authenticated users can comment" on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Authors can delete own comments" on public.comments for delete
  using (auth.uid() = author_id);

create policy "Admins can update any comment" on public.comments for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can delete any comment" on public.comments for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ── Helper: auto-update updated_at ───────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger set_posts_updated_at    before update on public.posts    for each row execute function public.set_updated_at();
create trigger set_comments_updated_at before update on public.comments for each row execute function public.set_updated_at();
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
