import { Dinero } from '../valores/Dinero';
import { FechaOperativa } from '../valores/FechaOperativa';
import { politicaDeDescuento } from '../promociones/PoliticasDeDescuento';
import { ErrorDeValidacion } from '../errores/ErroresDominio';

/**
 * Promocion con vigencia por fechas.
 *
 * Una promo de un solo dia tiene la misma fecha de inicio y de fin. Ademas
 * puede limitarse a ciertos dias de la semana (por ejemplo "solo martes") y
 * exigir un monto minimo de pedido.
 *
 * La entidad no sabe *como* se calcula cada tipo de descuento: eso lo resuelve
 * la politica correspondiente. Solo sabe *cuando* corresponde aplicarlo.
 */
export class Promocion {
  constructor({
    id = null,
    nombre,
    descripcion = '',
    tipo,
    valor,
    montoMinimo = Dinero.cero(),
    fechaInicio,
    fechaFin,
    diasSemana = [],
    activo = true,
  }) {
    if (!nombre?.trim()) {
      throw new ErrorDeValidacion('La promocion necesita un nombre.');
    }
    if (fechaFin.esAnteriorA(fechaInicio)) {
      throw new ErrorDeValidacion('La fecha final no puede ser anterior a la inicial.');
    }

    // Delega la validacion del valor en la politica del tipo elegido.
    this.politica = politicaDeDescuento(tipo);
    this.politica.validarValor(Number(valor));

    this.id = id;
    this.nombre = nombre.trim();
    this.descripcion = descripcion;
    this.tipo = tipo;
    this.valor = Number(valor);
    this.montoMinimo = montoMinimo;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
    this.diasSemana = [...diasSemana].sort((a, b) => a - b);
    this.activo = activo;
  }

  /** Esta dentro del rango de fechas y del dia de la semana permitido. */
  estaVigenteEn(fecha) {
    if (!this.activo) return false;
    if (!fecha.estaEntre(this.fechaInicio, this.fechaFin)) return false;
    return this.aplicaAlDiaSemana(fecha);
  }

  aplicaAlDiaSemana(fecha) {
    return this.diasSemana.length === 0 || this.diasSemana.includes(fecha.diaSemana);
  }

  /** Ademas de estar vigente, el pedido debe llegar al monto minimo. */
  puedeAplicarseA(subtotal, fecha) {
    return this.estaVigenteEn(fecha) && subtotal.esMayorOIgualQue(this.montoMinimo);
  }

  /**
   * Descuento que corresponde a este subtotal.
   * Si la promocion no aplica, devuelve cero en lugar de fallar: asi el pedido
   * se registra igual aunque la promo haya vencido mientras se tomaba.
   */
  calcularDescuento(subtotal, fecha) {
    if (!this.puedeAplicarseA(subtotal, fecha)) return Dinero.cero();
    return this.politica.calcular(subtotal, this.valor).acotadoA(subtotal);
  }

  /** Estado legible para el panel de administracion. */
  estadoAl(fecha) {
    if (!this.activo) return 'desactivada';
    if (fecha.esAnteriorA(this.fechaInicio)) return 'programada';
    if (fecha.esPosteriorA(this.fechaFin)) return 'vencida';
    return this.aplicaAlDiaSemana(fecha) ? 'vigente hoy' : 'vigente otros dias';
  }

  get duracionEnDias() {
    return FechaOperativa.diasEntre(this.fechaInicio, this.fechaFin);
  }

  get descuentoLegible() {
    return this.politica.describir(this.valor);
  }
}
