-- Create indexes for better performance
create index if not exists idx_email_accounts_user_id on public.email_accounts(user_id);
create index if not exists idx_leads_user_id on public.leads(user_id);
create index if not exists idx_templates_user_id on public.templates(user_id);
create index if not exists idx_campaigns_user_id on public.campaigns(user_id);
create index if not exists idx_user_settings_user_id on public.user_settings(user_id);

-- Add foreign key constraints with cascade delete
alter table public.email_accounts
  add constraint email_accounts_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete cascade;

alter table public.leads
  add constraint leads_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete cascade;

alter table public.templates
  add constraint templates_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete cascade;

alter table public.campaigns
  add constraint campaigns_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete cascade;

alter table public.user_settings
  add constraint user_settings_user_id_fkey
  foreign key (user_id)
  references auth.users(id)
  on delete cascade;

-- Add template reference constraint
alter table public.campaigns
  add constraint campaigns_template_id_fkey
  foreign key (template_id)
  references public.templates(id)
  on delete cascade;