import { Dinero } from '../valores/Dinero';
import { TipoProducto, esTipoValido } from '../valores/TipoProducto';
import { ErrorDeValidacion } from '../errores/ErroresDominio';

/**
 * Una linea del pedido: un producto en una presentacion, con su cantidad,
 * sus adicionales y el precio que finalmente se cobro.
 *
 * Guarda a la vez el precio de carta y el precio cobrado. Cuando la cajera
 * cambia el precio antes de cerrar el pedido, la diferencia queda registrada
 * y el dueno la ve en el resumen del dia.
 */
export class LineaPedido {
  constructor({
    productoId,
    varianteId,
    nombreProducto,
    nombreVariante = '',
    tipo = TipoProducto.SIMPLE,
    pizzasEquivalentes = 0,
    cantidad,
    precioLista,
    precioUnitario,
    adicionales = [],
    motivoEdicion = '',
    nota = '',
  }) {
    if (!nombreProducto?.trim()) {
      throw new ErrorDeValidacion('La linea del pedido necesita un producto.');
    }
    if (!Number.isInteger(cantidad) || cantidad < 1) {
      throw new ErrorDeValidacion(`Cantidad invalida para "${nombreProducto}".`);
    }
    if (precioUnitario.esNegativo()) {
      throw new ErrorDeValidacion(`El precio de "${nombreProducto}" no puede ser negativo.`);
    }
    if (!esTipoValido(tipo)) {
      throw new ErrorDeValidacion(`Tipo de producto desconocido: "${tipo}".`);
    }

    this.productoId = productoId ?? null;
    this.varianteId = varianteId ?? null;
    this.nombreProducto = nombreProducto.trim();
    this.nombreVariante = nombreVariante;
    this.tipo = tipo;
    this.pizzasEquivalentes = Number(pizzasEquivalentes) || 0;
    this.cantidad = cantidad;
    this.precioLista = precioLista;
    this.precioUnitario = precioUnitario;
    this.adicionales = adicionales;
    this.motivoEdicion = motivoEdicion;
    this.nota = nota;

    Object.freeze(this);
  }

  /** Costo de los adicionales de UNA unidad. */
  get adicionalesPorUnidad() {
    return Dinero.sumar(this.adicionales.map((a) => a.precio));
  }

  /** Costo de los adicionales de toda la linea. */
  get adicionalesTotal() {
    return this.adicionalesPorUnidad.por(this.cantidad);
  }

  /** Lo que se cobra por esta linea: (precio + adicionales) x cantidad. */
  get total() {
    return this.precioUnitario.mas(this.adicionalesPorUnidad).por(this.cantidad);
  }

  /** True si la cajera cobro un precio distinto al de la carta. */
  get precioFueEditado() {
    return !this.precioUnitario.igualA(this.precioLista);
  }

  /** Cuantas pizzas aporta esta linea al conteo del dia. */
  get pizzasVendidas() {
    return this.pizzasEquivalentes * this.cantidad;
  }

  /** Etiqueta con la que aparece en el resumen: "Americana (Familiar)". */
  get etiqueta() {
    return this.nombreVariante
      ? `${this.nombreProducto} (${this.nombreVariante})`
      : this.nombreProducto;
  }
}

/** Adicional aplicado a una linea (queso extra, tocino, etc.). */
export class Adicional {
  constructor(nombre, precio) {
    if (!nombre?.trim()) throw new ErrorDeValidacion('El adicional necesita un nombre.');
    this.nombre = nombre.trim();
    this.precio = precio;
    Object.freeze(this);
  }

  toJSON() {
    return { nombre: this.nombre, precio: this.precio.soles };
  }
}
