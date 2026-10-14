/**
 * Errores propios del dominio.
 *
 * Se distinguen de los errores tecnicos (red, base de datos) para que la capa
 * de entrada sepa cuando responder 400 (el usuario se equivoco) y cuando 500
 * (fallo el sistema).
 */

export class ErrorDominio extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorDominio';
  }
}

/** El dato que llego no cumple una regla de negocio. */
export class ErrorDeValidacion extends ErrorDominio {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorDeValidacion';
  }
}

/** Se pidio algo que no existe. */
export class ErrorNoEncontrado extends ErrorDominio {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorNoEncontrado';
  }
}

/** El usuario no tiene permiso para esta operacion. */
export class ErrorDeAutorizacion extends ErrorDominio {
  constructor(mensaje) {
    super(mensaje);
    this.name = 'ErrorDeAutorizacion';
  }
}
