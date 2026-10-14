import { Dinero } from '../valores/Dinero';
import { ArqueoDeCaja } from './ArqueoDeCaja';
import { seDetallaEnResumen } from '../valores/TipoProducto';

/**
 * Servicio de dominio que responde la pregunta del dueno: "como fue el dia".
 *
 * Recibe los pedidos, los gastos y el cierre ya cargados, y calcula todo en
 * memoria. No consulta la base ni arma correos: de esa forma se puede probar
 * con datos inventados y sirve igual para la pantalla del panel y para el
 * correo de medianoche.
 */
export class ResumenDiario {
  constructor({ fecha, pedidos, gastos, cierre }) {
    this.fecha = fecha;
    this.pedidos = pedidos.filter((p) => !p.anulado);
    this.gastos = gastos;
    this.cierre = cierre;
    this.arqueo = ArqueoDeCaja.calcular({
      cierre,
      ventasEnEfectivo: this.ventasEnEfectivo,
      gastosEnEfectivo: this.gastosEnEfectivo,
    });
  }

  // ---------------------------------------------------------------- ventas
  get ventaTotal() {
    return Dinero.sumar(this.pedidos.map((p) => p.total));
  }

  get descuentoTotal() {
    return Dinero.sumar(this.pedidos.map((p) => p.descuento));
  }

  get ventasEnEfectivo() {
    return Dinero.sumar(this.pedidos.map((p) => p.formasDePago.efectivo));
  }

  get ventasPorYape() {
    return Dinero.sumar(this.pedidos.map((p) => p.formasDePago.yape));
  }

  get ventasPorPlin() {
    return Dinero.sumar(this.pedidos.map((p) => p.formasDePago.plin));
  }

  get cobradoEnAdicionales() {
    return Dinero.sumar(this.pedidos.map((p) => p.totalAdicionales));
  }

  get ticketPromedio() {
    if (!this.pedidos.length) return Dinero.cero();
    return this.ventaTotal.por(1 / this.pedidos.length);
  }

  // ---------------------------------------------------------------- pizzas
  get pizzasVendidas() {
    return this.pedidos.reduce((suma, p) => suma + p.pizzasVendidas, 0);
  }

  /** [["Americana (Familiar)", 6], ...] ordenado de mayor a menor. */
  get pizzasPorTipo() {
    return this.#contar(
      (linea) => (seDetallaEnResumen(linea.tipo) ? linea.etiqueta : null)
    );
  }

  /** [["Familiar", 12], ["Personal", 5], ...] */
  get pizzasPorPresentacion() {
    return this.#contar(
      (linea) => (linea.pizzasEquivalentes > 0 ? linea.nombreVariante || null : null)
    );
  }

  #contar(obtenerClave) {
    const conteo = new Map();
    for (const pedido of this.pedidos) {
      for (const linea of pedido.lineas) {
        const clave = obtenerClave(linea);
        if (!clave) continue;
        conteo.set(clave, (conteo.get(clave) || 0) + linea.cantidad);
      }
    }
    return [...conteo.entries()].sort((a, b) => b[1] - a[1]);
  }

  // ---------------------------------------------------------------- gastos
  get gastoTotal() {
    return Dinero.sumar(this.gastos.map((g) => g.monto));
  }

  get gastosEnEfectivo() {
    return Dinero.sumar(this.gastos.filter((g) => g.salioDeCaja).map((g) => g.monto));
  }

  // -------------------------------------------------------------- controles
  /** Lineas donde la cajera cobro un precio distinto al de la carta. */
  get lineasConPrecioEditado() {
    return this.pedidos.flatMap((p) =>
      p.lineasConPrecioEditado.map((linea) => ({ correlativo: p.correlativo, linea }))
    );
  }

  get utilidadAproximada() {
    return this.ventaTotal.menos(this.gastoTotal);
  }

  get hayCierre() {
    return !!this.cierre;
  }

  get pedidosDelivery() {
    return this.pedidos.filter((p) => p.esDelivery).length;
  }

  get pedidosEnLocal() {
    return this.pedidos.length - this.pedidosDelivery;
  }
}
