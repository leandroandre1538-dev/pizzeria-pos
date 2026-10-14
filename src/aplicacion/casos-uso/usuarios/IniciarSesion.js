import { ErrorDeAutorizacion, ErrorDeValidacion } from '@/dominio/errores/ErroresDominio';
import { Perfil } from '@/dominio/valores/Perfil';

/**
 * Caso de uso: entrar al sistema.
 *
 * Hay dos perfiles con reglas distintas:
 *   - Cajera: entra con un clic, sin credenciales. Es una computadora del
 *     local y frenarla con una clave solo haria mas lenta la atencion.
 *   - Administrador: usuario y clave, porque puede cambiar precios y ver
 *     la plata del dia.
 *
 * Devuelve la identidad ya verificada; quien la convierte en cookie es el
 * adaptador HTTP, no este caso de uso.
 */
export class IniciarSesion {
  constructor({ repositorioDeUsuarios, hasheadorDeClaves }) {
    this.repositorioDeUsuarios = repositorioDeUsuarios;
    this.hasheadorDeClaves = hasheadorDeClaves;
  }

  async ejecutar({ perfil, usuario, clave }) {
    if (perfil === Perfil.CAJERA) {
      return { perfil: Perfil.CAJERA, nombre: 'Cajera' };
    }

    if (perfil !== Perfil.ADMIN) {
      throw new ErrorDeValidacion('Perfil no valido.');
    }

    if (!usuario || !clave) {
      throw new ErrorDeValidacion('Ingresa usuario y clave.');
    }

    const encontrado = await this.repositorioDeUsuarios.buscarPorUsuario(
      usuario.trim().toLowerCase()
    );

    // Mismo mensaje para "no existe" y "clave incorrecta": no conviene
    // confirmarle a nadie que un usuario existe.
    const credencialesValidas =
      encontrado?.activo &&
      this.hasheadorDeClaves.coincide(encontrado.usuario, clave, encontrado.passwordHash);

    if (!credencialesValidas) {
      throw new ErrorDeAutorizacion('Usuario o clave incorrectos.');
    }

    return {
      perfil: Perfil.ADMIN,
      nombre: encontrado.nombre,
      usuario: encontrado.usuario,
    };
  }
}
