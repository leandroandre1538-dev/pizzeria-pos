import { contenedor } from '@/infraestructura/Contenedor';
import { exigirAdmin } from '@/infraestructura/http/Sesion';
import { manejar, ok, cuerpo, parametro } from '@/infraestructura/http/Respuestas';

export const dynamic = 'force-dynamic';

/** Adaptador de entrada: adicionales (queso extra, tocino, etc.). */
export const GET = manejar(async () => {
  exigirAdmin();
  return ok({ adicionales: await contenedor.administrarAdicionales.listar() });
});

export const POST = manejar(async (peticion) => {
  exigirAdmin();
  const adicional = await contenedor.administrarAdicionales.crear(await cuerpo(peticion));
  return ok({ adicional });
});

export const PUT = manejar(async (peticion) => {
  exigirAdmin();
  const { id, ...cambios } = await cuerpo(peticion);
  await contenedor.administrarAdicionales.actualizar(id, cambios);
  return ok();
});

export const DELETE = manejar(async (peticion) => {
  exigirAdmin();
  await contenedor.administrarAdicionales.eliminar(parametro(peticion, 'id'));
  return ok();
});
