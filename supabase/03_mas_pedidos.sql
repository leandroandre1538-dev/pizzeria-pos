-- =====================================================================
--  Ordenar la carta por lo mas pedido.
--  Solo hace falta si tu base se creo ANTES de este cambio: ejecutalo una
--  vez en Supabase > SQL Editor > New query. (01_schema.sql ya lo incluye.)
-- =====================================================================
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
