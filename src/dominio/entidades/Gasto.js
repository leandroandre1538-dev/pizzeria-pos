import { ErrorDeValidacion } from '../errores/ErroresDominio';

export const CategoriaGasto = Object.freeze({
  INSUMOS: 'insumos',
  PERSONAL: 'personal',
  SERVICIOS: 'servicios',
  DELIVERY: 'delivery',
  OTROS: 'otros',
});

const MEDIOS = ['efectivo', 'yape', 'plin'];

/**
 * Salida de dinero del dia.
 *
 * Solo los gastos pagados en efectivo afectan el arqueo de caja; los pagados
 * por Yape o Plin salen de la cuenta, no del cajon.
 */
export class Gasto {
  constructor({
    id = null,
    fecha,
    descripcion,
    categoria = CategoriaGasto.INSUMOS,
    monto,
    medioDePago = 'efectivo',
    registradoPor = '',
    creadoEn = null,
  }) {
    if (!descripcion?.trim()) {
      throw new ErrorDeValidacion('Escribe una descripcion del gasto.');
    }
    if (monto.esNegativo() || monto.esCero()) {
      throw new ErrorDeValidacion('El monto del gasto debe ser mayor a cero.');
    }
    if (!MEDIOS.includes(medioDePago)) {
      throw new ErrorDeValidacion(`Medio de pago desconocido: "${medioDePago}".`);
    }

    this.id = id;
    this.fecha = fecha;
    this.descripcion = descripcion.trim();
    this.categoria = categoria;
    this.monto = monto;
    this.medioDePago = medioDePago;
    this.registradoPor = registradoPor;
    this.creadoEn = creadoEn;
  }

  get salioDeCaja() {
    return this.medioDePago === 'efectivo';
  }
}
