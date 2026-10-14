/**
 * Datos con los que arranca el modo local: la misma carta que carga
 * `supabase/02_carta_inicial.sql`, el usuario administrador y las promociones
 * de ejemplo.
 *
 * Hay una prueba (`npm test`) que compara esta carta con la del archivo SQL,
 * asi que si se cambia un precio en un lado y no en el otro, la prueba falla.
 */

const PERSONAL_COMPARTIDA_FAMILIAR = ['Personal', 'Compartida', 'Familiar'];

export const CATEGORIAS = [
  { id: 1, nombre: 'Pizzas Clasicas', orden: 1 },
  { id: 2, nombre: 'Pizzas Especiales', orden: 2 },
  { id: 3, nombre: 'Combos', orden: 3 },
  { id: 4, nombre: 'Pan al Ajo', orden: 4 },
  { id: 5, nombre: 'Bebidas Frias', orden: 5 },
  { id: 6, nombre: 'Bebidas Calientes', orden: 6 },
  { id: 7, nombre: 'Jugos', orden: 7 },
  { id: 8, nombre: 'Mojitos', orden: 8 },
];

/** [id, categoria, nombre, descripcion, [personal, compartida, familiar]] */
const PIZZAS = [
  [1, 1, 'La Mozarella', 'Salsa de tomate y queso mozzarella.', [7, 14, 20]],
  [2, 1, 'Napolitana', 'Salsa de tomate, queso mozzarella y aceitunas.', [8, 15, 21]],
  [3, 1, 'La Misia', 'Salsa de tomate, queso mozzarella y hot dog.', [9, 16, 22]],
  [4, 1, 'Americana', 'Salsa de tomate, queso mozzarella y jamon pizzero.', [9, 17, 23]],
  [5, 1, 'Choripizza', 'Salsa de tomate, queso mozzarella y chorizo argentino.', [10, 18, 23]],
  [6, 1, 'Espanola', 'Salsa de tomate, queso mozzarella, chorizo argentino y aceitunas.', [10, 19, 24]],
  [7, 1, 'Vegetariana', 'Salsa de tomate, queso mozzarella, aros de cebolla, tomate en rodajas y champinones.', [12, 19, 25]],
  [8, 1, 'Mixta', 'Salsa de tomate, queso mozzarella, hot dog, jamon pizzero y pimientos.', [12, 19, 25]],
  [9, 1, 'Peperoni', 'Salsa de tomate, queso mozzarella y peperoni.', [12, 19, 25]],
  [10, 1, 'Granjera', 'Salsa de tomate, queso mozzarella, jamon, champinones y aceituna.', [12, 20, 26]],
  [11, 2, 'Alemana', 'Salsa de tomate, queso mozzarella, chorizo, tocino y hot dog.', [12, 20, 26]],
  [12, 2, 'Hawaiana', 'Salsa de tomate, queso mozzarella, jamon pizzero, pina y durazno.', [12, 20, 26]],
  [13, 2, 'Suprema', 'Salsa de tomate, queso mozzarella, peperoni, hot dog y tocino.', [13, 20, 26]],
  [14, 2, 'Italiana', 'Salsa de tomate, queso mozzarella, chorizo, tocino, aceituna, cebolla y pimientos.', [14, 21, 27]],
  [15, 2, 'Marocchinos', 'Salsa de tomate, queso mozzarella, peperoni, hot dog, aceituna, tocino, pimientos y champinones.', [15, 26, 32]],
  [16, 2, 'Puerca', 'Salsa de tomate, queso mozzarella, jamon pizzero, chorizo, hot dog, aceituna, tocino y pimientos.', [15, 26, 32]],
];

/** [id, nombre, descripcion, [presentacion, precio], pizzas que incluye] */
const COMBOS = [
  [20, 'Combo Pizzero 1', '1 pizza americana familiar + coca/inka de 1 litro.', ['Combo', 27], 1],
  [21, 'Combo Pizzero 2', '1 pizza familiar a eleccion (hawaiana, peperoni, mixta o granjera) + coca/inka de 1 litro + pan al ajo.', ['Combo', 34], 1],
  [22, 'Combo Pizzero 3', '1 pizza americana familiar + 1 choripizza.', ['Combo', 42], 2],
  [23, 'Combo Pizzero 4', '2 pizzas americanas familiares + coca/inka de 1 litro + pan al ajo.', ['Combo', 52], 2],
  [24, 'Combo Pizzero 5', '2 x 43.00 - mozarella, misia, americana o choripizza.', ['Combo 2x', 43], 2],
  [25, 'Combo Pizzero 6', '2 x 40.00 - mozarella, misia o napolitana.', ['Combo 2x', 40], 2],
  [26, 'Combo Pizzero Americanas', '2 pizzas familiares + gaseosa coca o inka de 2 litros.', ['Combo', 52], 2],
  [27, 'Combo Full Americanas', '3 pizzas americanas familiares + 1 gaseosa de 2 litros coca/inka.', ['Combo', 74], 3],
  [28, 'Combo Tu Escoges La Segunda', '1 pizza americana + 1 pizza a eleccion (hawaiana, peperoni, mixta o granjera).', ['Combo', 45], 2],
  [29, 'Combo Compartidas 1', '2 pizzas compartidas a escoger (solo pizzas clasicas).', ['Combo', 36], 2],
  [30, 'Combo Compartidas 2', '1 pizza compartida + 1 pizza familiar a escoger (solo pizzas clasicas).', ['Combo', 42], 2],
];

