import { ErrorDeValidacion } from '@/dominio/errores/ErroresDominio';

/**
 * Servicio de aplicacion para los adicionales (queso extra, tocino, etc.).
 * Se maneja aparte de los productos porque es un catalogo independiente: un
 * adicional no pertenece a una pizza en particular.
 */
export class AdministrarAdicionales {
  constructor({ repositorioDeCarta }) {
    this.repositorioDeCarta = repositorioDeCarta;
  }

  async listar() {
    return this.repositorioDeCarta.listarAdicionales();
  }

  async crear(datos) {
    const nombre = (datos.nombre || '').trim();
    if (!nombre) throw new ErrorDeValidacion('El adicional necesita un nombre.');
    if (Number(datos.precio) < 0) throw new ErrorDeValidacion('El precio no puede ser negativo.');

    return this.repositorioDeCarta.crearAdicional({
      nombre,
      precio: Number(datos.precio) || 0,
      orden: Number(datos.orden) || 99,
    });
  }

  async actualizar(id, cambios) {
    if (!id) throw new ErrorDeValidacion('Falta el identificador del adicional.');
    if (cambios.precio !== undefined && Number(cambios.precio) < 0) {
      throw new ErrorDeValidacion('El precio no puede ser negativo.');
    }
    return this.repositorioDeCarta.actualizarAdicional(id, cambios);
  }

  async eliminar(id) {
    if (!id) throw new ErrorDeValidacion('Falta el identificador del adicional.');
    return this.repositorioDeCarta.eliminarAdicional(id);
  }
}
