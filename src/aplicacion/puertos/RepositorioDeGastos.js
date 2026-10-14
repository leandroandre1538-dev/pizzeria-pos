/**
 * Puerto de persistencia de gastos.
 *
 * @typedef {import('../../dominio/entidades/Gasto').Gasto} Gasto
 * @typedef {import('../../dominio/valores/FechaOperativa').FechaOperativa} FechaOperativa
 */
export class RepositorioDeGastos {
  /**
   * @param {Gasto} _gasto
   * @returns {Promise<Gasto>}
   */
  async guardar(_gasto) {
    throw new Error('RepositorioDeGastos.guardar() no implementado.');
  }

  /**
   * @param {FechaOperativa} _fecha
   * @returns {Promise<Gasto[]>}
   */
  async listarPorFecha(_fecha) {
    throw new Error('RepositorioDeGastos.listarPorFecha() no implementado.');
  }

  /** @param {number|string} _id */
  async eliminar(_id) {
    throw new Error('RepositorioDeGastos.eliminar() no implementado.');
  }
}
