import { NextResponse } from 'next/server';
import {
  ErrorDeValidacion,
  ErrorDeAutorizacion,
  ErrorNoEncontrado,
} from '@/dominio/errores/ErroresDominio';

/**
 * Traduccion de errores a codigos HTTP.
 *
 * El dominio lanza errores con significado de negocio y no sabe nada de HTTP;
 * este mapa es el unico lugar que hace la conversion. Si manana la aplicacion
 * se expone por otro canal, se escribe otra tabla equivalente.
 */
const CODIGOS = [
  [ErrorDeValidacion, 400],
  [ErrorDeAutorizacion, 401],
  [ErrorNoEncontrado, 404],
];

export function ok(datos) {
  return NextResponse.json(datos ?? { ok: true });
}

export function error(mensaje, estado = 400) {
  return NextResponse.json({ error: mensaje }, { status: estado });
}

/**
 * Envuelve el cuerpo de una ruta para que no tenga que repetir try/catch.
 *
 *   export const POST = manejar(async (req) => { ... });
 *
 * Un error de negocio sale como 400/401/404 con su mensaje; cualquier otro
 * sale como 500 y queda en los logs de Vercel.
 */
export function manejar(accion) {
  return async (peticion, contexto) => {
    try {
      return await accion(peticion, contexto);
    } catch (excepcion) {
      const encontrado = CODIGOS.find(([Clase]) => excepcion instanceof Clase);

      if (encontrado) {
        return error(excepcion.message, encontrado[1]);
      }

      console.error('[error no controlado]', excepcion);
      return error(excepcion.message || 'Ocurrio un error inesperado.', 500);
    }
  };
}

/** Lee el cuerpo JSON sin reventar si viene vacio. */
export async function cuerpo(peticion) {
  try {
    return await peticion.json();
  } catch {
    return {};
  }
}

/** Atajo para leer un parametro de la query string. */
export function parametro(peticion, nombre) {
  return new URL(peticion.url).searchParams.get(nombre);
}
