import { RepositorioDePedidos } from '@/aplicacion/puertos/RepositorioDePedidos';
import { clienteSupabase, resultado } from './ClienteSupabase';
import { MapeadorDePedido } from '../filas/MapeadorDePedido';

/** Adaptador de salida: pedidos sobre Supabase/Postgres. */
export class RepositorioDePedidosSupabase extends RepositorioDePedidos {
  #sb;

  constructor(cliente = clienteSupabase()) {
    super();
    this.#sb = cliente;
  }

  async guardar(pedido) {
    const cabecera = resultado(
      await this.#sb
        .from('pedidos')
        .insert(MapeadorDePedido.aFilaDePedido(pedido))
        .select()
        .single(),
      'No se pudo guardar el pedido'
    );

    try {
      resultado(
        await this.#sb
          .from('pedido_items')
          .insert(MapeadorDePedido.aFilasDeLineas(pedido, cabecera.id)),
        'No se pudieron guardar los productos del pedido'
      );
    } catch (error) {
      // Sin transacciones desde el cliente: si fallan las lineas, se borra la
      // cabecera para no dejar un pedido vacio en el listado del dia.
      await this.#sb.from('pedidos').delete().eq('id', cabecera.id);
      throw error;
    }

    pedido.id = cabecera.id;
    return pedido;
  }

  async listarPorFecha(fecha) {
    const filas = resultado(
      await this.#sb
        .from('pedidos')
        .select('*, pedido_items(*)')
        .eq('fecha', fecha.iso)
        .order('correlativo', { ascending: false }),
      'No se pudieron leer los pedidos'
    );

    return (filas || []).map(MapeadorDePedido.aDominio);
  }

  async siguienteCorrelativo(fecha) {
    const fila = resultado(
      await this.#sb
        .from('pedidos')
        .select('correlativo')
        .eq('fecha', fecha.iso)
        .order('correlativo', { ascending: false })
        .limit(1)
        .maybeSingle(),
      'No se pudo calcular el numero de pedido'
    );

    return (fila?.correlativo || 0) + 1;
  }

  async contarVendidosPorProducto(desde) {
    // La suma se hace en Postgres (funcion `productos_mas_pedidos`): traer las
    // lineas al servidor chocaria con el limite de 1000 filas de Supabase.
    const { data, error } = await this.#sb.rpc('productos_mas_pedidos', { p_desde: desde.iso });

    // Si la base todavia no tiene la funcion, la carta sale en su orden por
    // defecto en lugar de dejar a la cajera sin poder tomar pedidos.
    if (error) {
      console.warn(`No se pudo calcular lo mas pedido: ${error.message}`);
      return new Map();
    }

    return new Map((data || []).map((fila) => [Number(fila.producto_id), Number(fila.unidades)]));
  }

  async anular(id) {
    resultado(
      await this.#sb.from('pedidos').update({ anulado: true }).eq('id', id),
      'No se pudo anular el pedido'
    );
  }
}
