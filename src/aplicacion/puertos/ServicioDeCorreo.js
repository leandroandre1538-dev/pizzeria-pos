/**
 * Puerto de envio de correo.
 *
 * El caso de uso solo sabe "enviar esto a los duenos". Que sea Resend, un SMTP
 * propio o un log en consola es decision del adaptador.
 */
export class ServicioDeCorreo {
  /**
   * @param {{asunto: string, html: string}} _mensaje
   * @returns {Promise<{destinatarios: string}>}
   */
  async enviar(_mensaje) {
    throw new Error('ServicioDeCorreo.enviar() no implementado.');
  }
}

/**
 * Puerto para dejar constancia de cada intento de envio del job de medianoche.
 * Separado del envio porque son dos responsabilidades distintas: una manda el
 * correo, la otra deja el rastro para saber si llego.
 */
export class RegistroDeEnvios {
  /**
   * @param {{fecha, exito: boolean, detalle: string}} _registro
   */
  async registrar(_registro) {
    throw new Error('RegistroDeEnvios.registrar() no implementado.');
  }
}
