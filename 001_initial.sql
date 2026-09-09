create extension if not exists pgcrypto;

create type contribution_frequency as enum ('weekly','monthly');
create type contribution_status as enum ('pending','successful','failed');
create type payout_status as enum ('scheduled','processing','successful','failed');

create table profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, phone_e164 text unique, created_at timestamptz not null default now());
create table groups (id uuid primary key default gen_random_uuid(), name text not null, organizer_id uuid not null references profiles(id), amount_zmw numeric(12,2) not null check(amount_zmw>0), frequency contribution_frequency not null, start_date date not null, created_at timestamptz not null default now());
create table group_members (group_id uuid references groups(id) on delete cascade, user_id uuid references profiles(id) on delete cascade, payout_position int not null check(payout_position>0), joined_at timestamptz not null default now(), primary key(group_id,user_id), unique(group_id,payout_position));
create table contributions (id uuid primary key default gen_random_uuid(), group_id uuid not null references groups(id), member_id uuid not null references profiles(id), due_date date not null, amount_zmw numeric(12,2) not null check(amount_zmw>0), status contribution_status not null default 'pending', paid_at timestamptz, provider_reference text, created_at timestamptz not null default now());
create table payouts (id uuid primary key default gen_random_uuid(), group_id uuid not null references groups(id), recipient_id uuid not null references profiles(id), payout_position int not null, scheduled_date date not null, amount_zmw numeric(12,2) not null check(amount_zmw>0), status payout_status not null default 'scheduled', provider_reference text, processed_at timestamptz, created_at timestamptz not null default now(), unique(group_id,payout_position));
create table payment_events (id uuid primary key default gen_random_uuid(), provider text not null, provider_event_id text not null, provider_reference text, event_type text not null, payload jsonb not null, received_at timestamptz not null default now(), unique(provider,provider_event_id));
create table audit_logs (id uuid primary key default gen_random_uuid(), actor_id uuid references profiles(id), action text not null, entity_type text not null, entity_id uuid, metadata jsonb, created_at timestamptz not null default now());

alter table profiles enable row level security; alter table groups enable row level security; alter table group_members enable row level security; alter table contributions enable row level security; alter table payouts enable row level security; alter table payment_events enable row level security; alter table audit_logs enable row level security;

create policy profiles_self on profiles for select to authenticated using(id=auth.uid());
create policy groups_members_read on groups for select to authenticated using(organizer_id=auth.uid() or exists(select 1 from group_members gm where gm.group_id=groups.id and gm.user_id=auth.uid()));
create policy groups_create on groups for insert to authenticated with check(organizer_id=auth.uid());
create policy members_read on group_members for select to authenticated using(user_id=auth.uid() or exists(select 1 from groups g where g.id=group_members.group_id and g.organizer_id=auth.uid()));
create policy contributions_read on contributions for select to authenticated using(member_id=auth.uid() or exists(select 1 from groups g where g.id=contributions.group_id and g.organizer_id=auth.uid()));
create policy payouts_read on payouts for select to authenticated using(recipient_id=auth.uid() or exists(select 1 from groups g where g.id=payouts.group_id and g.organizer_id=auth.uid()));
