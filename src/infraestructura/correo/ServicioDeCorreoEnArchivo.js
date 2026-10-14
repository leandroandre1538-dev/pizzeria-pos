import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ServicioDeCorreo } from '@/aplicacion/puertos/ServicioDeCorreo';

/**
 * Adaptador del puerto ServicioDeCorreo para el modo local.
 *
 * En lugar de enviar el resumen, lo guarda como archivo HTML en la carpeta
 * `correos-locales/` del proyecto. Se abre con doble clic y se ve exactamente
 * igual que el correo que recibiria el dueno.
 */
export class ServicioDeCorreoEnArchivo extends ServicioDeCorreo {
  constructor({ carpeta = path.join(process.cwd(), 'correos-locales') } = {}) {
    super();
    this.carpeta = carpeta;
  }

  async enviar({ asunto, html }) {
    await mkdir(this.carpeta, { recursive: true });

    const nombre = `${marcaDeTiempo()}-${aNombreDeArchivo(asunto)}.html`;
    const ruta = path.join(this.carpeta, nombre);
    await writeFile(ruta, html, 'utf8');

    console.log(`[modo local] Resumen guardado en ${ruta}`);
    return { destinatarios: `la carpeta correos-locales (modo local): ${nombre}` };
  }
}

function marcaDeTiempo() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function aNombreDeArchivo(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 60);
}
