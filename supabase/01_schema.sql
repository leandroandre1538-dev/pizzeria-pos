-- =====================================================================
--  MAROCCHINO'S PIZZERIA - Esquema de base de datos (Supabase/Postgres)
--  Ejecutar este archivo COMPLETO en: Supabase > SQL Editor > New query
-- =====================================================================

-- Limpieza (por si se vuelve a ejecutar)
drop table if exists resumenes_enviados cascade;
drop table if exists cierres_dia       cascade;
drop table if exists gastos            cascade;
drop table if exists pedido_items      cascade;
drop table if exists pedidos           cascade;
drop table if exists promociones       cascade;
drop table if exists extras            cascade;
drop table if exists variantes         cascade;
drop table if exists productos         cascade;
drop table if exists categorias        cascade;
drop table if exists usuarios          cascade;

-- ---------------------------------------------------------------------
-- Usuarios (solo el perfil ADMIN necesita clave; la cajera entra directo)
-- ---------------------------------------------------------------------
create table usuarios (
  id            bigserial primary key,
  usuario       text not null unique,
  password_hash text not null,            -- sha256(usuario + ':' + clave)
  nombre        text not null,
  rol           text not null default 'admin',
  activo        boolean not null default true,
  creado_en     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Carta
-- ---------------------------------------------------------------------
create table categorias (
  id      bigserial primary key,
  nombre  text not null,
  orden   int  not null default 0,
  activo  boolean not null default true
);

create table productos (
  id           bigserial primary key,
  categoria_id bigint references categorias(id) on delete set null,
  nombre       text not null,
  descripcion  text default '',
  -- 'pizza'  -> cuenta para el conteo de pizzas vendidas del dia
  -- 'simple' -> bebidas, pan al ajo, etc.
  -- 'combo'  -> promos fijas de la carta
  tipo         text not null default 'simple',
  -- cuantas pizzas equivale (para combos: 1, 2, 3...)
  pizzas_equivalentes numeric(6,2) not null default 0,
  permite_extras boolean not null default false,
  activo       boolean not null default true,
  orden        int not null default 0,
  creado_en    timestamptz not null default now()
);

-- Presentaciones: personal / compartida / familiar, o "unico" para bebidas
create table variantes (
  id          bigserial primary key,
  producto_id bigint not null references productos(id) on delete cascade,
  nombre      text not null,
  precio      numeric(10,2) not null,
  activo      boolean not null default true,
  orden       int not null default 0
);

create table extras (
  id     bigserial primary key,
  nombre text not null,
  precio numeric(10,2) not null,
  activo boolean not null default true,
  orden  int not null default 0
);

-- ---------------------------------------------------------------------
-- Promociones con VIGENCIA (1 dia o mas)
-- ---------------------------------------------------------------------
create table promociones (
  id            bigserial primary key,
  nombre        text not null,
  descripcion   text default '',
  -- 'porcentaje' = % de descuento | 'monto' = S/ fijo de descuento
  tipo          text not null default 'porcentaje',
  valor         numeric(10,2) not null default 0,
  monto_minimo  numeric(10,2) not null default 0,   -- se aplica desde este subtotal
  fecha_inicio  date not null,
  fecha_fin     date not null,                       -- misma fecha = promo de 1 dia
  -- dias de la semana donde aplica: 1=Lun ... 7=Dom. Vacio = todos los dias
  dias_semana   int[] not null default '{}',
  activo        boolean not null default true,
  creado_en     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Pedidos
-- ---------------------------------------------------------------------
create table pedidos (
  id             bigserial primary key,
  fecha          date not null,                       -- fecha operativa (Lima)
  correlativo    int  not null,                       -- #1, #2... por dia
  cliente        text default '',
  telefono       text default '',
  canal          text not null default 'delivery',    -- delivery | local
  direccion      text default '',
  subtotal       numeric(10,2) not null default 0,
  descuento      numeric(10,2) not null default 0,
  total          numeric(10,2) not null default 0,
  promocion_id   bigint references promociones(id) on delete set null,
  promocion_nombre text default '',
  efectivo       numeric(10,2) not null default 0,
  yape           numeric(10,2) not null default 0,
  plin           numeric(10,2) not null default 0,
  nota           text default '',
  anulado        boolean not null default false,
  atendido_por   text default 'cajera',
  creado_en      timestamptz not null default now(),
  unique (fecha, correlativo)
);

create table pedido_items (
  id               bigserial primary key,
  pedido_id        bigint not null references pedidos(id) on delete cascade,
  producto_id      bigint references productos(id) on delete set null,
  variante_id      bigint references variantes(id) on delete set null,
  nombre_producto  text not null,
  nombre_variante  text not null default '',
  tipo             text not null default 'simple',
  pizzas_equivalentes numeric(6,2) not null default 0,
  cantidad         int not null default 1,
  precio_lista     numeric(10,2) not null default 0,   -- precio original de la carta
  precio_unitario  numeric(10,2) not null default 0,   -- precio final (puede ser editado)
  precio_editado   boolean not null default false,
  motivo_edicion   text default '',
  extras           jsonb not null default '[]'::jsonb, -- [{nombre, precio}]
  extras_total     numeric(10,2) not null default 0,
  total_linea      numeric(10,2) not null default 0,
  nota             text default ''
);

-- ---------------------------------------------------------------------
-- Gastos del dia
-- ---------------------------------------------------------------------
create table gastos (
  id           bigserial primary key,
  fecha        date not null,
  descripcion  text not null,
  categoria    text not null default 'insumos',  -- insumos | personal | servicios | delivery | otros
  monto        numeric(10,2) not null,
  metodo_pago  text not null default 'efectivo', -- efectivo | yape | plin
  registrado_por text default 'cajera',
  creado_en    timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Cierre de caja del dia (lo llena la cajera al terminar)
-- ---------------------------------------------------------------------
create table cierres_dia (
  id                  bigserial primary key,
  fecha               date not null unique,
  dinero_inicial      numeric(10,2) not null default 0,
  dinero_final        numeric(10,2) not null default 0,
  masas_restantes     int not null default 0,
  dejo_harina         boolean not null default false,
  harina_kg           numeric(10,2) not null default 0,
  observaciones       text default '',
  cerrado_por         text default 'cajera',
  cerrado             boolean not null default false,
  creado_en           timestamptz not null default now(),
  actualizado_en      timestamptz not null default now()
);

-- Log de correos enviados por el job de medianoche
create table resumenes_enviados (
  id         bigserial primary key,
  fecha      date not null,
  enviado_en timestamptz not null default now(),
  exito      boolean not null default true,
  detalle    text default ''
);

-- ---------------------------------------------------------------------
-- Indices
-- ---------------------------------------------------------------------
create index idx_pedidos_fecha        on pedidos(fecha);
create index idx_pedido_items_pedido  on pedido_items(pedido_id);
create index idx_gastos_fecha         on gastos(fecha);
create index idx_variantes_producto   on variantes(producto_id);
create index idx_productos_categoria  on productos(categoria_id);
create index idx_promos_vigencia      on promociones(fecha_inicio, fecha_fin);

-- ---------------------------------------------------------------------
-- Seguridad: toda la app entra por el backend con la service_role key,
-- asi que dejamos RLS activo y SIN politicas publicas.
-- ---------------------------------------------------------------------
alter table usuarios           enable row level security;
alter table categorias         enable row level security;
alter table productos          enable row level security;
alter table variantes          enable row level security;
alter table extras             enable row level security;
alter table promociones        enable row level security;
alter table pedidos            enable row level security;
alter table pedido_items       enable row level security;
alter table gastos             enable row level security;
alter table cierres_dia        enable row level security;
alter table resumenes_enviados enable row level security;

-- ---------------------------------------------------------------------
-- Funcion: siguiente correlativo del dia (evita numeros repetidos)
-- ---------------------------------------------------------------------
create or replace function siguiente_correlativo(p_fecha date)
returns int
language plpgsql
as $$
declare
  v_next int;
begin
  select coalesce(max(correlativo), 0) + 1 into v_next
  from pedidos where fecha = p_fecha;
  return v_next;
end;
$$;

-- ---------------------------------------------------------------------
-- Funcion: unidades vendidas por producto desde una fecha (sin anulados).
-- La caja la usa para mostrar primero lo mas pedido.
-- ---------------------------------------------------------------------
create or replace function productos_mas_pedidos(p_desde date)
returns table (producto_id bigint, unidades bigint)
language sql
stable
as $$
  select i.producto_id, sum(i.cantidad)::bigint as unidades
  from pedido_items i
  join pedidos p on p.id = i.pedido_id
  where not p.anulado
    and p.fecha >= p_desde
    and i.producto_id is not null
  group by i.producto_id;
$$;
