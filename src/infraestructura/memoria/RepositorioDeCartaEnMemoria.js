import { RepositorioDeCarta } from '@/aplicacion/puertos/RepositorioDeCarta';

const porOrden = (a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.id - b.id;

/**
 * Adaptador de salida: la carta en memoria (modo local).
 * Devuelve las mismas filas planas que el adaptador de Supabase.
 */
export class RepositorioDeCartaEnMemoria extends RepositorioDeCarta {
  #base;

  constructor(base) {
    super();
    this.#base = base;
  }

  async obtenerCartaActiva() {
    return this.#leerCarta({ soloActivos: true });
  }

  async obtenerCartaCompleta() {
    return this.#leerCarta({ soloActivos: false });
  }

  #leerCarta({ soloActivos }) {
    const leer = (tabla) =>
      this.#base
        .filtrar(tabla, (fila) => !soloActivos || fila.activo)
        .sort(porOrden);

    const variantes = leer('variantes');
    const productos = leer('productos').map((p) => ({
      ...p,
      variantes: variantes.filter((v) => v.producto_id === p.id),
    }));

    return {
      categorias: leer('categorias'),
      // Un producto sin presentaciones no se puede vender: no se muestra en caja.
      productos: soloActivos ? productos.filter((p) => p.variantes.length > 0) : productos,
      adicionales: leer('extras'),
    };
  }

  // ------------------------------------------------------------- productos
  async crearProducto(datos) {
    const producto = this.#base.insertar('productos', {
      categoria_id: datos.categoriaId,
      nombre: datos.nombre,
      descripcion: datos.descripcion,
      tipo: datos.tipo,
      pizzas_equivalentes: datos.pizzasEquivalentes,
      permite_extras: datos.permiteAdicionales,
      activo: datos.activo,
      orden: datos.orden,
    });

    for (const presentacion of datos.presentaciones) {
      this.#base.insertar('variantes', {
        producto_id: producto.id,
        nombre: presentacion.nombre,
        precio: presentacion.precio,
        orden: presentacion.orden,
        activo: true,
      });
    }

    return producto;
  }

  async actualizarProducto(id, cambios) {
    this.#base.actualizar('productos', (p) => p.id === Number(id), cambios);
  }

  async eliminarProducto(id) {
    this.#base.eliminar('productos', (p) => p.id === Number(id));
  }

  // -------------------------------------------------------- presentaciones
  async crearVariante(datos) {
    return this.#base.insertar('variantes', {
      producto_id: datos.productoId,
      nombre: datos.nombre,
      precio: datos.precio,
      orden: datos.orden,
      activo: true,
    });
  }

  async actualizarVariante(id, cambios) {
    this.#base.actualizar('variantes', (v) => v.id === Number(id), cambios);
  }

  async eliminarVariante(id) {
    this.#base.eliminar('variantes', (v) => v.id === Number(id));
  }

  // ------------------------------------------------------------ adicionales
  async listarAdicionales() {
    return this.#base.todas('extras').sort(porOrden);
  }

  async crearAdicional(datos) {
    return this.#base.insertar('extras', { activo: true, ...datos });
  }

  async actualizarAdicional(id, cambios) {
    this.#base.actualizar('extras', (e) => e.id === Number(id), cambios);
  }

  async eliminarAdicional(id) {
    this.#base.eliminar('extras', (e) => e.id === Number(id));
  }
}
