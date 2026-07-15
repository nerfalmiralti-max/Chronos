begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

select ok((select count(*) = 4 from pg_policies where schemaname = 'public' and tablename = 'profiles'), 'profiles has four explicit policies');
select ok((select count(*) = 4 from pg_policies where schemaname = 'public' and tablename = 'goals'), 'goals has four explicit policies');
select ok((select count(*) = 4 from pg_policies where schemaname = 'public' and tablename = 'tasks'), 'tasks has four explicit policies');
select ok((select count(*) = 4 from pg_policies where schemaname = 'public' and tablename = 'focus_sessions'), 'focus sessions has four explicit policies');

select ok(
  not has_table_privilege('anon', 'public.profiles', 'select')
  and not has_table_privilege('anon', 'public.goals', 'select')
  and not has_table_privilege('anon', 'public.tasks', 'select'),
  'anonymous users cannot read Chronos data'
);

select * from finish();
rollback;

-- Cross-user behavior is also verified in CI with two confirmed Auth users:
-- user A receives zero rows for B, and UPDATE/DELETE/forged user_id INSERT affect zero rows.
