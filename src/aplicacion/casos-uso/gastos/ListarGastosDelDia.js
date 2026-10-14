import { FechaOperativa } from '@/dominio/valores/FechaOperativa';

/** Caso de uso: ver los gastos de un dia. */
export class ListarGastosDelDia {
  constructor({ repositorioDeGastos, reloj }) {
    this.repositorioDeGastos = repositorioDeGastos;
    this.reloj = reloj;
  }

  async ejecutar(fechaIso) {
    const fecha = fechaIso ? new FechaOperativa(fechaIso) : this.reloj.hoy();
    const gastos = await this.repositorioDeGastos.listarPorFecha(fecha);
    return { fecha, gastos };
  }
}
