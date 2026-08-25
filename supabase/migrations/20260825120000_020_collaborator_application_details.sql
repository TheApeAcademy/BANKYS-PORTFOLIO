-- ============================================================================
-- 020 — collaborator applications: portfolio link + document attachments,
-- and a notification so a new application surfaces on the admin bell, not
-- just by remembering to check the Collaborators page.
-- ============================================================================

alter table public.collaborator_applications
  add column if not exists portfolio_url text,
  add column if not exists attachments jsonb not null default '[]'::jsonb;

-- Private bucket for applicant-uploaded files (resume, portfolio, ID, etc).
-- Uploads happen server-side via the service-role client in the studio app's
-- submitCollaboratorApplication action (applicants are anonymous, pre-auth —
-- same reasoning as every other public-form write in this app), so this
-- policy only needs to gate *admin* read access, same pattern as the
-- existing project-files bucket.
insert into storage.buckets (id, name, public)
values ('collaborator-applications', 'collaborator-applications', false)
on conflict (id) do nothing;

drop policy if exists collaborator_application_files_admin_all on storage.objects;
create policy collaborator_application_files_admin_all on storage.objects
  for all using (bucket_id = 'collaborator-applications' and public.is_admin())
  with check (bucket_id = 'collaborator-applications' and public.is_admin());

-- Add 'collaborator_application' to the notification type enum.
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check check (
  type in ('payment', 'project', 'message', 'revision', 'overdue', 'refund', 'chargeback', 'commission_due', 'system_error', 'collaborator_application')
);

-- The new signature adds two trailing params — CREATE OR REPLACE would leave
-- the old 5-arg version as a separate overload (Postgres function identity
-- includes the parameter list), which makes a 5-named-arg call ambiguous
-- between the two. Drop the old signature explicitly so there's exactly one.
drop function if exists public.submit_collaborator_application(text, text, text, text, text);

create or replace function public.submit_collaborator_application(
  p_name text, p_email text, p_phone text, p_pitch text, p_experience text,
  p_portfolio_url text default null, p_attachments jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_id uuid;
begin
  if trim(p_name) = '' or trim(p_pitch) = '' or trim(p_experience) = '' then
    raise exception 'Name, pitch, and experience are required.';
  end if;

  insert into public.collaborator_applications (name, email, phone, pitch, experience, portfolio_url, attachments)
  values (
    trim(p_name), nullif(trim(p_email), ''), nullif(trim(p_phone), ''), trim(p_pitch), trim(p_experience),
    nullif(trim(coalesce(p_portfolio_url, '')), ''), coalesce(p_attachments, '[]'::jsonb)
  )
  returning id into v_id;

  perform public.create_notification(
    'collaborator_application', 'collaborator_application', v_id,
    'New collaborator application', trim(p_name) || ' applied to collaborate.'
  );

  return v_id;
end;
$function$;

revoke execute on function public.submit_collaborator_application(text, text, text, text, text, text, jsonb) from public;
grant execute on function public.submit_collaborator_application(text, text, text, text, text, text, jsonb) to anon, authenticated, service_role;
