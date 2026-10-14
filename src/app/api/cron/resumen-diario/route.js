import { contenedor } from '@/infraestructura/Contenedor';
import { manejar, ok, error, parametro } from '@/infraestructura/http/Respuestas';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Adaptador de entrada: el job de medianoche.
 *
 * Vercel lo llama todos los dias a las 05:05 UTC, que son las 00:05 en Peru,
 * y envia el resumen del dia que acaba de terminar.
 *
 * Para probarlo a mano:
 *   /api/cron/resumen-diario?clave=CRON_SECRET&fecha=2026-09-19
 */
export const GET = manejar(async (peticion) => {
  if (!autorizado(peticion)) {
    return error('No autorizado', 401);
  }

  const fechaPedida = parametro(peticion, 'fecha');
  const fecha = fechaPedida || contenedor.reloj.ayer().iso;

  const resultado = await contenedor.enviarResumenDiario.ejecutar(fecha, {
    motivo: 'automatico',
  });

  return ok({ ok: true, fecha, destinatarios: resultado.destinatarios });
});

/**
 * Vercel Cron manda `Authorization: Bearer <CRON_SECRET>`.
 * Tambien se acepta `?clave=` para poder disparar el job a mano desde el
 * navegador. Sin CRON_SECRET configurado, no se exige nada (util en local).
 */
function autorizado(peticion) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return true;

  return (
    peticion.headers.get('authorization') === `Bearer ${secreto}` ||
    parametro(peticion, 'clave') === secreto
  );
}
