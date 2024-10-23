-- Create email_accounts table
create table if not exists public.email_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
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

-- Create leads table
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  company text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create templates table
create table if not exists public.templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create campaigns table
create table if not exists public.campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  template_id uuid not null references public.templates(id) on delete cascade,
  lead_list_ids uuid[] not null,
  email_account_ids uuid[] not null,
  schedule jsonb not null default '{"start_time": "09:00", "end_time": "17:00", "days": ["monday", "tuesday", "wednesday", "thursday", "friday"]}'::jsonb,
  status text not null default 'draft',
  metrics jsonb not null default '{"sent": 0, "successful": 0, "failed": 0}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.email_accounts enable row level security;
alter table public.leads enable row level security;
alter table public.templates enable row level security;
alter table public.campaigns enable row level security;

-- Create RLS policies for email_accounts
create policy "Users can view their own email accounts"
  on public.email_accounts for select
  using (auth.uid() = user_id);

create policy "Users can create their own email accounts"
  on public.email_accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own email accounts"
  on public.email_accounts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own email accounts"
  on public.email_accounts for delete
  using (auth.uid() = user_id);

-- Create RLS policies for leads
create policy "Users can view their own leads"
  on public.leads for select
  using (auth.uid() = user_id);

create policy "Users can create their own leads"
  on public.leads for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own leads"
  on public.leads for update
  using (auth.uid() = user_id);

create policy "Users can delete their own leads"
  on public.leads for delete
  using (auth.uid() = user_id);

-- Create RLS policies for templates
create policy "Users can view their own templates"
  on public.templates for select
  using (auth.uid() = user_id);

create policy "Users can create their own templates"
  on public.templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own templates"
  on public.templates for update
  using (auth.uid() = user_id);

create policy "Users can delete their own templates"
  on public.templates for delete
  using (auth.uid() = user_id);

-- Create RLS policies for campaigns
create policy "Users can view their own campaigns"
  on public.campaigns for select
  using (auth.uid() = user_id);

create policy "Users can create their own campaigns"
  on public.campaigns for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own campaigns"
  on public.campaigns for update
  using (auth.uid() = user_id);

create policy "Users can delete their own campaigns"
  on public.campaigns for delete
  using (auth.uid() = user_id);

-- Create updated_at triggers for all tables
create trigger handle_email_accounts_updated_at
  before update on public.email_accounts
  for each row
  execute function public.handle_updated_at();

create trigger handle_leads_updated_at
  before update on public.leads
  for each row
  execute function public.handle_updated_at();

create trigger handle_templates_updated_at
  before update on public.templates
  for each row
  execute function public.handle_updated_at();

create trigger handle_campaigns_updated_at
  before update on public.campaigns
  for each row
  execute function public.handle_updated_at();