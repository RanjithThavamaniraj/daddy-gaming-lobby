-- 16-team knockout needs a Round of 16 stage. The hub already titles
-- `round_of_16` as "Round of 16"; the enum was missing that label.
-- Must commit before any migration uses the new value.

do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'dgl_fixture_stage'
      and e.enumlabel = 'round_of_16'
  ) then
    alter type public.dgl_fixture_stage add value 'round_of_16';
  end if;
end $$;
