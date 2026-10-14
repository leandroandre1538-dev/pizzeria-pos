/**
 * Ordena la carta como se lee en el papel: primero por categoria (clasicas,
 * especiales, combos, pan al ajo, bebidas...) y dentro de cada una por el
 * orden de sus productos.
 *
 * El campo `orden` de un producto es su posicion dentro de su categoria, asi
 * que ordenar solo por el da una lista intercalada (Mozarella, Combo 1, Pan al
 * Ajo, Napolitana...). Vive en la capa de aplicacion para que valga igual con
 * cualquier base de datos.
 */
export function ordenarCarta(carta) {
  const posicionDeCategoria = new Map(
    carta.categorias.map((categoria, indice) => [categoria.id, categoria.orden ?? indice])
  );
  const posicion = (producto) => posicionDeCategoria.get(producto.categoria_id) ?? Infinity;

  const productos = [...carta.productos].sort(
    (a, b) =>
      posicion(a) - posicion(b) ||
      (a.orden ?? 0) - (b.orden ?? 0) ||
      a.id - b.id
  );

  return { ...carta, productos };
}
