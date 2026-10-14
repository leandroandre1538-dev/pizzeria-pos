import { contenedor } from '@/infraestructura/Contenedor';
import { exigirAdmin } from '@/infraestructura/http/Sesion';
import { manejar, ok, cuerpo } from '@/infraestructura/http/Respuestas';

export const dynamic = 'force-dynamic';

/** Adaptador de entrada: administradores del sistema. */
export const GET = manejar(async () => {
  exigirAdmin();
  return ok({ usuarios: await contenedor.administrarUsuarios.listar() });
});

export const POST = manejar(async (peticion) => {
  exigirAdmin();
  await contenedor.administrarUsuarios.crear(await cuerpo(peticion));
  return ok();
});

/** Cambiar nombre, clave o activar/desactivar. */
export const PUT = manejar(async (peticion) => {
  exigirAdmin();
  const { id, ...cambios } = await cuerpo(peticion);
  await contenedor.administrarUsuarios.actualizar(id, cambios);
  return ok();
});
