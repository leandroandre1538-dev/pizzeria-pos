import { contenedor } from '@/infraestructura/Contenedor';
import { exigirSesion } from '@/infraestructura/http/Sesion';
import { manejar, ok } from '@/infraestructura/http/Respuestas';
import { promocionAJson } from '@/infraestructura/http/Presentadores';

export const dynamic = 'force-dynamic';

/** Adaptador de entrada: la carta que ve la cajera, con las promos de hoy. */
export const GET = manejar(async () => {
  exigirSesion();

  const carta = await contenedor.obtenerCartaVigente.ejecutar();

  return ok({
    hoy: carta.hoy.iso,
    categorias: carta.categorias,
    productos: carta.productos,
    adicionales: carta.adicionales,
    promociones: carta.promociones.map((p) => promocionAJson(p, carta.hoy)),
  });
});
