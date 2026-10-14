import { ErrorDeValidacion } from '@/dominio/errores/ErroresDominio';

/**
 * Caso de uso: anular un pedido mal tomado.
 *
 * No se borra nunca: queda marcado como anulado para que el dueno vea que
 * existio. Los pedidos anulados no suman en el resumen del dia.
 */
export class AnularPedido {
  constructor({ repositorioDePedidos }) {
    this.repositorioDePedidos = repositorioDePedidos;
  }

  async ejecutar(id) {
    if (!id) throw new ErrorDeValidacion('Falta el pedido a anular.');
    await this.repositorioDePedidos.anular(id);
  }
}
