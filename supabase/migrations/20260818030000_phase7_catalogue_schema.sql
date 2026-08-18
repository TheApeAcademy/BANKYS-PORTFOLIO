-- ============================================================================
-- Phase 7 — Pricing Catalogue: DB schema + versioning (schema only)
-- ============================================================================
-- Normalized mirror of apps/studio/lib/catalogue/{catalogue,shared}.ts. This
-- migration is schema + seed of the CURRENT live catalogue as version 1,
-- marked active/published — it does NOT change how pricing is computed.
-- calculateProject() in apps/studio/lib/catalogue/engine.ts keeps reading
-- from the static TS files; nothing on the live /start checkout path
-- changes in this phase. A later phase does a dual-read comparison and
-- cutover once the DB-computed numbers are verified to match exactly.
--
-- Flow/project-type modeling: in the actual TS data every one of the 12
-- FLOWS registry entries has an id identical to its owning project type's
-- id (e.g. FLOWS.web_app.id === "web_app" === the PROJECT_TYPES entry's
-- own id) — the "flow" concept is 1:1 with project_type in every real case
-- today. Rather than add a separate catalogue_flows table for an
-- abstraction nothing in the data actually uses independently,
-- catalogue_steps is keyed directly by (version_id, project_type_id).
--
-- show_if / requires columns are reserved for the catalogue's showIf
-- (conditional step display) and option.requires (option dependency)
-- TypeScript fields — confirmed unused by every current flow (grep found
-- zero occurrences in catalogue.ts/shared.ts), so they're carried as
-- nullable/empty columns now rather than designed in depth; the actual
-- condition format gets designed against real requirements when a future
-- catalogue version first needs one.
-- ============================================================================

create table public.catalogue_versions (
  id uuid primary key default gen_random_uuid(),
  version_number int not null,
  is_active boolean not null default false,
  published_at timestamptz,
  created_by text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (version_number)
);

-- Only one version may be active (live-selected) at a time.
create unique index idx_catalogue_versions_one_active on public.catalogue_versions (is_active) where is_active;

alter table public.catalogue_versions enable row level security;
create policy catalogue_versions_admin_select on public.catalogue_versions for select using (public.is_admin());
create policy catalogue_versions_admin_insert on public.catalogue_versions for insert with check (public.is_admin());
create policy catalogue_versions_admin_update on public.catalogue_versions for update using (public.is_admin());

create table public.catalogue_project_types (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.catalogue_versions(id) on delete cascade,
  type_id text not null,
  label text not null,
  helper text not null,
  type_order int not null,
  -- FLAT_BASE_PRICES value, when this project type's base price is a flat
  -- constant rather than an inline role:'base' step (website/ecommerce ask
  -- the base price as a priced step instead — base_price stays null there).
  base_price numeric,
  unique (version_id, type_id)
);

alter table public.catalogue_project_types enable row level security;
create policy catalogue_project_types_admin_select on public.catalogue_project_types for select using (public.is_admin());
create policy catalogue_project_types_admin_insert on public.catalogue_project_types for insert with check (public.is_admin());
create policy catalogue_project_types_admin_update on public.catalogue_project_types for update using (public.is_admin());
create policy catalogue_project_types_admin_delete on public.catalogue_project_types for delete using (public.is_admin());

create table public.catalogue_steps (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null references public.catalogue_versions(id) on delete cascade,
  project_type_id text not null,
  step_key text not null,
  step_order int not null,
  question text not null,
  helper text,
  step_type text not null check (step_type in ('single', 'multi', 'number', 'text')),
  role text not null default 'addon' check (role in ('base', 'addon', 'multiplier', 'note')),
  min_value int,
  max_value int,
  price_per_unit numeric,
  included_units int,
  optional boolean not null default false,
  show_if jsonb,
  foreign key (version_id, project_type_id) references public.catalogue_project_types (version_id, type_id) on delete cascade,
  unique (version_id, project_type_id, step_key)
);

create index idx_catalogue_steps_version_type on public.catalogue_steps (version_id, project_type_id);

alter table public.catalogue_steps enable row level security;
create policy catalogue_steps_admin_select on public.catalogue_steps for select using (public.is_admin());
create policy catalogue_steps_admin_insert on public.catalogue_steps for insert with check (public.is_admin());
create policy catalogue_steps_admin_update on public.catalogue_steps for update using (public.is_admin());
create policy catalogue_steps_admin_delete on public.catalogue_steps for delete using (public.is_admin());

create table public.catalogue_options (
  id uuid primary key default gen_random_uuid(),
  step_id uuid not null references public.catalogue_steps(id) on delete cascade,
  option_key text not null,
  label text not null,
  price numeric,
  multiplier numeric,
  unit text check (unit in ('flat', 'per_page', 'per_item', 'per_hour', 'per_article', 'per_integration', 'per_month')),
  description text,
  included boolean not null default false,
  option_order int not null,
  requires text[],
  unique (step_id, option_key)
);

create index idx_catalogue_options_step_id on public.catalogue_options (step_id);

alter table public.catalogue_options enable row level security;
create policy catalogue_options_admin_select on public.catalogue_options for select using (public.is_admin());
create policy catalogue_options_admin_insert on public.catalogue_options for insert with check (public.is_admin());
create policy catalogue_options_admin_update on public.catalogue_options for update using (public.is_admin());
create policy catalogue_options_admin_delete on public.catalogue_options for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- Publish-lock: once a version is published (published_at is not null), its
-- project_types/steps/options become immutable — "publish new version
-- snapshots the editable state, never edits a published one in place."
-- Applied as a trigger (not RLS) for the same reason append_only_guard is a
-- trigger: it needs to look at the PARENT version row, which a per-row RLS
-- USING clause can express but a WITH CHECK on write can't cleanly for
-- UPDATE/DELETE without a subquery on every policy; a shared trigger
-- function is simpler and matches this schema's established pattern.
-- ----------------------------------------------------------------------------

