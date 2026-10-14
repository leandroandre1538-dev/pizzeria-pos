import { contenedor } from '@/infraestructura/Contenedor';
import { exigirSesion } from '@/infraestructura/http/Sesion';
import { manejar, ok, cuerpo, parametro } from '@/infraestructura/http/Respuestas';
import { cierreAJson } from '@/infraestructura/http/Presentadores';

export const dynamic = 'force-dynamic';

/** Adaptador de entrada: leer el cierre de caja de un dia. */
export const GET = manejar(async (peticion) => {
  exigirSesion();

  const { fecha, cierre } = await contenedor.obtenerCierreDelDia.ejecutar(
    parametro(peticion, 'fecha')
  );

  return ok({ fecha: fecha.iso, cierre: cierreAJson(cierre) });
});

/** Adaptador de entrada: guardar el avance o confirmar el cierre del dia. */
export const POST = manejar(async (peticion) => {
  const sesion = exigirSesion();

  const cierre = await contenedor.guardarCierreDelDia.ejecutar(
    await cuerpo(peticion),
    sesion.nombre
  );

  return ok({ cierre: cierreAJson(cierre) });
});
