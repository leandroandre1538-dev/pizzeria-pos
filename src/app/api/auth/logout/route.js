import { NextResponse } from 'next/server';
import { NOMBRE_COOKIE } from '@/infraestructura/seguridad/GestorDeSesion';

export const dynamic = 'force-dynamic';

/** Adaptador de entrada: cerrar sesion borrando la cookie. */
export async function POST() {
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(NOMBRE_COOKIE, '', { path: '/', maxAge: 0 });
  return respuesta;
}
