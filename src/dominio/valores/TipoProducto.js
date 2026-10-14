/**
 * Tipos de producto de la carta.
 *
 * El tipo decide como se agrupa el producto en el resumen del dueno; cuantas
 * pizzas suma al conteo diario lo define `pizzasEquivalentes` de cada producto
 * (un combo de 3 americanas suma 3).
 */
export const TipoProducto = Object.freeze({
  PIZZA: 'pizza',
  COMBO: 'combo',
  SIMPLE: 'simple',
});

const VALIDOS = new Set(Object.values(TipoProducto));

export function esTipoValido(tipo) {
  return VALIDOS.has(tipo);
}

/** Pizzas y combos se listan por nombre en el resumen; lo demas no. */
export function seDetallaEnResumen(tipo) {
  return tipo === TipoProducto.PIZZA || tipo === TipoProducto.COMBO;
}
