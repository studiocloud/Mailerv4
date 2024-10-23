-- Create base tables first
create table if not exists public.email_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  name text not null,
  email text not null,
  password text not null,
  smtp_host text not null,
  smtp_port integer not null,
  use_tls boolean default true,
  daily_limit integer not null,
  sent_today integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  name text not null,
  email text not null,
  company text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  name text not null,
  subject text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  name text not null,
  template_id uuid not null,
  lead_list_ids uuid[] not null,
  email_account_ids uuid[] not null,
  schedule jsonb not null default '{"start_time": "09:00", "end_time": "17:00", "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]}'::jsonb,
  status text not null default 'draft',
  metrics jsonb not null default '{"sent": 0, "successful": 0, "failed": 0}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  email_notifications boolean default false,
  daily_reports boolean default false,
  weekly_reports boolean default false,
  security_alerts boolean default false,
  max_daily_emails integer default 1000,
  smtp_host text,
  smtp_port integer,
  smtp_user text,
  smtp_pass text,
  smtp_from text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);