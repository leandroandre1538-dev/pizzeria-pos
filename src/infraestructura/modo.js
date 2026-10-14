/**
 * El modo local se enciende solo a proposito (`npm run local`, que define
 * MODO_LOCAL=1). Nunca se activa por falta de configuracion: si en Vercel se
 * olvidara una variable de Supabase y el sistema pasara solo a memoria, las
 * ventas del dia se perderian sin que nadie se entere.
 */
export function esModoLocal() {
  return process.env.MODO_LOCAL === '1';
}
