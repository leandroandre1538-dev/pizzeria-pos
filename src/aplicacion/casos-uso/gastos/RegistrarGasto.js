import { Gasto } from '@/dominio/entidades/Gasto';
import { Dinero } from '@/dominio/valores/Dinero';

/**
 * Caso de uso: anotar una salida de dinero del dia.
 * La validacion (descripcion, monto positivo, medio de pago) vive en la
 * entidad Gasto, no aqui.
 */
export class RegistrarGasto {
  constructor({ repositorioDeGastos, reloj }) {
    this.repositorioDeGastos = repositorioDeGastos;
    this.reloj = reloj;
  }

  async ejecutar(entrada, registradoPor = '') {
    const gasto = new Gasto({
      fecha: this.reloj.hoy(),
      descripcion: entrada.descripcion,
      categoria: entrada.categoria,
      monto: Dinero.deSoles(entrada.monto),
      medioDePago: entrada.metodo_pago,
      registradoPor,
    });

    return this.repositorioDeGastos.guardar(gasto);
  }
}
