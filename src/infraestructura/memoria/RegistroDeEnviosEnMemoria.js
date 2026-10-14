import { RegistroDeEnvios } from '@/aplicacion/puertos/ServicioDeCorreo';

/** Bitacora de envios del resumen, en memoria (modo local). */
export class RegistroDeEnviosEnMemoria extends RegistroDeEnvios {
  #base;

  constructor(base) {
    super();
    this.#base = base;
  }

  async registrar({ fecha, exito, detalle }) {
    this.#base.insertar('resumenes_enviados', { fecha: fecha.iso, exito, detalle });
  }
}
