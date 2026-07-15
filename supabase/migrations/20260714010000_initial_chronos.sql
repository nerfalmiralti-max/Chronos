create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 60),
  avatar_url text,
  timezone text not null default 'UTC',
  locale text not null default 'ru',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  target_value numeric not null default 1 check (target_value > 0),
  current_value numeric not null default 0 check (current_value >= 0),
  unit text not null default 'ед.',
  due_date timestamptz,
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  scheduled_at timestamptz,
  duration_minutes integer not null default 25 check (duration_minutes between 1 and 1440),
  completed_at timestamptz,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  created_at timestamptz not null default now()
);

create index goals_user_id_idx on public.goals(user_id);
create index tasks_user_scheduled_idx on public.tasks(user_id, scheduled_at);
create index focus_sessions_user_started_idx on public.focus_sessions(user_id, started_at desc);

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger goals_set_updated_at before update on public.goals for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks for each row execute function public.set_updated_at();

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, timezone, locale)
  values (new.id, nullif(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), ''), 'UTC', 'ru')
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.tasks enable row level security;
alter table public.focus_sessions enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles_delete_own" on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create policy "goals_select_own" on public.goals for select to authenticated using ((select auth.uid()) = user_id);
create policy "goals_insert_own" on public.goals for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "goals_update_own" on public.goals for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "goals_delete_own" on public.goals for delete to authenticated using ((select auth.uid()) = user_id);

create policy "tasks_select_own" on public.tasks for select to authenticated using ((select auth.uid()) = user_id);
create policy "tasks_insert_own" on public.tasks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tasks_update_own" on public.tasks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tasks_delete_own" on public.tasks for delete to authenticated using ((select auth.uid()) = user_id);

create policy "focus_select_own" on public.focus_sessions for select to authenticated using ((select auth.uid()) = user_id);
create policy "focus_insert_own" on public.focus_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "focus_update_own" on public.focus_sessions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "focus_delete_own" on public.focus_sessions for delete to authenticated using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles, public.goals, public.tasks, public.focus_sessions to authenticated;
