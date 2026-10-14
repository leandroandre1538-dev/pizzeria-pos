/**
 * Funciones de presentacion compartidas entre la interfaz y el correo.
 *
 * Son puras y sin dependencias, por eso pueden usarse tanto en componentes del
 * navegador como en el servidor. No contienen reglas de negocio: solo deciden
 * como se ve un dato en pantalla.
 */

/** "S/ 25.50" a partir de un numero o de un objeto Dinero. */
export function soles(valor) {
  const numero = typeof valor === 'object' && valor !== null ? valor.soles : Number(valor);
  return `S/ ${(numero || 0).toFixed(2)}`;
}

/**
 * Precio de carta tal como lo lee la cajera: sin centimos cuando no los tiene.
 * 20 -> "20" y 3.5 -> "3.50" (las bebidas de medio litro si llevan centimos).
 */
export function precioCorto(valor) {
  const numero = Number(valor) || 0;
  return Number.isInteger(numero) ? String(numero) : numero.toFixed(2);
}

/**
 * La cajera ya conoce las presentaciones de pizza, asi que en los botones de
 * la carta se muestran solo con su inicial. Las demas (1 Litro, Media
 * porcion...) conservan su nombre porque no tienen una abreviatura obvia.
 */
const LETRA_DE_PRESENTACION = Object.freeze({ Personal: 'P', Compartida: 'C', Familiar: 'F' });

export function letraDePresentacion(nombre) {
  return LETRA_DE_PRESENTACION[nombre] || null;
}

/**
 * Presentacion que se muestra en la tarjeta de la carta.
 *
 * En las pizzas es la familiar, que es la que mas se vende y la que la cajera
 * nombra por defecto; en lo demas, la primera de la lista. Las otras se eligen
 * al abrir el producto.
 */
export function presentacionPorDefecto(variantes = []) {
  return variantes.find((v) => v.nombre === 'Familiar') || variantes[0] || null;
}

/** Escapa texto que entra a una plantilla HTML (observaciones de la cajera). */
export function escaparHtml(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const NOMBRES_DE_DIA = Object.freeze({
  1: 'Lun', 2: 'Mar', 3: 'Mie', 4: 'Jue', 5: 'Vie', 6: 'Sab', 7: 'Dom',
});