/** [id, categoria, nombre, descripcion, [[presentacion, precio], ...]] */
const OTROS = [
  [40, 4, 'Pan al Ajo', 'Pan al ajo de la casa.', [['Media porcion', 3], ['1 Porcion', 6]]],
  [41, 4, 'Pan al Ajo Especial', 'Pan al ajo con queso.', [['Media porcion', 5], ['1 Porcion', 9]]],
  [50, 5, 'Chicha Morada', 'Chicha morada de la casa.', [['1/2 Litro', 3.5], ['1 Litro', 7]]],
  [51, 5, 'Maracuya', 'Refresco de maracuya.', [['1/2 Litro', 3.5], ['1 Litro', 7]]],
  [52, 5, 'Coca Cola / Inka Cola', 'Gaseosa.', [['1/2 Litro', 3.5], ['1 Litro', 6], ['2 Litros', 10]]],
  [53, 5, 'Agua Mineral', 'Agua mineral.', [['Unidad', 2]]],
  [60, 6, 'Cafe', 'Cafe caliente.', [['Taza', 2]]],
  [61, 6, 'Te', 'Te de manzanilla o puro.', [['Taza', 2]]],
  [70, 7, 'Jugo de Mango', 'Jugo natural de mango.', [['Vaso', 10]]],
  [71, 7, 'Jugo de Fresa', 'Jugo natural de fresa.', [['Vaso', 5]]],
  [72, 7, 'Jugo de Pina', 'Jugo natural de pina.', [['Vaso', 4]]],
  [80, 8, 'Mojito Clasico', 'Mojito clasico.', [['Vaso', 12]]],
  [81, 8, 'Mojito de Maracuya', 'Mojito de maracuya.', [['Vaso', 15]]],
  [82, 8, 'Mojito de Fresa', 'Mojito de fresa.', [['Vaso', 15]]],
];

export const ADICIONALES = [
  ['Porcion de queso extra', 6],
  ['1/2 porcion de queso', 3],
  ['Jamon', 3],
  ['Chorizo', 3],
  ['Peperoni', 4],
  ['Tocino', 4],
  ['Pimenton', 1],
  ['Aceituna', 1],
  ['Cebolla', 1],
];

/**
 * Carta completa como lista de productos con sus presentaciones.
 * Es la forma que usa tanto la siembra como la prueba contra el SQL.
 */
export function productosIniciales() {
  const pizzas = PIZZAS.map(([id, categoria, nombre, descripcion, precios], orden) => ({
    id, categoria, nombre, descripcion, orden: orden + 1,
    tipo: 'pizza', pizzasEquivalentes: 1, permiteAdicionales: true,
    presentaciones: PERSONAL_COMPARTIDA_FAMILIAR.map((p, i) => [p, precios[i]]),
  }));

  const combos = COMBOS.map(([id, nombre, descripcion, presentacion, pizzasEquivalentes], orden) => ({
    id, categoria: 3, nombre, descripcion, orden: orden + 1,
    tipo: 'combo', pizzasEquivalentes, permiteAdicionales: false,
    presentaciones: [presentacion],
  }));

  const otros = OTROS.map(([id, categoria, nombre, descripcion, presentaciones], orden) => ({
    id, categoria, nombre, descripcion, orden: orden + 1,
    tipo: 'simple', pizzasEquivalentes: 0, permiteAdicionales: false,
    presentaciones,
  }));

  return [...pizzas, ...combos, ...otros];
}

/**
 * Llena la base en memoria.
 * @param {import('./BaseEnMemoria').BaseEnMemoria} base
 * @param {{ hoy: string, hashDelAdmin: string }} contexto
 */
export function sembrar(base, { hoy, hashDelAdmin }) {
  for (const categoria of CATEGORIAS) {
    base.insertar('categorias', { ...categoria, activo: true });
  }

  for (const producto of productosIniciales()) {
    base.insertar('productos', {
      id: producto.id,
      categoria_id: producto.categoria,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      tipo: producto.tipo,
      pizzas_equivalentes: producto.pizzasEquivalentes,
      permite_extras: producto.permiteAdicionales,
      activo: true,
      orden: producto.orden,
    });

    producto.presentaciones.forEach(([nombre, precio], indice) => {
      base.insertar('variantes', {
        producto_id: producto.id, nombre, precio, activo: true, orden: indice + 1,
      });
    });
  }

  ADICIONALES.forEach(([nombre, precio], indice) => {
    base.insertar('extras', { nombre, precio, activo: true, orden: indice + 1 });
  });

  base.insertar('usuarios', {
    usuario: 'admin',
    password_hash: hashDelAdmin,
    nombre: 'Administrador',
    rol: 'admin',
    activo: true,
  });

  const dentroDe = (dias) => sumarDias(hoy, dias);
  base.insertar('promociones', {
    nombre: 'Martes Pizzero', descripcion: '10% de descuento en todo el pedido los martes.',
    tipo: 'porcentaje', valor: 10, monto_minimo: 0,
    fecha_inicio: hoy, fecha_fin: dentroDe(90), dias_semana: [2], activo: true,
  });
  base.insertar('promociones', {
    nombre: 'Delivery Feliz', descripcion: 'S/ 3.00 de descuento en pedidos desde S/ 40.',
    tipo: 'monto', valor: 3, monto_minimo: 40,
    fecha_inicio: hoy, fecha_fin: dentroDe(30), dias_semana: [], activo: true,
  });
  base.insertar('promociones', {
    nombre: 'Fin de Semana 15%', descripcion: '15% de descuento sabados y domingos desde S/ 50.',
    tipo: 'porcentaje', valor: 15, monto_minimo: 50,
    fecha_inicio: hoy, fecha_fin: dentroDe(60), dias_semana: [6, 7], activo: true,
  });
}

function sumarDias(iso, dias) {
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(Date.UTC(anio, mes - 1, dia + dias)).toISOString().slice(0, 10);
}
