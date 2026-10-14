import { Dinero } from '../valores/Dinero';
import { ErrorDeValidacion } from '../errores/ErroresDominio';

/**
 * Lo que la cajera declara al terminar el dia: el dinero que encontro al
 * abrir y al cerrar, cuantas masas quedaron, si dejo harina para el dia
 * siguiente y sus observaciones.
 *
 * Esta entidad solo guarda lo declarado. Comparar eso con lo que el sistema
 * calculo es trabajo de ArqueoDeCaja, que es otra responsabilidad.
 */
export class CierreCaja {
  constructor({
    id = null,
    fecha,
    dineroInicial = Dinero.cero(),
    dineroFinal = Dinero.cero(),
    masasRestantes = 0,
    dejoHarina = false,
    harinaKg = 0,
    observaciones = '',
    cerrado = false,
    cerradoPor = '',
  }) {
    if (dineroInicial.esNegativo() || dineroFinal.esNegativo()) {
      throw new ErrorDeValidacion('El dinero en caja no puede ser negativo.');
    }
    if (masasRestantes < 0) {
      throw new ErrorDeValidacion('Las masas restantes no pueden ser un numero negativo.');
    }

    this.id = id;
    this.fecha = fecha;
    this.dineroInicial = dineroInicial;
    this.dineroFinal = dineroFinal;
    this.masasRestantes = masasRestantes;
    this.dejoHarina = dejoHarina;
    // Si no dejo harina, la cantidad siempre es cero: evita datos contradictorios.
    this.harinaKg = dejoHarina ? Number(harinaKg) || 0 : 0;
    this.observaciones = observaciones;
    this.cerrado = cerrado;
    this.cerradoPor = cerradoPor;
  }
}
