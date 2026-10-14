/**
 * Base de datos minima en memoria para el modo local.
 *
 * Imita lo justo de Postgres para que los adaptadores en memoria se comporten
 * como los de Supabase: tablas de filas planas, ids autoincrementales,
 * `creado_en` automatico y borrado en cascada donde el esquema lo tiene.
 *
 * Siempre devuelve copias: quien lee una fila no puede modificar la base por
 * accidente, igual que pasa con una base real.
 *
 * Los datos viven mientras el servidor este encendido. Al apagarlo se pierden:
 * es para probar el sistema, no para trabajar con el.
 */

/** Tablas hijas que se borran junto con su fila padre (ON DELETE CASCADE). */
const CASCADAS = {
  productos: [{ tabla: 'variantes', columna: 'producto_id' }],
  pedidos: [{ tabla: 'pedido_items', columna: 'pedido_id' }],
};

export class BaseEnMemoria {
  #tablas = new Map();
  #secuencias = new Map();

  /**
   * Instancia unica compartida por todo el servidor.
   *
   * Se guarda en `globalThis` porque Next puede cargar el mismo modulo varias
   * veces (una por ruta, y de nuevo en cada recarga en desarrollo). Sin esto,
   * cada ruta veria su propia base y un pedido registrado no apareceria en el
   * listado.
   */
  static compartida(sembrar) {
    const clave = Symbol.for('marocchinos.baseEnMemoria');
    if (!globalThis[clave]) {
      const base = new BaseEnMemoria();
      if (sembrar) sembrar(base);
      globalThis[clave] = base;
    }
    return globalThis[clave];
  }

  insertar(tabla, fila) {
    const id = fila.id ?? this.#siguienteId(tabla);
    if (fila.id !== undefined) this.#avanzarSecuencia(tabla, fila.id);

    const guardada = { creado_en: new Date().toISOString(), ...copiar(fila), id };
    this.#tabla(tabla).push(guardada);
    return copiar(guardada);
  }

  todas(tabla) {
    return this.#tabla(tabla).map(copiar);
  }

  filtrar(tabla, condicion) {
    return this.#tabla(tabla).filter(condicion).map(copiar);
  }

  buscar(tabla, condicion) {
    const fila = this.#tabla(tabla).find(condicion);
    return fila ? copiar(fila) : null;
  }

  actualizar(tabla, condicion, cambios) {
    for (const fila of this.#tabla(tabla)) {
      if (condicion(fila)) Object.assign(fila, copiar(cambios));
    }
  }

  eliminar(tabla, condicion) {
    const borradas = this.#tabla(tabla).filter(condicion);
    this.#tablas.set(tabla, this.#tabla(tabla).filter((fila) => !condicion(fila)));

    for (const { tabla: hija, columna } of CASCADAS[tabla] || []) {
      const ids = new Set(borradas.map((fila) => fila.id));
      this.eliminar(hija, (fila) => ids.has(fila[columna]));
    }
  }

  #tabla(nombre) {
    if (!this.#tablas.has(nombre)) this.#tablas.set(nombre, []);
    return this.#tablas.get(nombre);
  }

  #siguienteId(tabla) {
    const siguiente = (this.#secuencias.get(tabla) || 0) + 1;
    this.#secuencias.set(tabla, siguiente);
    return siguiente;
  }

  #avanzarSecuencia(tabla, id) {
    if (id > (this.#secuencias.get(tabla) || 0)) this.#secuencias.set(tabla, id);
  }
}

function copiar(valor) {
  return structuredClone(valor);
}
