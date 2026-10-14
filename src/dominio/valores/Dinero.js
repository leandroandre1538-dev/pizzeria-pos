import { ErrorDeValidacion } from '../errores/ErroresDominio';

/**
 * Objeto de valor que representa un monto en soles.
 *
 * Se guarda en centimos enteros para evitar los errores de redondeo de los
 * decimales binarios (0.1 + 0.2 !== 0.3). Es inmutable: toda operacion
 * devuelve una instancia nueva.
 */
export class Dinero {
  #centimos;

  constructor(centimos) {
    if (!Number.isFinite(centimos)) {
      throw new ErrorDeValidacion('El monto no es un numero valido.');
    }
    this.#centimos = Math.round(centimos);
  }

  /** Crea un monto a partir de soles: Dinero.deSoles(25.5) */
  static deSoles(valor) {
    const numero = typeof valor === 'string' ? parseFloat(valor) : Number(valor);
    if (!Number.isFinite(numero)) {
      throw new ErrorDeValidacion('El monto no es un numero valido.');
    }
    return new Dinero(numero * 100);
  }

  static cero() {
    return new Dinero(0);
  }

  /** Suma una lista de montos sin perder precision. */
  static sumar(montos) {
    return montos.reduce((acumulado, actual) => acumulado.mas(actual), Dinero.cero());
  }

  get centimos() {
    return this.#centimos;
  }

  get soles() {
    return this.#centimos / 100;
  }

  mas(otro) {
    return new Dinero(this.#centimos + otro.centimos);
  }

  menos(otro) {
    return new Dinero(this.#centimos - otro.centimos);
  }

  por(factor) {
    return new Dinero(this.#centimos * factor);
  }

  /** Aplica un porcentaje: Dinero.deSoles(100).porcentaje(10) => S/ 10.00 */
  porcentaje(puntos) {
    return new Dinero((this.#centimos * puntos) / 100);
  }

  esNegativo() {
    return this.#centimos < 0;
  }

  esCero() {
    return this.#centimos === 0;
  }

  esMayorOIgualQue(otro) {
    return this.#centimos >= otro.centimos;
  }

  igualA(otro) {
    return this.#centimos === otro.centimos;
  }

  /** Nunca deja que un monto baje de cero (util para descuentos). */
  nuncaNegativo() {
    return this.#centimos < 0 ? Dinero.cero() : this;
  }

  /** El menor de dos montos. */
  acotadoA(maximo) {
    return this.#centimos > maximo.centimos ? maximo : this;
  }

  valorAbsoluto() {
    return new Dinero(Math.abs(this.#centimos));
  }

  toJSON() {
    return this.soles;
  }

  toString() {
    return `S/ ${this.soles.toFixed(2)}`;
  }
}
