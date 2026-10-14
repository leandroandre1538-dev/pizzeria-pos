import { CierreCaja } from '@/dominio/entidades/CierreCaja';
import { Dinero } from '@/dominio/valores/Dinero';
import { FechaOperativa } from '@/dominio/valores/FechaOperativa';

/**
 * Caso de uso: la cajera guarda el cierre del dia.
 *
 * Puede llamarse varias veces: primero como avance y al final con
 * `cerrado = true`. Siempre deja un solo cierre por fecha.
 */
export class GuardarCierreDelDia {
  constructor({ repositorioDeCierres, reloj }) {
    this.repositorioDeCierres = repositorioDeCierres;
    this.reloj = reloj;
  }

  async ejecutar(entrada, cerradoPor = '') {
    const cierre = new CierreCaja({
      fecha: entrada.fecha ? new FechaOperativa(entrada.fecha) : this.reloj.hoy(),
      dineroInicial: Dinero.deSoles(entrada.dinero_inicial || 0),
      dineroFinal: Dinero.deSoles(entrada.dinero_final || 0),
      masasRestantes: parseInt(entrada.masas_restantes, 10) || 0,
      dejoHarina: !!entrada.dejo_harina,
      harinaKg: entrada.harina_kg,
      observaciones: entrada.observaciones || '',
      cerrado: !!entrada.cerrado,
      cerradoPor,
    });

    return this.repositorioDeCierres.guardar(cierre);
  }
}
