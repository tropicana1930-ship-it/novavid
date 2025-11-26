-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase Auth)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text,
  plan text default 'free',
  credits int default 100,
  trial_ends_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security for Users
alter table public.users enable row level security;
create policy "Users can view own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);
create policy "Users can insert own data" on public.users for insert with check (auth.uid() = id);

-- Projects table
create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  name text not null,
  type text check (type in ('video', 'image', 'audio')),
  content jsonb default '{}'::jsonb,
  thumbnail_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security for Projects
alter table public.projects enable row level security;
create policy "Users can view own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects for delete using (auth.uid() = user_id);

-- Edit History table
create table public.edit_history (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,
  action text not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.edit_history enable row level security;
create policy "Users can view own history" on public.edit_history for select using (auth.uid() = user_id);

-- Subscriptions table (for Stripe integration later)
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.subscriptions enable row level security;
create policy "Users can view own subscription" on public.subscriptions for select using (auth.uid() = user_id);

-- Audio Library (Shared + Private)
create table public.audio_library (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users, -- null means public/system
  name text not null,
  url text not null,
  category text,
  duration text,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.audio_library enable row level security;
create policy "Users can view public audio" on public.audio_library for select using (is_public = true or auth.uid() = user_id);
create policy "Users can insert own audio" on public.audio_library for insert with check (auth.uid() = user_id);