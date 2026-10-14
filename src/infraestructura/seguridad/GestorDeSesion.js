import crypto from 'crypto';

export const NOMBRE_COOKIE = 'mrc_sesion';

/** Un turno de caja completo; el admin dura menos. */
const DURACION_CAJERA_SEG = 16 * 60 * 60;
const DURACION_ADMIN_SEG = 10 * 60 * 60;

/**
 * Sesiones firmadas guardadas en una cookie.
 *
 * El contenido va firmado con HMAC: el navegador puede leer la cookie pero no
 * puede cambiar el perfil a "admin" sin conocer el secreto del servidor.
 *
 * No hace falta una tabla de sesiones para dos perfiles, y una cookie firmada
 * funciona bien en el modelo sin estado de Vercel.
 */
export class GestorDeSesion {
  #secreto;

  constructor(secreto = process.env.SESSION_SECRET) {
    this.#secreto = secreto || 'marocchinos-secreto-de-desarrollo';
  }

  firmar(identidad) {
    const cuerpo = Buffer.from(JSON.stringify(identidad)).toString('base64url');
    return `${cuerpo}.${this.#firma(cuerpo)}`;
  }

  /** Devuelve la identidad si la firma es valida, o null si no lo es. */
  verificar(token) {
    if (!token || !token.includes('.')) return null;

    const [cuerpo, firmaRecibida] = token.split('.');
    const firmaEsperada = this.#firma(cuerpo);

    if (firmaRecibida.length !== firmaEsperada.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(firmaRecibida), Buffer.from(firmaEsperada))) {
      return null;
    }

    try {
      return JSON.parse(Buffer.from(cuerpo, 'base64url').toString());
    } catch {
      return null;
    }
  }

  /** Opciones de la cookie segun el perfil. */
  opcionesDeCookie(perfil) {
    return {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: perfil === 'admin' ? DURACION_ADMIN_SEG : DURACION_CAJERA_SEG,
    };
  }

  #firma(cuerpo) {
    return crypto.createHmac('sha256', this.#secreto).update(cuerpo).digest('base64url');
  }
}
