import { Dinero } from './Dinero';
import { ErrorDeValidacion } from '../errores/ErroresDominio';

/**
 * Objeto de valor con el desglose de cobro de un pedido.
 *
 * La pizzeria cobra en efectivo, Yape y Plin, y un mismo pedido puede
 * dividirse entre varios medios. El desglose tiene que cuadrar exactamente
 * con el total, porque de ahi sale el arqueo de caja del dia.
 */
export class FormasDePago {
  constructor({ efectivo = Dinero.cero(), yape = Dinero.cero(), plin = Dinero.cero() }) {
    this.efectivo = efectivo;
    this.yape = yape;
    this.plin = plin;
    Object.freeze(this);
  }

  /** Todo el pedido cobrado en un solo medio. */
  static todoEn(medio, monto) {
    const vacio = { efectivo: Dinero.cero(), yape: Dinero.cero(), plin: Dinero.cero() };
    if (!(medio in vacio)) {
      throw new ErrorDeValidacion(`Forma de pago desconocida: "${medio}".`);
    }
    return new FormasDePago({ ...vacio, [medio]: monto });
  }

  get total() {
    return Dinero.sumar([this.efectivo, this.yape, this.plin]);
  }

  /**
   * Ajusta el desglose al total del pedido.
   * Si la cajera no desgloso nada, se asume que todo entro en efectivo, que es
   * lo habitual en el mostrador.
   */
  conciliarCon(total) {
    if (this.total.esCero()) return FormasDePago.todoEn('efectivo', total);

    if (!this.total.igualA(total)) {
      throw new ErrorDeValidacion(
        `El desglose de pago (${this.total}) no coincide con el total (${total}).`
      );
    }
    return this;
  }
}
