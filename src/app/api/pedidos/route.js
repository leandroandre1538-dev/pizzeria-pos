import { contenedor } from '@/infraestructura/Contenedor';
import { exigirSesion } from '@/infraestructura/http/Sesion';
import { manejar, ok, cuerpo, parametro } from '@/infraestructura/http/Respuestas';
import { pedidoAJson } from '@/infraestructura/http/Presentadores';

export const dynamic = 'force-dynamic';

/** Adaptador de entrada: pedidos de un dia. */
export const GET = manejar(async (peticion) => {
  exigirSesion();

  const { fecha, pedidos } = await contenedor.listarPedidosDelDia.ejecutar(
    parametro(peticion, 'fecha')
  );

  return ok({ fecha: fecha.iso, pedidos: pedidos.map(pedidoAJson) });
});

/** Adaptador de entrada: registrar un pedido nuevo. */
export const POST = manejar(async (peticion) => {
  const sesion = exigirSesion();

  const pedido = await contenedor.registrarPedido.ejecutar(
    await cuerpo(peticion),
    sesion.nombre
  );

  return ok({ pedido: pedidoAJson(pedido) });
});
