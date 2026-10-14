/**
 * Puerto de persistencia de promociones.
 *
 * @typedef {import('../../dominio/entidades/Promocion').Promocion} Promocion
 * @typedef {import('../../dominio/valores/FechaOperativa').FechaOperativa} FechaOperativa
 */
export class RepositorioDePromociones {
  /** @returns {Promise<Promocion[]>} todas, incluso vencidas y desactivadas */
  async listarTodas() {
    throw new Error('RepositorioDePromociones.listarTodas() no implementado.');
  }

  /**
   * Promociones que podrian aplicarse en esa fecha.
   * El filtro por dia de la semana y monto minimo lo hace el dominio.
   * @param {FechaOperativa} _fecha
   * @returns {Promise<Promocion[]>}
   */
  async listarVigentesEn(_fecha) {
    throw new Error('RepositorioDePromociones.listarVigentesEn() no implementado.');
  }

  /**
   * @param {number|string} _id
   * @returns {Promise<Promocion|null>}
   */
  async buscarPorId(_id) {
    throw new Error('RepositorioDePromociones.buscarPorId() no implementado.');
  }

  async guardar(_promocion) {
    throw new Error('RepositorioDePromociones.guardar() no implementado.');
  }

  async actualizar(_id, _cambios) {
    throw new Error('RepositorioDePromociones.actualizar() no implementado.');
  }

  async eliminar(_id) {
    throw new Error('RepositorioDePromociones.eliminar() no implementado.');
  }
}
