-- ============================================================================
-- Phase 10 — Messaging, Files/Documents, Invoices
-- ============================================================================
-- Three genuinely new subsystems on a project that had zero Storage
-- buckets and zero messaging/invoicing tables before this migration.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Storage: a single private bucket for all project files (documents and
-- generated invoice PDFs, under different path prefixes). Admin-only via
-- storage.objects RLS — no client-facing download path in this phase (the
-- plan's client-facing surface for Phase 10 is messaging only, not file
-- access); a signed-URL flow for client document access is a real but
-- separate future feature, not assumed here.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public) values ('project-files', 'project-files', false);

create policy project_files_admin_all on storage.objects for all
  using (bucket_id = 'project-files' and public.is_admin())
  with check (bucket_id = 'project-files' and public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. project_documents — admin-only RLS for all operations, plain (not
-- RPC-gated) since this is content management, not a financial mutation —
-- same reasoning as the Phase 7 catalogue tables. version/superseded_by are
-- set by the uploading app code when replacing an existing logical
-- document, not enforced here.
-- ----------------------------------------------------------------------------

create table public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id),
  category text not null check (category in ('brief', 'image', 'contract', 'deliverable', 'source')),
  storage_path text not null,
  file_name text not null,
  file_size bigint,
  version int not null default 1,
  uploaded_by text not null,
  uploaded_at timestamptz not null default now(),
  superseded_by uuid references public.project_documents(id)
);

create index idx_project_documents_project_id on public.project_documents (project_id);

alter table public.project_documents enable row level security;
create policy project_documents_admin_select on public.project_documents for select using (public.is_admin());
create policy project_documents_admin_insert on public.project_documents for insert with check (public.is_admin());
create policy project_documents_admin_update on public.project_documents for update using (public.is_admin());
create policy project_documents_admin_delete on public.project_documents for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. project_messages — admin-only SELECT, no direct write policy for any
-- role. Every write goes through one of the two RPCs below so sender_type/
-- sender_label are always correct and can't be spoofed by the writer
-- (critical for send_client_message, which is anon-callable).
-- ----------------------------------------------------------------------------

create table public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id),
  sender_type text not null check (sender_type in ('admin', 'client', 'system')),
  sender_label text not null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index idx_project_messages_project_id on public.project_messages (project_id, created_at);

alter table public.project_messages enable row level security;
create policy project_messages_admin_select on public.project_messages for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- send_admin_message — admin-only.
-- ----------------------------------------------------------------------------

create or replace function public.send_admin_message(p_project_id uuid, p_body text, p_actor text)
returns public.project_messages
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_message public.project_messages;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;
  if p_body is null or length(trim(p_body)) = 0 then
    raise exception 'message body cannot be empty';
  end if;

  insert into public.project_messages (project_id, sender_type, sender_label, body)
  values (p_project_id, 'admin', p_actor, p_body)
  returning * into v_message;

  return v_message;
end;
$function$;

revoke execute on function public.send_admin_message(uuid, text, text) from public;
revoke execute on function public.send_admin_message(uuid, text, text) from anon;
grant execute on function public.send_admin_message(uuid, text, text) to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- send_client_message — anon-callable, mirrors get_project_tracker's
-- access_token lookup pattern. sender_label is always the project's
-- client_name, resolved server-side — the anon caller can never set an
-- arbitrary sender_label by passing one in.
-- ----------------------------------------------------------------------------

create or replace function public.send_client_message(p_access_token text, p_body text)
returns public.project_messages
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_project public.projects;
  v_message public.project_messages;
begin
  if p_body is null or length(trim(p_body)) = 0 then
    raise exception 'message body cannot be empty';
  end if;

  select * into v_project from public.projects where access_token = p_access_token;
  if v_project.id is null then
    raise exception 'invalid access token';
  end if;

  insert into public.project_messages (project_id, sender_type, sender_label, body)
  values (v_project.id, 'client', v_project.client_name, p_body)
  returning * into v_message;

  return v_message;
