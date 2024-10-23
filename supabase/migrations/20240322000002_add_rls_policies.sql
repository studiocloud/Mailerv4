-- Enable RLS on all tables
alter table public.email_accounts enable row level security;
alter table public.leads enable row level security;
alter table public.templates enable row level security;
alter table public.campaigns enable row level security;
alter table public.user_settings enable row level security;

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

-- Create RLS policies for user_settings
create policy "Users can view their own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);