/**
 * Perfiles de uso del sistema.
 *
 * CAJERA es quien lo usa todo el dia: toma pedidos, anota gastos y cierra caja.
 * ADMIN es el dueno o encargado: ademas puede tocar la carta, los precios y
 * las promociones, y ver los reportes.
 */
export const Perfil = Object.freeze({
  CAJERA: 'cajera',
  ADMIN: 'admin',
});

/** Permisos que otorga cada perfil. */
const PERMISOS = Object.freeze({
  [Perfil.CAJERA]: ['operar_caja'],
  [Perfil.ADMIN]: ['operar_caja', 'administrar'],
});

export function puede(perfil, permiso) {
  return (PERMISOS[perfil] || []).includes(permiso);
}

export function esPerfilValido(perfil) {
  return Object.values(Perfil).includes(perfil);
}
