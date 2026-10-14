import { FechaOperativa } from '@/dominio/valores/FechaOperativa';

/**
 * Caso de uso: ver los pedidos de un dia.
 * Sin fecha, muestra los de hoy.
 */
export class ListarPedidosDelDia {
  constructor({ repositorioDePedidos, reloj }) {
    this.repositorioDePedidos = repositorioDePedidos;
    this.reloj = reloj;
  }

  async ejecutar(fechaIso) {
    const fecha = fechaIso ? new FechaOperativa(fechaIso) : this.reloj.hoy();
    const pedidos = await this.repositorioDePedidos.listarPorFecha(fecha);
    return { fecha, pedidos };
  }
}
