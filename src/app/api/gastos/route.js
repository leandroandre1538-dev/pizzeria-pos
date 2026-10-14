import { contenedor } from '@/infraestructura/Contenedor';
import { exigirSesion } from '@/infraestructura/http/Sesion';
import { manejar, ok, cuerpo, parametro } from '@/infraestructura/http/Respuestas';
import { gastoAJson } from '@/infraestructura/http/Presentadores';

export const dynamic = 'force-dynamic';

/** Adaptador de entrada: gastos de un dia. */
export const GET = manejar(async (peticion) => {
  exigirSesion();

  const { fecha, gastos } = await contenedor.listarGastosDelDia.ejecutar(
    parametro(peticion, 'fecha')
  );

  return ok({ fecha: fecha.iso, gastos: gastos.map(gastoAJson) });
});

/** Adaptador de entrada: anotar un gasto. */
export const POST = manejar(async (peticion) => {
  const sesion = exigirSesion();

  const gasto = await contenedor.registrarGasto.ejecutar(
    await cuerpo(peticion),
    sesion.nombre
  );

  return ok({ gasto: gastoAJson(gasto) });
});

/** Adaptador de entrada: borrar un gasto mal anotado. */
export const DELETE = manejar(async (peticion) => {
  exigirSesion();
  await contenedor.eliminarGasto.ejecutar(parametro(peticion, 'id'));
  return ok();
});
