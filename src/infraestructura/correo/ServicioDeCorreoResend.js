import { ServicioDeCorreo } from '@/aplicacion/puertos/ServicioDeCorreo';

const API_RESEND = 'https://api.resend.com/emails';

/**
 * Adaptador del puerto ServicioDeCorreo usando Resend.
 *
 * Se llama a la API por HTTP en lugar de instalar el SDK: es una sola peticion
 * y asi el proyecto no suma una dependencia mas.
 *
 * El plan gratuito de Resend permite 3.000 correos al mes y 100 por dia; este
 * sistema envia uno.
 */
export class ServicioDeCorreoResend extends ServicioDeCorreo {
  constructor({
    apiKey = process.env.RESEND_API_KEY,
    remitente = process.env.CORREO_REMITENTE,
    destinatarios = process.env.CORREO_DUENO,
  } = {}) {
    super();
    this.apiKey = apiKey;
    this.remitente = remitente || 'Marocchinos POS <onboarding@resend.dev>';
    this.destinatarios = (destinatarios || '')
      .split(',')
      .map((correo) => correo.trim())
      .filter(Boolean);
  }

  async enviar({ asunto, html }) {
    this.#verificarConfiguracion();

    const respuesta = await fetch(API_RESEND, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.remitente,
        to: this.destinatarios,
        subject: asunto,
        html,
      }),
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      throw new Error(`Resend respondio ${respuesta.status}: ${detalle}`);
    }

    return { destinatarios: this.destinatarios.join(', ') };
  }

  #verificarConfiguracion() {
    if (!this.apiKey) {
      throw new Error('Falta la variable de entorno RESEND_API_KEY.');
    }
    if (!this.destinatarios.length) {
      throw new Error('Falta la variable de entorno CORREO_DUENO.');
    }
  }
}