end;
$function$;

revoke execute on function public.send_client_message(text, text) from public;
grant execute on function public.send_client_message(text, text) to anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- mark_messages_read — admin-only, marks unread client messages on a
-- project as read.
-- ----------------------------------------------------------------------------

create or replace function public.mark_messages_read(p_project_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  update public.project_messages
    set read_at = now()
    where project_id = p_project_id and sender_type = 'client' and read_at is null;
end;
$function$;

revoke execute on function public.mark_messages_read(uuid) from public;
revoke execute on function public.mark_messages_read(uuid) from anon;
grant execute on function public.mark_messages_read(uuid) to authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 4. invoices — line_items mirrors project_price_snapshots.lines' shape
-- ({label, price}[]) rather than a separate line-items table, matching how
-- Phase 4 already stores priced lines as jsonb on price snapshots.
-- Sequence + trigger for invoice_number mirrors set_project_code() exactly.
-- ----------------------------------------------------------------------------

create sequence public.invoice_number_seq;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id),
  payment_id uuid references public.payments(id),
  invoice_number text unique,
  line_items jsonb not null,
  subtotal numeric not null,
  total numeric not null,
  currency text not null,
  issued_at timestamptz not null default now(),
  pdf_storage_path text,
  created_by text not null
);

create or replace function public.set_invoice_number()
returns trigger
language plpgsql
set search_path to 'public'
as $function$
begin
  if new.invoice_number is null then
    new.invoice_number := 'INV-' || lpad(nextval('public.invoice_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$function$;

create trigger trg_set_invoice_number
  before insert on public.invoices
  for each row execute function public.set_invoice_number();

create index idx_invoices_project_id on public.invoices (project_id);

alter table public.invoices enable row level security;
create policy invoices_admin_select on public.invoices for select using (public.is_admin());

-- ----------------------------------------------------------------------------
-- create_invoice — admin-only. pdf_storage_path is set separately by
-- set_invoice_pdf below once the PDF has actually been generated and
-- uploaded (the RPC that creates the row can't know the storage path yet —
-- generation happens in the app after the row/invoice_number exist).
-- ----------------------------------------------------------------------------

create or replace function public.create_invoice(
  p_project_id uuid, p_payment_id uuid, p_line_items jsonb, p_subtotal numeric, p_total numeric,
  p_currency text, p_actor text
)
returns public.invoices
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_invoice public.invoices;
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  insert into public.invoices (project_id, payment_id, line_items, subtotal, total, currency, created_by)
  values (p_project_id, p_payment_id, p_line_items, p_subtotal, p_total, p_currency, p_actor)
  returning * into v_invoice;

  insert into public.audit_log (actor, action, entity_type, entity_id, details)
  values (p_actor, 'INVOICE_CREATED', 'invoice', v_invoice.id,
    jsonb_build_object('invoice_number', v_invoice.invoice_number, 'total', p_total, 'currency', p_currency));

  return v_invoice;
end;
$function$;

revoke execute on function public.create_invoice(uuid, uuid, jsonb, numeric, numeric, text, text) from public;
revoke execute on function public.create_invoice(uuid, uuid, jsonb, numeric, numeric, text, text) from anon;
grant execute on function public.create_invoice(uuid, uuid, jsonb, numeric, numeric, text, text) to authenticated, service_role;

create or replace function public.set_invoice_pdf(p_invoice_id uuid, p_pdf_storage_path text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if not public.is_privileged_caller() then raise exception 'admin only'; end if;

  update public.invoices set pdf_storage_path = p_pdf_storage_path where id = p_invoice_id;
end;
$function$;

revoke execute on function public.set_invoice_pdf(uuid, text) from public;
revoke execute on function public.set_invoice_pdf(uuid, text) from anon;
grant execute on function public.set_invoice_pdf(uuid, text) to authenticated, service_role;
