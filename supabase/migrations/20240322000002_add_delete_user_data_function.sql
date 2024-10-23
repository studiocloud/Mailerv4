-- Function to delete all user data
create or replace function public.delete_all_user_data(p_user_id uuid, p_password text)
returns void
language plpgsql
security definer
as $$
declare
  valid_password boolean;
begin
  -- Verify password
  select exists (
    select 1
    from auth.users
    where id = p_user_id
    and encrypted_password = crypt(p_password, encrypted_password)
  ) into valid_password;

  if not valid_password then
    raise exception 'Invalid password';
  end if;

  -- Delete all user data
  delete from public.email_accounts where user_id = p_user_id;
  delete from public.leads where user_id = p_user_id;
  delete from public.templates where user_id = p_user_id;
  delete from public.campaigns where user_id = p_user_id;
  delete from public.user_settings where user_id = p_user_id;
  
  -- Delete the user account
  delete from auth.users where id = p_user_id;
end;
$$;