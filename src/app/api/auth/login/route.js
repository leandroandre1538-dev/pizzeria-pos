import { NextResponse } from 'next/server';
import { contenedor } from '@/infraestructura/Contenedor';
import { NOMBRE_COOKIE } from '@/infraestructura/seguridad/GestorDeSesion';
import { manejar, cuerpo } from '@/infraestructura/http/Respuestas';

export const dynamic = 'force-dynamic';

/**
 * Adaptador de entrada: inicio de sesion.
 * Traduce HTTP a caso de uso y convierte la identidad en cookie firmada.
 */
export const POST = manejar(async (peticion) => {
  const datos = await cuerpo(peticion);
  const identidad = await contenedor.iniciarSesion.ejecutar(datos);

  const gestor = contenedor.gestorDeSesion;
  const respuesta = NextResponse.json({ ok: true, perfil: identidad.perfil });

  respuesta.cookies.set(
    NOMBRE_COOKIE,
    gestor.firmar(identidad),
    gestor.opcionesDeCookie(identidad.perfil)
  );

  return respuesta;
});
