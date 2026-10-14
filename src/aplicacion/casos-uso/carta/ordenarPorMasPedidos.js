/**
 * Orden por defecto cuando todavia no hay ventas (o hay empate): primero estas
 * pizzas y despues el resto en el orden de la carta. Se comparan por nombre
 * sin tildes ni mayusculas.
 */
export const FAVORITAS_POR_DEFECTO = ['americana', 'hawaiana', 'la mozarella'];

/**
 * Ordena los productos de lo mas pedido a lo menos pedido.
 *
 * Recibe la carta ya ordenada como el papel (`ordenarCarta`), asi que entre
 * productos con las mismas ventas y que no son favoritas se respeta ese orden.
 *
 * @param {{productos: object[]}} carta
 * @param {Map<number, number>} vendidos producto_id -> unidades
 */
export function ordenarPorMasPedidos(carta, vendidos) {
  const ventas = (producto) => vendidos.get(producto.id) || 0;
  const favorita = (producto) => {
    const indice = FAVORITAS_POR_DEFECTO.indexOf(normalizar(producto.nombre));
    return indice === -1 ? Infinity : indice;
  };

  // `sort` es estable: si todo empata, queda el orden de la carta.
  const productos = [...carta.productos].sort((a, b) => {
    const porVentas = ventas(b) - ventas(a);
    if (porVentas !== 0) return porVentas;
    const fa = favorita(a);
    const fb = favorita(b);
    return fa === fb ? 0 : fa < fb ? -1 : 1;
  });

  return { ...carta, productos };
}

function normalizar(texto) {
  return String(texto || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
