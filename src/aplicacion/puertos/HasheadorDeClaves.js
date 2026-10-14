/**
 * Puerto de cifrado de claves.
 *
 * Aislarlo permite cambiar el algoritmo (hoy SHA-256, manana bcrypt o argon2)
 * tocando un solo archivo, sin que ningun caso de uso se entere.
 */
export class HasheadorDeClaves {
  /**
   * @param {string} _usuario  se mezcla con la clave para que dos usuarios con
   *                           la misma clave no compartan el mismo hash
   * @param {string} _clave
   * @returns {string}
   */
  calcular(_usuario, _clave) {
    throw new Error('HasheadorDeClaves.calcular() no implementado.');
  }

  /** Comparacion resistente a ataques de tiempo. */
  coincide(_usuario, _clave, _hashGuardado) {
    throw new Error('HasheadorDeClaves.coincide() no implementado.');
  }
}
