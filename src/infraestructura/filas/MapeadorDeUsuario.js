/**
 * Traduce entre la fila de `usuarios` y el objeto que usa la aplicacion.
 * La clave nunca viaja en claro: solo su hash.
 */
export const MapeadorDeUsuario = {
  aDominio(fila) {
    return {
      id: fila.id,
      usuario: fila.usuario,
      nombre: fila.nombre,
      passwordHash: fila.password_hash,
      rol: fila.rol,
      activo: fila.activo,
    };
  },

  /** Version para listados: sin el hash, que no tiene por que salir de la base. */
  aListado(fila) {
    return {
      id: fila.id,
      usuario: fila.usuario,
      nombre: fila.nombre,
      rol: fila.rol,
      activo: fila.activo,
      creado_en: fila.creado_en,
    };
  },

  /** Cambios de la aplicacion (camelCase) a columnas de la tabla. */
  cambiosAFila(cambios) {
    const fila = {};
    if (cambios.nombre !== undefined) fila.nombre = cambios.nombre;
    if (cambios.activo !== undefined) fila.activo = cambios.activo;
    if (cambios.passwordHash !== undefined) fila.password_hash = cambios.passwordHash;
    return fila;
  },
};
