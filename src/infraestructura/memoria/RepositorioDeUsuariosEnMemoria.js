import { RepositorioDeUsuarios } from '@/aplicacion/puertos/RepositorioDeUsuarios';
import { ErrorDeValidacion } from '@/dominio/errores/ErroresDominio';
import { MapeadorDeUsuario } from '../filas/MapeadorDeUsuario';

/** Adaptador de salida: administradores en memoria (modo local). */
export class RepositorioDeUsuariosEnMemoria extends RepositorioDeUsuarios {
  #base;

  constructor(base) {
    super();
    this.#base = base;
  }

  async buscarPorUsuario(usuario) {
    const fila = this.#base.buscar('usuarios', (u) => u.usuario === usuario);
    return fila ? MapeadorDeUsuario.aDominio(fila) : null;
  }

  async buscarPorId(id) {
    const fila = this.#base.buscar('usuarios', (u) => u.id === Number(id));
    return fila ? MapeadorDeUsuario.aDominio(fila) : null;
  }

  async listar() {
    return this.#base
      .todas('usuarios')
      .sort((a, b) => a.id - b.id)
      .map(MapeadorDeUsuario.aListado);
  }

  async crear({ usuario, nombre, passwordHash }) {
    if (this.#base.buscar('usuarios', (u) => u.usuario === usuario)) {
      throw new ErrorDeValidacion('Ese usuario ya existe.');
    }
    this.#base.insertar('usuarios', {
      usuario, nombre, password_hash: passwordHash, rol: 'admin', activo: true,
    });
  }

  async actualizar(id, cambios) {
    this.#base.actualizar(
      'usuarios',
      (u) => u.id === Number(id),
      MapeadorDeUsuario.cambiosAFila(cambios)
    );
  }
}
