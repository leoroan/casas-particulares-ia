-- Casas Particulares IA - Esquema Supabase
-- SIN políticas RLS y SIN funciones RPC.
-- El aislamiento de datos por usuario se hace filtrando por user_id en TODAS las consultas
-- desde los servicios de API de la aplicación (src/features/*/api.js).

-- helper: trigger de updated_at
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table profiles (
  id uuid references auth.users not null primary key,
  nombre text,
  cuit text,
  domicilio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table houses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  alias text not null,
  direccion text,
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table employees (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  nombre text not null,
  cuil text,
  fecha_ingreso date,
  activo boolean default true,
  zona_desfavorable boolean default false,
  categoria text,
  con_retiro boolean default true,
  horas_dia numeric default 4,
  dias_semana jsonb default '[]'::jsonb,
  valor_hora_override numeric,
  valor_mensual_override numeric,
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table assignments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  employee_id uuid not null references employees(id) on delete cascade,
  house_id uuid not null references houses(id) on delete cascade,
  dias_semana jsonb not null default '[]'::jsonb,
  horas_dia numeric default 4,
  categoria text not null,
  con_retiro boolean not null default true,
  valor_hora_override numeric,
  valor_mensual_override numeric,
  viatico_habilitado boolean not null default false,
  valor_viaje numeric default 0,
  viajes_por_dia integer not null default 2,
  modalidad_override text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create table salary_scales (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  vigencia_desde date not null,
  categoria text not null,
  con_retiro boolean not null default true,
  valor_hora numeric not null default 0,
  valor_mensual numeric not null default 0,
  fuente text,
  created_at timestamptz default now(),
  unique (user_id, vigencia_desde, categoria, con_retiro)
);

create table contribution_rates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  vigencia_desde date not null,
  tramo text not null check (tramo in ('hasta12','12a16','mas16')),
  aportes numeric not null default 0,
  contribuciones numeric not null default 0,
  art numeric not null default 0,
  fuente text,
  created_at timestamptz default now(),
  unique (user_id, vigencia_desde, tramo)
);

create table holidays (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  fecha date not null,
  descripcion text not null,
  created_at timestamptz default now()
);

create table settlements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  employee_id uuid not null references employees(id) on delete cascade,
  periodo date not null,
  estado text not null default 'borrador' check (estado in ('borrador','cerrada')),
  inputs jsonb not null default '{}'::jsonb,
  breakdown jsonb not null default '{}'::jsonb,
  total numeric not null default 0,
  neto numeric not null default 0,
  cerrada_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (employee_id, periodo)
);

create table settlement_lines (
  id uuid default gen_random_uuid() primary key,
  settlement_id uuid not null references settlements(id) on delete cascade,
  house_id uuid not null references houses(id) on delete cascade,
  breakdown jsonb not null default '{}'::jsonb,
  subtotal numeric not null default 0
);

create table leaves (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  employee_id uuid not null references employees(id) on delete cascade,
  tipo text not null check (tipo in ('vacaciones','enfermedad','maternidad','especial')),
  desde date not null,
  hasta date not null,
  dias integer not null default 0,
  pagada boolean not null default true,
  notas text,
  created_at timestamptz default now()
);

create table settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique,
  datos jsonb not null default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- Índices para aislamiento y consultas por usuario
create index idx_profiles_id on profiles(id);
create index idx_houses_user_id on houses(user_id);
create index idx_employees_user_id on employees(user_id);
create index idx_employees_activo on employees(user_id, activo);
create index idx_assignments_user_id on assignments(user_id);
create index idx_assignments_employee on assignments(employee_id);
create index idx_salary_scales_user_id on salary_scales(user_id);
create index idx_salary_scales_vigencia on salary_scales(user_id, vigencia_desde);
create index idx_contribution_rates_user_id on contribution_rates(user_id);
create index idx_holidays_user_id on holidays(user_id);
create index idx_holidays_fecha on holidays(fecha);
create index idx_settlements_user_id on settlements(user_id);
create index idx_settlements_employee on settlements(employee_id);
create index idx_settlements_periodo on settlements(user_id, periodo);
create index idx_settlement_lines_settlement on settlement_lines(settlement_id);
create index idx_leaves_user_id on leaves(user_id);
create index idx_leaves_employee on leaves(employee_id);
create index idx_settings_user_id on settings(user_id);

-- Triggers updated_at en todas las tablas con esa columna
do $$
declare t text;
begin
  for t in (
    select tablename from pg_tables where schemaname='public'
      and tablename in ('profiles','houses','employees','assignments','salary_scales','contribution_rates','holidays','settlements','settlement_lines','leaves','settings')
  ) loop
    execute format('create trigger %I_updated_at before update on %I for each row execute function set_updated_at()', t || '_trg', t);
  end loop;
end $$;