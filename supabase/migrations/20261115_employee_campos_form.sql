-- 2026-11-15: la UI de empleadas guarda en employees los campos que antes solo existian en assignments.
-- Sin esto, el POST /rest/v1/employees?select=* respondia 400 PGRST204:
-- "Could not find the 'categoria' column of 'employees' in the schema cache".
alter table employees add column if not exists categoria text;
alter table employees add column if not exists con_retiro boolean not null default true;
alter table employees add column if not exists horas_dia numeric default 4;
alter table employees add column if not exists dias_semana jsonb not null default '[]'::jsonb;
alter table employees add column if not exists valor_hora_override numeric;
alter table employees add column if not exists valor_mensual_override numeric;
