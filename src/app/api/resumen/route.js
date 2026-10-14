import { contenedor } from '@/infraestructura/Contenedor';
import { exigirSesion } from '@/infraestructura/http/Sesion';
import { manejar, ok, parametro } from '@/infraestructura/http/Respuestas';
import { resumenAJson } from '@/infraestructura/http/Presentadores';

export const dynamic = 'force-dynamic';

/** Adaptador de entrada: el resumen de un dia (mismo calculo que el correo). */
export const GET = manejar(async (peticion) => {
  exigirSesion();

  const resumen = await contenedor.generarResumenDiario.ejecutar(
    parametro(peticion, 'fecha')
  );

  return ok({ resumen: resumenAJson(resumen) });
});
