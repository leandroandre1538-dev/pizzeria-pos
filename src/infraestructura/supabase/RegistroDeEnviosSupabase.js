import { RegistroDeEnvios } from '@/aplicacion/puertos/ServicioDeCorreo';
import { clienteSupabase, resultado } from './ClienteSupabase';

/**
 * Bitacora de los correos del job de medianoche.
 * Permite responder "se envio el resumen del sabado?" sin adivinar.
 */
export class RegistroDeEnviosSupabase extends RegistroDeEnvios {
  #sb;

  constructor(cliente = clienteSupabase()) {
    super();
    this.#sb = cliente;
  }

  async registrar({ fecha, exito, detalle }) {
    resultado(
      await this.#sb
        .from('resumenes_enviados')
        .insert({ fecha: fecha.iso, exito, detalle }),
      'No se pudo registrar el envio'
    );
  }
}
