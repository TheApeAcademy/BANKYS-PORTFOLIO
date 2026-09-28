-- ============================================================================
-- 023: Client tracker pop-up + hand-confirmed pricing
-- ============================================================================
-- 1. projects.price_confirmed_at: briefs from the Project Builder are saved
--    with an *initial estimate* (configuration.price_status =
--    'initial_estimate'). They become payable only after the admin confirms a
--    final price through confirm_project_price(). Projects priced by the older
--    Configurator have no price_status and stay payable as before.
-- 2. A client re-save that changes quoted_price drops any confirmation, so a
--    confirmed price can't be edited from the client side.
-- 3. get_project_overview(token): what the tracker pop-up shows (price,
--    selections, payable flag) on top of get_project_tracker's progress.
-- 4. find_project_access(code, contact): "lost my link" lookup. Project codes
--    are sequential (ZB-00001...), so the code alone is guessable; it must be
--    paired with the phone, email or handle the client gave us.
-- ============================================================================

alter table public.projects add column if not exists price_confirmed_at timestamptz;

create or replace function public.projects_reset_price_confirmation()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if new.quoted_price is distinct from old.quoted_price and not public.is_privileged_caller() then
    new.price_confirmed_at := null;
  end if;
  return new;
end;
$function$;

drop trigger if exists projects_reset_price_confirmation on public.projects;
create trigger projects_reset_price_confirmation
  before update of quoted_price on public.projects
  for each row execute function public.projects_reset_price_confirmation();

create or replace function public.confirm_project_price(p_project_id uuid, p_price numeric)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_project public.projects;
begin
  if not public.is_privileged_caller() then
    raise exception 'Not authorized';
  end if;
  if p_price is null or p_price <= 0 then
    raise exception 'Price must be greater than zero';
  end if;

  update public.projects
     set quoted_price = round(p_price, 2), price_confirmed_at = now()
   where id = p_project_id
   returning * into v_project;
  if not found then
    raise exception 'Project not found';
  end if;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (coalesce(auth.uid()::text, 'service_role'), 'PRICE_CONFIRMED', 'project', v_project.id,
    jsonb_build_object('project_code', v_project.project_code, 'final_price', v_project.quoted_price,
      'initial_estimate', v_project.configuration ->> 'initial_estimate'));
end;
$function$;

revoke execute on function public.confirm_project_price(uuid, numeric) from public;
grant execute on function public.confirm_project_price(uuid, numeric) to authenticated, service_role;

create or replace function public.get_project_overview(p_access_token text)
returns jsonb
language sql
stable
security definer
set search_path to 'public'
as $function$
  select jsonb_build_object(
    'project_code', p.project_code,
    'first_name', split_part(trim(p.client_name), ' ', 1),
    'project_type', p.project_type,
    'status', p.status,
    'price', p.quoted_price,
    'currency', coalesce(p.quoted_currency, 'EUR'),
    'price_confirmed', p.price_confirmed_at is not null
      or coalesce(p.configuration ->> 'price_status', '') <> 'initial_estimate',
    'price_confirmed_at', p.price_confirmed_at,
    'payable', p.status in ('draft', 'awaiting_payment')
      and p.quoted_price is not null
      and (p.price_confirmed_at is not null or coalesce(p.configuration ->> 'price_status', '') <> 'initial_estimate'),
    'configuration', coalesce(p.configuration, '{}'::jsonb),
    'created_at', p.created_at
  )
  from public.projects p
  where p.access_token = p_access_token;
$function$;

revoke execute on function public.get_project_overview(text) from public;
grant execute on function public.get_project_overview(text) to anon, authenticated, service_role;

create or replace function public.find_project_access(p_code text, p_contact text)
returns text
language plpgsql
stable
security definer
set search_path to 'public'
as $function$
declare
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
  v_input text := lower(trim(coalesce(p_contact, '')));
  v_digits text := regexp_replace(coalesce(p_contact, ''), '\D', '', 'g');
  v_handle text := ltrim(lower(trim(coalesce(p_contact, ''))), '@');
  v_project public.projects;
  v_contact text;
begin
  -- Accept "ZB-00012", "zb00012" or just "12".
  if v_code ~ '^[0-9]+$' then
    v_code := 'ZB-' || lpad(v_code, 5, '0');
  elsif v_code ~ '^ZB[0-9]+$' then
    v_code := 'ZB-' || substr(v_code, 3);
  end if;

  select * into v_project from public.projects where upper(project_code) = v_code;
  if not found or length(v_input) < 3 then
    return null;
  end if;

  v_contact := lower(coalesce(v_project.client_contact, '') || ' ' || coalesce(v_project.configuration ->> 'email', '')
    || ' ' || coalesce(v_project.configuration ->> 'contact_handle', ''));

  -- Email: exact address somewhere in what they gave us.
  if position('@' in v_input) > 1 then
    if position(v_input in v_contact) > 0 then return v_project.access_token; end if;
    return null;
  end if;

  -- Phone: last 9 digits match, so +234 802... and 0802... both work.
  if length(v_digits) >= 7 and length(v_digits) >= length(v_input) - 4 then
    if position(right(v_digits, 9) in regexp_replace(v_contact, '\D', '', 'g')) > 0 then
      return v_project.access_token;
    end if;
    return null;
  end if;

  -- Telegram / Snapchat handle: the whole handle must match.
  if length(v_handle) >= 3 and v_contact ~ ('(^|[^a-z0-9._])@?' || regexp_replace(v_handle, '([.\\+*?()\[\]{}|^$])', '\\\1', 'g') || '($|[^a-z0-9._])') then
    return v_project.access_token;
  end if;

  return null;
end;
$function$;

revoke execute on function public.find_project_access(text, text) from public;
grant execute on function public.find_project_access(text, text) to anon, authenticated, service_role;
