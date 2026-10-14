import { RepositorioDePedidos } from '@/aplicacion/puertos/RepositorioDePedidos';
import { MapeadorDePedido } from '../filas/MapeadorDePedido';

/** Adaptador de salida: pedidos en memoria (modo local). */
export class RepositorioDePedidosEnMemoria extends RepositorioDePedidos {
  #base;

  constructor(base) {
    super();
    this.#base = base;
  }

  async guardar(pedido) {
    const cabecera = this.#base.insertar('pedidos', {
      ...MapeadorDePedido.aFilaDePedido(pedido),
      anulado: false,
    });

    for (const linea of MapeadorDePedido.aFilasDeLineas(pedido, cabecera.id)) {
      this.#base.insertar('pedido_items', linea);
    }

    pedido.id = cabecera.id;
    return pedido;
  }

  async listarPorFecha(fecha) {
    return this.#base
      .filtrar('pedidos', (p) => p.fecha === fecha.iso)
      .sort((a, b) => b.correlativo - a.correlativo)
      .map((cabecera) => ({
        ...cabecera,
        pedido_items: this.#base.filtrar('pedido_items', (i) => i.pedido_id === cabecera.id),
      }))
      .map(MapeadorDePedido.aDominio);
  }

  async siguienteCorrelativo(fecha) {
    const delDia = this.#base.filtrar('pedidos', (p) => p.fecha === fecha.iso);
    return delDia.reduce((mayor, p) => Math.max(mayor, p.correlativo), 0) + 1;
  }

  async contarVendidosPorProducto(desde) {
    const pedidosValidos = new Set(
      this.#base
        .filtrar('pedidos', (p) => !p.anulado && p.fecha >= desde.iso)
        .map((p) => p.id)
    );

    const vendidos = new Map();
    for (const linea of this.#base.filtrar('pedido_items', (i) => pedidosValidos.has(i.pedido_id))) {
      if (linea.producto_id == null) continue;
      vendidos.set(linea.producto_id, (vendidos.get(linea.producto_id) || 0) + linea.cantidad);
    }
    return vendidos;
  }

  async anular(id) {
    this.#base.actualizar('pedidos', (p) => p.id === Number(id), { anulado: true });
  }
}
