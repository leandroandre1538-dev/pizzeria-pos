/**
 * Puerto de persistencia del cierre de caja.
 *
 * @typedef {import('../../dominio/entidades/CierreCaja').CierreCaja} CierreCaja
 * @typedef {import('../../dominio/valores/FechaOperativa').FechaOperativa} FechaOperativa
 */
export class RepositorioDeCierres {
  /**
   * @param {FechaOperativa} _fecha
   * @returns {Promise<CierreCaja|null>}
   */
  async buscarPorFecha(_fecha) {
    throw new Error('RepositorioDeCierres.buscarPorFecha() no implementado.');
  }

  /**
   * Crea el cierre o actualiza el del dia: la cajera puede ir guardando
   * avances antes de confirmar.
   * @param {CierreCaja} _cierre
   * @returns {Promise<CierreCaja>}
   */
  async guardar(_cierre) {
    throw new Error('RepositorioDeCierres.guardar() no implementado.');
  }
}
