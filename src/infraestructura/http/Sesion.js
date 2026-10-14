import { cookies } from 'next/headers';
import { contenedor } from '@/infraestructura/Contenedor';
import { NOMBRE_COOKIE } from '@/infraestructura/seguridad/GestorDeSesion';
import { Perfil, puede } from '@/dominio/valores/Perfil';
import { ErrorDeAutorizacion } from '@/dominio/errores/ErroresDominio';

/**
 * Lectura de la sesion del lado del servidor.
 * Lo usan tanto los layouts (para redirigir) como las rutas de API.
 */
export function sesionActual() {
  const token = cookies().get(NOMBRE_COOKIE)?.value;
  return contenedor.gestorDeSesion.verificar(token);
}

/** Exige que haya alguien conectado; devuelve la identidad. */
export function exigirSesion() {
  const sesion = sesionActual();
  if (!sesion) throw new ErrorDeAutorizacion('Sesion no iniciada.');
  return sesion;
}

/** Exige perfil administrador. */
export function exigirAdmin() {
  const sesion = exigirSesion();
  if (!puede(sesion.perfil, 'administrar')) {
    throw new ErrorDeAutorizacion('Necesitas perfil de administrador.');
  }
  return sesion;
}

export { Perfil };
