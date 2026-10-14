/**
 * Puerto de la carta: categorias, productos con sus presentaciones y los
 * adicionales que se pueden sumar a una pizza.
 *
 * Los productos se devuelven como objetos planos porque en este sistema la
 * carta es un catalogo de consulta: las reglas de negocio viven en el pedido,
 * no en el producto.
 */
export class RepositorioDeCarta {
  /**
   * Carta que ve la cajera: solo lo que esta activo.
   * @returns {Promise<{categorias: object[], productos: object[], adicionales: object[]}>}
   */
  async obtenerCartaActiva() {
    throw new Error('RepositorioDeCarta.obtenerCartaActiva() no implementado.');
  }

  /** Carta completa para administrar, incluyendo lo desactivado. */
  async obtenerCartaCompleta() {
    throw new Error('RepositorioDeCarta.obtenerCartaCompleta() no implementado.');
  }

  async crearProducto(_datos) {
    throw new Error('RepositorioDeCarta.crearProducto() no implementado.');
  }

  async actualizarProducto(_id, _cambios) {
    throw new Error('RepositorioDeCarta.actualizarProducto() no implementado.');
  }

  async eliminarProducto(_id) {
    throw new Error('RepositorioDeCarta.eliminarProducto() no implementado.');
  }

  async crearVariante(_datos) {
    throw new Error('RepositorioDeCarta.crearVariante() no implementado.');
  }

  async actualizarVariante(_id, _cambios) {
    throw new Error('RepositorioDeCarta.actualizarVariante() no implementado.');
  }

  async eliminarVariante(_id) {
    throw new Error('RepositorioDeCarta.eliminarVariante() no implementado.');
  }

  async listarAdicionales() {
    throw new Error('RepositorioDeCarta.listarAdicionales() no implementado.');
  }

  async crearAdicional(_datos) {
    throw new Error('RepositorioDeCarta.crearAdicional() no implementado.');
  }

  async actualizarAdicional(_id, _cambios) {
    throw new Error('RepositorioDeCarta.actualizarAdicional() no implementado.');
  }

  async eliminarAdicional(_id) {
    throw new Error('RepositorioDeCarta.eliminarAdicional() no implementado.');
  }
}
