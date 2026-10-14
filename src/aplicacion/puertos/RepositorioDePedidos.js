/**
 * Puerto de persistencia de pedidos.
 *
 * @typedef {import('../../dominio/entidades/Pedido').Pedido} Pedido
 * @typedef {import('../../dominio/valores/FechaOperativa').FechaOperativa} FechaOperativa
 */
export class RepositorioDePedidos {
  /**
   * @param {Pedido} _pedido
   * @returns {Promise<Pedido>} el pedido ya con su id asignado
   */
  async guardar(_pedido) {
    throw new Error('RepositorioDePedidos.guardar() no implementado.');
  }

  /**
   * @param {FechaOperativa} _fecha
   * @returns {Promise<Pedido[]>} incluye los anulados, para que la cajera los vea
   */
  async listarPorFecha(_fecha) {
    throw new Error('RepositorioDePedidos.listarPorFecha() no implementado.');
  }

  /**
   * Numero que le toca al siguiente pedido del dia.
   * @param {FechaOperativa} _fecha
   * @returns {Promise<number>}
   */
  async siguienteCorrelativo(_fecha) {
    throw new Error('RepositorioDePedidos.siguienteCorrelativo() no implementado.');
  }

  /**
   * Unidades vendidas de cada producto desde una fecha (incluida), sin contar
   * los pedidos anulados. Sirve para mostrar primero lo que mas se pide.
   * @param {FechaOperativa} _desde
   * @returns {Promise<Map<number, number>>} producto_id -> unidades
   */
  async contarVendidosPorProducto(_desde) {
    throw new Error('RepositorioDePedidos.contarVendidosPorProducto() no implementado.');
  }

  /** @param {number|string} _id */
  async anular(_id) {
    throw new Error('RepositorioDePedidos.anular() no implementado.');
  }
}
