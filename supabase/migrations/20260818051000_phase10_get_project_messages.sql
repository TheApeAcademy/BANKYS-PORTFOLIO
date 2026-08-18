-- ----------------------------------------------------------------------------
-- get_project_messages — anon-callable, mirrors get_project_tracker's
-- access_token lookup pattern. project_messages has admin-only SELECT RLS,
-- so without this the /track page's message box could send but never show
-- the conversation back to the client. Returns only the fields a client
-- should see (no internal ids beyond what's needed for React keys).
-- ----------------------------------------------------------------------------

create or replace function public.get_project_messages(p_access_token text)
returns table (
  id uuid,
  sender_type text,
  sender_label text,
  body text,
  created_at timestamptz
)
language sql
security definer
set search_path to 'public'
as $function$
  select m.id, m.sender_type, m.sender_label, m.body, m.created_at
  from public.project_messages m
  join public.projects p on p.id = m.project_id
  where p.access_token = p_access_token
  order by m.created_at asc;
$function$;

revoke execute on function public.get_project_messages(text) from public;
grant execute on function public.get_project_messages(text) to anon, authenticated, service_role;
