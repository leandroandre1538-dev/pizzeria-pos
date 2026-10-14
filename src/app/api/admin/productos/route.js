import { contenedor } from '@/infraestructura/Contenedor';
import { exigirAdmin } from '@/infraestructura/http/Sesion';
import { manejar, ok, cuerpo, parametro } from '@/infraestructura/http/Respuestas';

export const dynamic = 'force-dynamic';

/** Adaptador de entrada: carta completa para administrar. */
export const GET = manejar(async () => {
  exigirAdmin();
  return ok(await contenedor.administrarCarta.obtenerCartaCompleta());
});

/** Adaptador de entrada: crear un producto con sus presentaciones. */
export const POST = manejar(async (peticion) => {
  exigirAdmin();
  const producto = await contenedor.administrarCarta.crearProducto(await cuerpo(peticion));
  return ok({ producto });
});

/** Adaptador de entrada: editar datos del producto. */
export const PUT = manejar(async (peticion) => {
  exigirAdmin();
  const { id, ...cambios } = await cuerpo(peticion);
  await contenedor.administrarCarta.actualizarProducto(id, cambios);
  return ok();
});

/** Adaptador de entrada: quitar un producto de la carta. */
export const DELETE = manejar(async (peticion) => {
  exigirAdmin();
  await contenedor.administrarCarta.eliminarProducto(parametro(peticion, 'id'));
  return ok();
});
