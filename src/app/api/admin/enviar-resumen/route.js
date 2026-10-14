import { contenedor } from '@/infraestructura/Contenedor';
import { exigirAdmin } from '@/infraestructura/http/Sesion';
import { manejar, ok, cuerpo } from '@/infraestructura/http/Respuestas';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Adaptador de entrada: envio manual del resumen.
 * Es el boton "Enviar por correo" del panel; sirve para probar que la
 * configuracion de correo funciona sin esperar a la medianoche.
 */
export const POST = manejar(async (peticion) => {
  exigirAdmin();

  const { fecha } = await cuerpo(peticion);
  const resultado = await contenedor.enviarResumenDiario.ejecutar(fecha, { motivo: 'manual' });

  return ok({ destinatarios: resultado.destinatarios });
});
