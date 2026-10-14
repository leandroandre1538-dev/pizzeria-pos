import { contenedor } from '@/infraestructura/Contenedor';
import { exigirSesion } from '@/infraestructura/http/Sesion';
import { manejar, ok } from '@/infraestructura/http/Respuestas';

export const dynamic = 'force-dynamic';

/** Adaptador de entrada: anular un pedido. */
export const DELETE = manejar(async (_peticion, { params }) => {
  exigirSesion();
  await contenedor.anularPedido.ejecutar(params.id);
  return ok();
});
