import { ErrorDeValidacion, ErrorNoEncontrado } from '@/dominio/errores/ErroresDominio';

const LARGO_MINIMO_DE_CLAVE = 6;

/**
 * Servicio de aplicacion para gestionar los administradores.
 * La cajera no aparece aqui: ese perfil no tiene credenciales.
 */
export class AdministrarUsuarios {
  constructor({ repositorioDeUsuarios, hasheadorDeClaves }) {
    this.repositorioDeUsuarios = repositorioDeUsuarios;
    this.hasheadorDeClaves = hasheadorDeClaves;
  }

  async listar() {
    return this.repositorioDeUsuarios.listar();
  }

  async crear({ usuario, nombre, clave }) {
    const nombreUsuario = (usuario || '').trim().toLowerCase();
    if (!nombreUsuario) throw new ErrorDeValidacion('Ingresa un nombre de usuario.');
    this.#validarClave(clave);

    return this.repositorioDeUsuarios.crear({
      usuario: nombreUsuario,
      nombre: nombre?.trim() || nombreUsuario,
      passwordHash: this.hasheadorDeClaves.calcular(nombreUsuario, clave),
    });
  }

  async actualizar(id, { nombre, activo, clave }) {
    if (!id) throw new ErrorDeValidacion('Falta el identificador del usuario.');

    const cambios = {};
    if (nombre !== undefined) cambios.nombre = nombre;
    if (activo !== undefined) cambios.activo = activo;

    if (clave) {
      this.#validarClave(clave);
      const existente = await this.repositorioDeUsuarios.buscarPorId(id);
      if (!existente) throw new ErrorNoEncontrado('Usuario no encontrado.');
      cambios.passwordHash = this.hasheadorDeClaves.calcular(existente.usuario, clave);
    }

    return this.repositorioDeUsuarios.actualizar(id, cambios);
  }

  #validarClave(clave) {
    if (!clave || clave.length < LARGO_MINIMO_DE_CLAVE) {
      throw new ErrorDeValidacion(
        `La clave debe tener al menos ${LARGO_MINIMO_DE_CLAVE} caracteres.`
      );
    }
  }
}
