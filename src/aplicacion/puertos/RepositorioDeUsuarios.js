/**
 * Puerto de administradores.
 *
 * Solo el perfil administrador tiene credenciales; la cajera entra sin clave
 * desde la pantalla de inicio.
 */
export class RepositorioDeUsuarios {
  /**
   * @param {string} _usuario
   * @returns {Promise<{id, usuario, nombre, passwordHash, activo}|null>}
   */
  async buscarPorUsuario(_usuario) {
    throw new Error('RepositorioDeUsuarios.buscarPorUsuario() no implementado.');
  }

  async buscarPorId(_id) {
    throw new Error('RepositorioDeUsuarios.buscarPorId() no implementado.');
  }

  /** Nunca devuelve el hash de la clave. */
  async listar() {
    throw new Error('RepositorioDeUsuarios.listar() no implementado.');
  }

  async crear(_datos) {
    throw new Error('RepositorioDeUsuarios.crear() no implementado.');
  }

  async actualizar(_id, _cambios) {
    throw new Error('RepositorioDeUsuarios.actualizar() no implementado.');
  }
}
