-- Removes the QA registration row created while verifying the Rocket
-- League registration flow (2v2 team registration, Epic ID, rank, teammate
-- fields) end-to-end against production. Test data only — not a real
-- registrant.

begin;

delete from public.tournament_registrations
where id = '2b24cb0d-6c4c-4f63-81a0-0621be446d31';

commit;
