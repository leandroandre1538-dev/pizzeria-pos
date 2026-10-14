import { Promocion } from '@/dominio/entidades/Promocion';
import { Dinero } from '@/dominio/valores/Dinero';
import { FechaOperativa } from '@/dominio/valores/FechaOperativa';
import { ErrorDeValidacion } from '@/dominio/errores/ErroresDominio';

/**
 * Servicio de aplicacion para gestionar promociones.
 *
 * Crear una promocion pasa siempre por el constructor de la entidad, que es
 * quien valida el rango de fechas y el valor del descuento segun su tipo. Asi
 * no existe forma de guardar una promocion invalida, venga de donde venga.
 */
export class AdministrarPromociones {
  constructor({ repositorioDePromociones, reloj }) {
    this.repositorioDePromociones = repositorioDePromociones;
    this.reloj = reloj;
  }

  async listar() {
    const promociones = await this.repositorioDePromociones.listarTodas();
    const hoy = this.reloj.hoy();
    return { hoy, promociones };
  }

  async crear(datos) {
    if (!datos.fecha_inicio || !datos.fecha_fin) {
      throw new ErrorDeValidacion('Indica desde y hasta cuando esta vigente la promocion.');
    }

    const promocion = new Promocion({
      nombre: datos.nombre,
      descripcion: datos.descripcion || '',
      tipo: datos.tipo || 'porcentaje',
      valor: Number(datos.valor),
      montoMinimo: Dinero.deSoles(datos.monto_minimo || 0),
      fechaInicio: new FechaOperativa(datos.fecha_inicio),
      fechaFin: new FechaOperativa(datos.fecha_fin),
      diasSemana: this.#validarDias(datos.dias_semana),
      activo: datos.activo !== false,
    });

    return this.repositorioDePromociones.guardar(promocion);
  }

  async actualizar(id, cambios) {
    if (!id) throw new ErrorDeValidacion('Falta el identificador de la promocion.');
    if (cambios.dias_semana !== undefined) {
      cambios.dias_semana = this.#validarDias(cambios.dias_semana);
    }
    return this.repositorioDePromociones.actualizar(id, cambios);
  }

  async eliminar(id) {
    if (!id) throw new ErrorDeValidacion('Falta el identificador de la promocion.');
    return this.repositorioDePromociones.eliminar(id);
  }

  /** 1 = Lunes ... 7 = Domingo. Lista vacia significa "todos los dias". */
  #validarDias(dias) {
    if (!Array.isArray(dias)) return [];
    const limpios = dias.map(Number).filter((d) => Number.isInteger(d) && d >= 1 && d <= 7);
    return [...new Set(limpios)].sort((a, b) => a - b);
  }
}
