import { FechaOperativa } from '@/dominio/valores/FechaOperativa';
import { ResumenDiario } from '@/dominio/servicios/ResumenDiario';

/**
 * Caso de uso: armar el resumen de un dia de operacion.
 *
 * Solo coordina: junta pedidos, gastos y cierre y se los entrega al servicio
 * de dominio, que es quien hace las cuentas. Lo usan tanto la pantalla del
 * panel como el job de medianoche, asi que ambos muestran exactamente los
 * mismos numeros.
 */
export class GenerarResumenDiario {
  constructor({ repositorioDePedidos, repositorioDeGastos, repositorioDeCierres, reloj }) {
    this.repositorioDePedidos = repositorioDePedidos;
    this.repositorioDeGastos = repositorioDeGastos;
    this.repositorioDeCierres = repositorioDeCierres;
    this.reloj = reloj;
  }

  /**
   * @param {string} [fechaIso]
   * @returns {Promise<ResumenDiario>}
   */
  async ejecutar(fechaIso) {
    const fecha = fechaIso ? new FechaOperativa(fechaIso) : this.reloj.hoy();

    const [pedidos, gastos, cierre] = await Promise.all([
      this.repositorioDePedidos.listarPorFecha(fecha),
      this.repositorioDeGastos.listarPorFecha(fecha),
      this.repositorioDeCierres.buscarPorFecha(fecha),
    ]);

    return new ResumenDiario({ fecha, pedidos, gastos, cierre });
  }
}
