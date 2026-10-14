import { Dinero } from '../valores/Dinero';
import { ErrorDeValidacion } from '../errores/ErroresDominio';

export const CanalPedido = Object.freeze({
  DELIVERY: 'delivery',
  LOCAL: 'local',
});

/**
 * Raiz del agregado Pedido.
 *
 * Es la unica que decide cuanto se cobra: suma las lineas, aplica la promocion
 * si corresponde y verifica que el desglose de pago cuadre. Ni las rutas HTTP
 * ni la interfaz pueden saltarse este calculo, asi que un precio manipulado
 * desde el navegador no altera el total real.
 */
export class Pedido {
  constructor({
    id = null,
    fecha,
    correlativo,
    lineas,
    subtotal,
    descuento,
    total,
    formasDePago,
    promocionId = null,
    promocionNombre = '',
    cliente = '',
    telefono = '',
    canal = CanalPedido.DELIVERY,
    direccion = '',
    nota = '',
    anulado = false,
    atendidoPor = '',
    creadoEn = null,
  }) {
    this.id = id;
    this.fecha = fecha;
    this.correlativo = correlativo;
    this.lineas = lineas;
    this.subtotal = subtotal;
    this.descuento = descuento;
    this.total = total;
    this.formasDePago = formasDePago;
    this.promocionId = promocionId;
    this.promocionNombre = promocionNombre;
    this.cliente = cliente;
    this.telefono = telefono;
    this.canal = canal;
    this.direccion = direccion;
    this.nota = nota;
    this.anulado = anulado;
    this.atendidoPor = atendidoPor;
    this.creadoEn = creadoEn;
  }

  /**
   * Crea un pedido nuevo calculando todos sus importes.
   *
   * @param {object}   datos
   * @param {import('../valores/FechaOperativa').FechaOperativa} datos.fecha
   * @param {number}   datos.correlativo  numero del pedido dentro del dia
   * @param {import('./LineaPedido').LineaPedido[]} datos.lineas
   * @param {import('./Promocion').Promocion|null}  datos.promocion
   * @param {import('../valores/FormasDePago').FormasDePago} datos.formasDePago
   */
  static registrar({ fecha, correlativo, lineas, promocion = null, formasDePago, ...resto }) {
    if (!lineas?.length) {
      throw new ErrorDeValidacion('El pedido no tiene productos.');
    }

    const subtotal = Dinero.sumar(lineas.map((l) => l.total));
    const descuento = promocion
      ? promocion.calcularDescuento(subtotal, fecha)
      : Dinero.cero();
    const total = subtotal.menos(descuento).nuncaNegativo();

    // Si la promo no llego a aplicarse, el pedido no debe quedar marcado con ella.
    const aplico = !descuento.esCero();

    return new Pedido({
      ...resto,
      fecha,
      correlativo,
      lineas,
      subtotal,
      descuento,
      total,
      formasDePago: formasDePago.conciliarCon(total),
      promocionId: aplico ? promocion.id : null,
      promocionNombre: aplico ? promocion.nombre : '',
    });
  }

  get cantidadDeProductos() {
    return this.lineas.reduce((suma, l) => suma + l.cantidad, 0);
  }

  get pizzasVendidas() {
    return this.lineas.reduce((suma, l) => suma + l.pizzasVendidas, 0);
  }

  get totalAdicionales() {
    return Dinero.sumar(this.lineas.map((l) => l.adicionalesTotal));
  }

  get lineasConPrecioEditado() {
    return this.lineas.filter((l) => l.precioFueEditado);
  }

  get esDelivery() {
    return this.canal === CanalPedido.DELIVERY;
  }
}
