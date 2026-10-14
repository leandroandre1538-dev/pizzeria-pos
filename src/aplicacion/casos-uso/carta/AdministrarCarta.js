import { ErrorDeValidacion } from '@/dominio/errores/ErroresDominio';
import { esTipoValido, TipoProducto } from '@/dominio/valores/TipoProducto';
import { ordenarCarta } from './ordenarCarta';

/**
 * Servicio de aplicacion para el mantenimiento de la carta.
 *
 * Agrupa las operaciones de administracion sobre un mismo agregado (producto y
 * sus presentaciones), que siempre se usan juntas desde la misma pantalla.
 * Las reglas que valen la pena proteger estan aqui; lo demas es delegacion
 * directa al repositorio.
 */
export class AdministrarCarta {
  constructor({ repositorioDeCarta }) {
    this.repositorioDeCarta = repositorioDeCarta;
  }

  async obtenerCartaCompleta() {
    return ordenarCarta(await this.repositorioDeCarta.obtenerCartaCompleta());
  }

  async crearProducto(datos) {
    const nombre = (datos.nombre || '').trim();
    if (!nombre) throw new ErrorDeValidacion('El producto necesita un nombre.');

    const tipo = datos.tipo || TipoProducto.SIMPLE;
    if (!esTipoValido(tipo)) {
      throw new ErrorDeValidacion(`Tipo de producto desconocido: "${tipo}".`);
    }

    const presentaciones = (datos.variantes || []).filter(
      (v) => v.nombre?.trim() && Number(v.precio) > 0
    );
    if (!presentaciones.length) {
      throw new ErrorDeValidacion('Agrega al menos una presentacion con precio.');
    }

    return this.repositorioDeCarta.crearProducto({
      nombre,
      descripcion: datos.descripcion || '',
      categoriaId: datos.categoria_id || null,
      tipo,
      // Una pizza suma 1 al conteo del dia; un combo, las que incluya.
      pizzasEquivalentes:
        tipo === TipoProducto.PIZZA ? 1 : Number(datos.pizzas_equivalentes) || 0,
      permiteAdicionales: !!datos.permite_extras,
      activo: datos.activo !== false,
      orden: Number(datos.orden) || 99,
      presentaciones: presentaciones.map((v, indice) => ({
        nombre: v.nombre.trim(),
        precio: Number(v.precio),
        orden: indice + 1,
      })),
    });
  }

  async actualizarProducto(id, cambios) {
    this.#exigirId(id, 'producto');
    return this.repositorioDeCarta.actualizarProducto(id, cambios);
  }

  async eliminarProducto(id) {
    this.#exigirId(id, 'producto');
    return this.repositorioDeCarta.eliminarProducto(id);
  }

  async agregarPresentacion(datos) {
    if (!datos.producto_id) throw new ErrorDeValidacion('Falta el producto.');
    if (!datos.nombre?.trim()) throw new ErrorDeValidacion('La presentacion necesita un nombre.');
    if (Number(datos.precio) < 0) throw new ErrorDeValidacion('El precio no puede ser negativo.');

    return this.repositorioDeCarta.crearVariante({
      productoId: datos.producto_id,
      nombre: datos.nombre.trim(),
      precio: Number(datos.precio) || 0,
      orden: Number(datos.orden) || 99,
    });
  }

  async actualizarPresentacion(id, cambios) {
    this.#exigirId(id, 'presentacion');
    if (cambios.precio !== undefined && Number(cambios.precio) < 0) {
      throw new ErrorDeValidacion('El precio no puede ser negativo.');
    }
    return this.repositorioDeCarta.actualizarVariante(id, cambios);
  }

  async eliminarPresentacion(id) {
    this.#exigirId(id, 'presentacion');
    return this.repositorioDeCarta.eliminarVariante(id);
  }

  #exigirId(id, que) {
    if (!id) throw new ErrorDeValidacion(`Falta el identificador de la ${que}.`);
  }
}
