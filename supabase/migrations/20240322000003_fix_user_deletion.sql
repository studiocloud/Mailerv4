-- Drop the old function if it exists
drop function if exists public.delete_all_user_data;

-- Create indexes for better deletion performance
create index if not exists idx_email_accounts_user_id on public.email_accounts(user_id);
create index if not exists idx_leads_user_id on public.leads(user_id);
create index if not exists idx_templates_user_id on public.templates(user_id);
create index if not exists idx_campaigns_user_id on public.campaigns(user_id);
create index if not exists idx_user_settings_user_id on public.user_settings(user_id);

-- Add cascade delete to all foreign keys
alter table public.email_accounts
  drop constraint if exists email_accounts_user_id_fkey,
  add constraint email_accounts_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade;

alter table public.leads
  drop constraint if exists leads_user_id_fkey,
  add constraint leads_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade;

alter table public.templates
  drop constraint if exists templates_user_id_fkey,
  add constraint templates_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade;

alter table public.campaigns
  drop constraint if exists campaigns_user_id_fkey,
  add constraint campaigns_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade;

alter table public.user_settings
  drop constraint if exists user_settings_user_id_fkey,
  add constraint user_settings_user_id_fkey
    foreign key (user_id)
    references auth.users(id)
    on delete cascade;