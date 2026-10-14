import { contenedor } from '@/infraestructura/Contenedor';
import { exigirAdmin } from '@/infraestructura/http/Sesion';
import { manejar, ok, cuerpo, parametro } from '@/infraestructura/http/Respuestas';

export const dynamic = 'force-dynamic';

/** Adaptador de entrada: agregar una presentacion a un producto. */
export const POST = manejar(async (peticion) => {
  exigirAdmin();
  const variante = await contenedor.administrarCarta.agregarPresentacion(await cuerpo(peticion));
  return ok({ variante });
});

/** Adaptador de entrada: cambiar el precio o el nombre de una presentacion. */
export const PUT = manejar(async (peticion) => {
  exigirAdmin();
  const { id, ...cambios } = await cuerpo(peticion);
  await contenedor.administrarCarta.actualizarPresentacion(id, cambios);
  return ok();
});

/** Adaptador de entrada: eliminar una presentacion. */
export const DELETE = manejar(async (peticion) => {
  exigirAdmin();
  await contenedor.administrarCarta.eliminarPresentacion(parametro(peticion, 'id'));
  return ok();
});
