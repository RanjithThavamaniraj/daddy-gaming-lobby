-- Updates the FC 26 Championship #2 prize pool display from ₹2,000 to ₹3,000.

begin;

update public.tournaments
set prize_pool_display = '₹3,000'
where external_id = 'dgl-fc26-championship-2';

commit;
