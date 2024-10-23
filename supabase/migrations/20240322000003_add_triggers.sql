-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
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

create trigger handle_user_settings_updated_at
  before update on public.user_settings
  for each row
  execute function public.handle_updated_at();

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_settings (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();