-- IMPORTAR JUGADORES DEL EXCEL Calendario_Sesiones_2026-2027.xlsx
-- El número situado delante del nombre se utiliza como dorsal.

delete from public.players
where team_id='11111111-1111-1111-1111-111111111111'
  and number in (1,3,4,5,6,7,8,9,10,11,12,13,14);

insert into public.players
  (team_id,number,name,start_date,active)
values
  ('11111111-1111-1111-1111-111111111111',1,'Guillermo Martin','2026-09-01',true),
  ('11111111-1111-1111-1111-111111111111',13,'Leo Sanchez','2026-09-01',true),
  ('11111111-1111-1111-1111-111111111111',3,'David','2026-09-01',true),
  ('11111111-1111-1111-1111-111111111111',4,'Pablo Peral','2026-09-01',true),
  ('11111111-1111-1111-1111-111111111111',5,'Fernando','2026-09-01',true),
  ('11111111-1111-1111-1111-111111111111',6,'Guille Zazo','2026-09-01',true),
  ('11111111-1111-1111-1111-111111111111',7,'Lucas Encabo','2026-09-01',true),
  ('11111111-1111-1111-1111-111111111111',8,'Jose Herrera','2026-09-01',true),
  ('11111111-1111-1111-1111-111111111111',9,'Alonso','2026-09-01',true),
  ('11111111-1111-1111-1111-111111111111',10,'Pablo Vallejo','2026-09-01',true),
  ('11111111-1111-1111-1111-111111111111',11,'Manuel','2026-09-01',true),
  ('11111111-1111-1111-1111-111111111111',12,'Alejandro Nieves','2026-09-01',true),
  ('11111111-1111-1111-1111-111111111111',14,'Miguel Sanchez','2026-09-01',true);

select number,name,active
from public.players
where team_id='11111111-1111-1111-1111-111111111111'
order by number;
