/**
 * Caso de uso: enviar al dueno el resumen de un dia.
 *
 * Lo dispara el job de medianoche y tambien el boton "Enviar por correo" del
 * panel. Deja constancia del intento, haya salido bien o mal, para que se
 * pueda revisar si el correo llego.
 *
 * El armado del HTML esta detras de una dependencia inyectada: este caso de
 * uso no sabe si el correo es HTML, texto plano o un mensaje de WhatsApp.
 */
export class EnviarResumenDiario {
  constructor({ generarResumenDiario, servicioDeCorreo, armadorDeCorreo, registroDeEnvios }) {
    this.generarResumenDiario = generarResumenDiario;
    this.servicioDeCorreo = servicioDeCorreo;
    this.armadorDeCorreo = armadorDeCorreo;
    this.registroDeEnvios = registroDeEnvios;
  }

  /**
   * @param {string} fechaIso
   * @param {{motivo?: string}} opciones
   */
  async ejecutar(fechaIso, { motivo = 'automatico' } = {}) {
    const resumen = await this.generarResumenDiario.ejecutar(fechaIso);
    const mensaje = this.armadorDeCorreo.armar(resumen, { motivo });

    try {
      const { destinatarios } = await this.servicioDeCorreo.enviar(mensaje);
      await this.#dejarConstancia(resumen.fecha, true, `Enviado a ${destinatarios}`);
      return { fecha: resumen.fecha, destinatarios };
    } catch (error) {
      await this.#dejarConstancia(resumen.fecha, false, error.message);
      throw error;
    }
  }

  /** Que falle la bitacora nunca debe tapar el resultado real del envio. */
  async #dejarConstancia(fecha, exito, detalle) {
    try {
      await this.registroDeEnvios.registrar({ fecha, exito, detalle });
    } catch {
      /* se ignora a proposito */
    }
  }
}
