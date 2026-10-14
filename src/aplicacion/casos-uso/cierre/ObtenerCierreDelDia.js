import { FechaOperativa } from '@/dominio/valores/FechaOperativa';

/** Caso de uso: recuperar el cierre de caja de un dia (o null si no existe). */
export class ObtenerCierreDelDia {
  constructor({ repositorioDeCierres, reloj }) {
    this.repositorioDeCierres = repositorioDeCierres;
    this.reloj = reloj;
  }

  async ejecutar(fechaIso) {
    const fecha = fechaIso ? new FechaOperativa(fechaIso) : this.reloj.hoy();
    const cierre = await this.repositorioDeCierres.buscarPorFecha(fecha);
    return { fecha, cierre };
  }
}
