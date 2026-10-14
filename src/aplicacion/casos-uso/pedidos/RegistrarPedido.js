import { Pedido, CanalPedido } from '@/dominio/entidades/Pedido';
import { LineaPedido, Adicional } from '@/dominio/entidades/LineaPedido';
import { FormasDePago } from '@/dominio/valores/FormasDePago';
import { Dinero } from '@/dominio/valores/Dinero';

/**
 * Caso de uso: la cajera cierra un pedido.
 *
 * Es el flujo central del sistema. Lo que hace:
 *   1. Traduce lo que llego del navegador a objetos del dominio.
 *   2. Recupera la promocion elegida para revalidar su vigencia en el servidor.
 *   3. Deja que el agregado Pedido calcule subtotal, descuento y total.
 *   4. Pide el correlativo del dia y guarda.
 *
 * El precio que manda el navegador se respeta (la cajera puede editarlo), pero
 * el total nunca: lo recalcula el dominio. Y la promocion se revalida aca
 * aunque la interfaz ya la haya mostrado, porque una promo pudo vencer
 * mientras se tomaba el pedido.
 */
export class RegistrarPedido {
  constructor({ repositorioDePedidos, repositorioDePromociones, reloj }) {
    this.repositorioDePedidos = repositorioDePedidos;
    this.repositorioDePromociones = repositorioDePromociones;
    this.reloj = reloj;
  }

  /**
   * @param {object} entrada  datos crudos del formulario de caja
   * @param {string} atendidoPor
   */
  async ejecutar(entrada, atendidoPor = '') {
    const fecha = this.reloj.hoy();

    const lineas = (entrada.items || []).map((item) => this.#armarLinea(item));
    const promocion = await this.#buscarPromocion(entrada.promocion_id);

    const pedido = Pedido.registrar({
      fecha,
      correlativo: await this.repositorioDePedidos.siguienteCorrelativo(fecha),
      lineas,
      promocion,
      formasDePago: new FormasDePago({
        efectivo: Dinero.deSoles(entrada.efectivo || 0),
        yape: Dinero.deSoles(entrada.yape || 0),
        plin: Dinero.deSoles(entrada.plin || 0),
      }),
      cliente: entrada.cliente || '',
      telefono: entrada.telefono || '',
      canal: entrada.canal === CanalPedido.LOCAL ? CanalPedido.LOCAL : CanalPedido.DELIVERY,
      direccion: entrada.direccion || '',
      nota: entrada.nota || '',
      atendidoPor,
    });

    return this.repositorioDePedidos.guardar(pedido);
  }

  #armarLinea(item) {
    return new LineaPedido({
      productoId: item.producto_id,
      varianteId: item.variante_id,
      nombreProducto: item.nombre_producto,
      nombreVariante: item.nombre_variante,
      tipo: item.tipo,
      pizzasEquivalentes: item.pizzas_equivalentes,
      cantidad: parseInt(item.cantidad, 10) || 1,
      precioLista: Dinero.deSoles(item.precio_lista),
      precioUnitario: Dinero.deSoles(item.precio_unitario),
      adicionales: (item.extras || []).map(
        (extra) => new Adicional(extra.nombre, Dinero.deSoles(extra.precio))
      ),
      motivoEdicion: item.motivo_edicion || '',
      nota: item.nota || '',
    });
  }

  async #buscarPromocion(id) {
    if (!id) return null;
    return this.repositorioDePromociones.buscarPorId(id);
  }
}
