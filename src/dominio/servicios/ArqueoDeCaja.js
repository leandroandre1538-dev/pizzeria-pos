import { Dinero } from '../valores/Dinero';

/**
 * Servicio de dominio: compara el dinero que la cajera declaro al cerrar con
 * el que deberia haber en el cajon segun lo registrado en el sistema.
 *
 *   esperado = dinero inicial + ventas en efectivo - gastos en efectivo
 *
 * Es una regla de negocio por si sola, independiente del cierre y del pedido,
 * por eso vive en su propio servicio y no dentro de una entidad.
 */
export class ArqueoDeCaja {
  constructor({ dineroInicial, dineroFinal, ventasEnEfectivo, gastosEnEfectivo, declarado }) {
    this.dineroInicial = dineroInicial;
    this.dineroFinal = dineroFinal;
    this.ventasEnEfectivo = ventasEnEfectivo;
    this.gastosEnEfectivo = gastosEnEfectivo;
    this.declarado = declarado;
  }

  /**
   * @param {object} datos
   * @param {import('../entidades/CierreCaja').CierreCaja|null} datos.cierre
   */
  static calcular({ cierre, ventasEnEfectivo, gastosEnEfectivo }) {
    return new ArqueoDeCaja({
      dineroInicial: cierre?.dineroInicial ?? Dinero.cero(),
      dineroFinal: cierre?.dineroFinal ?? Dinero.cero(),
      ventasEnEfectivo,
      gastosEnEfectivo,
      declarado: !!cierre,
    });
  }

  get efectivoEsperado() {
    return this.dineroInicial.mas(this.ventasEnEfectivo).menos(this.gastosEnEfectivo);
  }

  get diferencia() {
    return this.dineroFinal.menos(this.efectivoEsperado);
  }

  /** true, false, o null cuando la cajera todavia no registro el cierre. */
  get cuadra() {
    if (!this.declarado) return null;
    return this.diferencia.esCero();
  }

  get sobra() {
    return !this.diferencia.esNegativo() && !this.diferencia.esCero();
  }

  get falta() {
    return this.diferencia.esNegativo();
  }
}
