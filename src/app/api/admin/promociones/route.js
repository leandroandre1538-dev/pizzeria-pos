import { contenedor } from '@/infraestructura/Contenedor';
import { exigirAdmin } from '@/infraestructura/http/Sesion';
import { manejar, ok, cuerpo, parametro } from '@/infraestructura/http/Respuestas';
import { promocionAJson } from '@/infraestructura/http/Presentadores';

export const dynamic = 'force-dynamic';

/** Adaptador de entrada: listado de promociones con su estado de hoy. */
export const GET = manejar(async () => {
  exigirAdmin();

  const { hoy, promociones } = await contenedor.administrarPromociones.listar();

  return ok({
    hoy: hoy.iso,
    promociones: promociones.map((p) => promocionAJson(p, hoy)),
  });
});

/** Adaptador de entrada: crear una promocion con vigencia. */
export const POST = manejar(async (peticion) => {
  exigirAdmin();
  const promocion = await contenedor.administrarPromociones.crear(await cuerpo(peticion));
  return ok({ promocion: promocionAJson(promocion) });
});

export const PUT = manejar(async (peticion) => {
  exigirAdmin();
  const { id, ...cambios } = await cuerpo(peticion);
  await contenedor.administrarPromociones.actualizar(id, cambios);
  return ok();
});

export const DELETE = manejar(async (peticion) => {
  exigirAdmin();
  await contenedor.administrarPromociones.eliminar(parametro(peticion, 'id'));
  return ok();
});
