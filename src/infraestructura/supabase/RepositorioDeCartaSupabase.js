import { RepositorioDeCarta } from '@/aplicacion/puertos/RepositorioDeCarta';
import { clienteSupabase, resultado } from './ClienteSupabase';

/**
 * Adaptador de salida: la carta sobre Supabase/Postgres.
 *
 * Devuelve objetos planos con nombres en el formato que consume la interfaz.
 * La carta es un catalogo de consulta, no un agregado con reglas propias: las
 * reglas viven en el pedido.
 */
export class RepositorioDeCartaSupabase extends RepositorioDeCarta {
  #sb;

  constructor(cliente = clienteSupabase()) {
    super();
    this.#sb = cliente;
  }

  async obtenerCartaActiva() {
    return this.#leerCarta({ soloActivos: true });
  }

  async obtenerCartaCompleta() {
    return this.#leerCarta({ soloActivos: false });
  }

  async #leerCarta({ soloActivos }) {
    const categorias = this.#sb.from('categorias').select('*').order('orden');
    const productos = this.#sb.from('productos').select('*').order('orden');
    const variantes = this.#sb.from('variantes').select('*').order('orden');
    const adicionales = this.#sb.from('extras').select('*').order('orden');

    const [cat, prod, vars, ext] = await Promise.all([
      soloActivos ? categorias.eq('activo', true) : categorias,
      soloActivos ? productos.eq('activo', true) : productos,
      soloActivos ? variantes.eq('activo', true) : variantes,
      soloActivos ? adicionales.eq('activo', true) : adicionales,
    ]);

    const listaVariantes = resultado(vars, 'No se pudieron leer las presentaciones') || [];

    const listaProductos = (resultado(prod, 'No se pudieron leer los productos') || []).map(
      (p) => ({
        ...p,
        variantes: listaVariantes.filter((v) => v.producto_id === p.id),
      })
    );

    return {
      categorias: resultado(cat, 'No se pudieron leer las categorias') || [],
      // Un producto sin ninguna presentacion no se puede vender: no se muestra.
      productos: soloActivos
        ? listaProductos.filter((p) => p.variantes.length > 0)
        : listaProductos,
      adicionales: resultado(ext, 'No se pudieron leer los adicionales') || [],
    };
  }

  // ------------------------------------------------------------- productos
  async crearProducto(datos) {
    const producto = resultado(
      await this.#sb
        .from('productos')
        .insert({
          categoria_id: datos.categoriaId,
          nombre: datos.nombre,
          descripcion: datos.descripcion,
          tipo: datos.tipo,
          pizzas_equivalentes: datos.pizzasEquivalentes,
          permite_extras: datos.permiteAdicionales,
          activo: datos.activo,
          orden: datos.orden,
        })
        .select()
        .single(),
      'No se pudo crear el producto'
    );

    resultado(
      await this.#sb.from('variantes').insert(
        datos.presentaciones.map((p) => ({
          producto_id: producto.id,
          nombre: p.nombre,
          precio: p.precio,
          orden: p.orden,
        }))
      ),
      'No se pudieron crear las presentaciones'
    );

    return producto;
  }

  async actualizarProducto(id, cambios) {
    resultado(
      await this.#sb.from('productos').update(cambios).eq('id', id),
      'No se pudo actualizar el producto'
    );
  }

  async eliminarProducto(id) {
    resultado(
      await this.#sb.from('productos').delete().eq('id', id),
      'No se pudo eliminar el producto'
    );
  }

  // -------------------------------------------------------- presentaciones
  async crearVariante(datos) {
    return resultado(
      await this.#sb
        .from('variantes')
        .insert({
          producto_id: datos.productoId,
          nombre: datos.nombre,
          precio: datos.precio,
          orden: datos.orden,
        })
        .select()
        .single(),
      'No se pudo crear la presentacion'
    );
  }

  async actualizarVariante(id, cambios) {
    resultado(
      await this.#sb.from('variantes').update(cambios).eq('id', id),
      'No se pudo actualizar la presentacion'
    );
  }

  async eliminarVariante(id) {
    resultado(
      await this.#sb.from('variantes').delete().eq('id', id),
      'No se pudo eliminar la presentacion'
    );
  }

  // ------------------------------------------------------------ adicionales
  async listarAdicionales() {
    return resultado(
      await this.#sb.from('extras').select('*').order('orden'),
      'No se pudieron leer los adicionales'
    ) || [];
  }

  async crearAdicional(datos) {
    return resultado(
      await this.#sb.from('extras').insert(datos).select().single(),
      'No se pudo crear el adicional'
    );
  }

  async actualizarAdicional(id, cambios) {
    resultado(
      await this.#sb.from('extras').update(cambios).eq('id', id),
      'No se pudo actualizar el adicional'
    );
  }

  async eliminarAdicional(id) {
    resultado(
      await this.#sb.from('extras').delete().eq('id', id),
      'No se pudo eliminar el adicional'
    );
  }
}
