'use client';

/**
 * Cliente HTTP de la interfaz.
 *
 * Concentra el manejo de errores para que los componentes no repitan
 * `if (!r.ok)` en cada llamada. El servidor siempre responde `{ error }` con
 * un mensaje en castellano, asi que se puede mostrar tal cual al usuario.
 */

class ErrorDeApi extends Error {
  constructor(mensaje, estado) {
    super(mensaje);
    this.name = 'ErrorDeApi';
    this.estado = estado;
  }
}

async function pedir(ruta, opciones = {}) {
  const respuesta = await fetch(ruta, {
    ...opciones,
    headers: { 'Content-Type': 'application/json', ...(opciones.headers || {}) },
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new ErrorDeApi(datos.error || 'No se pudo completar la operacion.', respuesta.status);
  }
  return datos;
}

export const api = {
  obtener: (ruta) => pedir(ruta),
  crear: (ruta, datos) => pedir(ruta, { method: 'POST', body: JSON.stringify(datos) }),
  actualizar: (ruta, datos) => pedir(ruta, { method: 'PUT', body: JSON.stringify(datos) }),
  eliminar: (ruta) => pedir(ruta, { method: 'DELETE' }),
};

export { ErrorDeApi };