create or replace function public.catalogue_version_locked_guard()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
declare
  v_version_id uuid;
  v_published_at timestamptz;
begin
  v_version_id := coalesce(new.version_id, old.version_id);
  select published_at into v_published_at from public.catalogue_versions where id = v_version_id;
  if v_published_at is not null then
    raise exception 'catalogue version % is published and its content is immutable', v_version_id;
  end if;
  return coalesce(new, old);
end;
$function$;

create trigger trg_catalogue_project_types_locked
  before insert or update or delete on public.catalogue_project_types
  for each row execute function public.catalogue_version_locked_guard();

create trigger trg_catalogue_steps_locked
  before insert or update or delete on public.catalogue_steps
  for each row execute function public.catalogue_version_locked_guard();

-- catalogue_options has no version_id column directly — resolve it via the
-- owning step, same guard function reused with the step's version_id.
create or replace function public.catalogue_option_version_locked_guard()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
declare
  v_step_id uuid;
  v_published_at timestamptz;
begin
  v_step_id := coalesce(new.step_id, old.step_id);
  select cv.published_at into v_published_at
  from public.catalogue_steps cs
  join public.catalogue_versions cv on cv.id = cs.version_id
  where cs.id = v_step_id;
  if v_published_at is not null then
    raise exception 'catalogue step % belongs to a published, immutable version', v_step_id;
  end if;
  return coalesce(new, old);
end;
$function$;

create trigger trg_catalogue_options_locked
  before insert or update or delete on public.catalogue_options
  for each row execute function public.catalogue_option_version_locked_guard();

-- ----------------------------------------------------------------------------
-- create_catalogue_version — clones the currently active version's full
-- content into a new, unpublished draft. Admin edits the draft directly via
-- normal admin-only RLS writes (blocked once published by the guards
-- above); publish_catalogue_version below promotes it.
-- ----------------------------------------------------------------------------

create or replace function public.create_catalogue_version(p_notes text, p_actor text)
returns public.catalogue_versions
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_source_version_id uuid;
  v_new_version public.catalogue_versions;
  v_next_number int;
  v_type record;
  v_new_type_id uuid;
  v_step record;
  v_new_step_id uuid;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  select id into v_source_version_id from public.catalogue_versions where is_active limit 1;

  select coalesce(max(version_number), 0) + 1 into v_next_number from public.catalogue_versions;

  insert into public.catalogue_versions (version_number, is_active, created_by, notes)
  values (v_next_number, false, p_actor, p_notes)
  returning * into v_new_version;

  if v_source_version_id is not null then
    for v_type in
      select * from public.catalogue_project_types where version_id = v_source_version_id order by type_order
    loop
      insert into public.catalogue_project_types (version_id, type_id, label, helper, type_order, base_price)
      values (v_new_version.id, v_type.type_id, v_type.label, v_type.helper, v_type.type_order, v_type.base_price)
      returning id into v_new_type_id;

      for v_step in
        select * from public.catalogue_steps
        where version_id = v_source_version_id and project_type_id = v_type.type_id
        order by step_order
      loop
        insert into public.catalogue_steps (
          version_id, project_type_id, step_key, step_order, question, helper, step_type, role,
          min_value, max_value, price_per_unit, included_units, optional, show_if
        )
        values (
          v_new_version.id, v_step.project_type_id, v_step.step_key, v_step.step_order, v_step.question,
          v_step.helper, v_step.step_type, v_step.role, v_step.min_value, v_step.max_value,
          v_step.price_per_unit, v_step.included_units, v_step.optional, v_step.show_if
        )
        returning id into v_new_step_id;

        insert into public.catalogue_options (
          step_id, option_key, label, price, multiplier, unit, description, included, option_order, requires
        )
        select v_new_step_id, o.option_key, o.label, o.price, o.multiplier, o.unit, o.description, o.included,
          o.option_order, o.requires
        from public.catalogue_options o
        where o.step_id = v_step.id;
      end loop;
    end loop;
  end if;

  return v_new_version;
end;
$function$;

revoke execute on function public.create_catalogue_version(text, text) from public;
revoke execute on function public.create_catalogue_version(text, text) from anon;
grant execute on function public.create_catalogue_version(text, text) to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- publish_catalogue_version — marks the target version active + published
-- (locking its content per the trigger guards above) and deactivates
-- whichever version was previously active. The previous version's
-- published_at is left untouched — it stays a permanent, immutable
-- historical record.
-- ----------------------------------------------------------------------------

create or replace function public.publish_catalogue_version(p_version_id uuid, p_actor text)
returns public.catalogue_versions
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_version public.catalogue_versions;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  update public.catalogue_versions set is_active = false where is_active;

  update public.catalogue_versions
    set is_active = true, published_at = coalesce(published_at, now())
    where id = p_version_id
    returning * into v_version;

  if v_version.id is null then
    raise exception 'catalogue version % not found', p_version_id;
  end if;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'CATALOGUE_VERSION_PUBLISHED', 'catalogue_version', p_version_id,
    jsonb_build_object('version_number', v_version.version_number));

  return v_version;
end;
$function$;

revoke execute on function public.publish_catalogue_version(uuid, text) from public;
revoke execute on function public.publish_catalogue_version(uuid, text) from anon;
grant execute on function public.publish_catalogue_version(uuid, text) to authenticated, service_role;
