import { CierreCaja } from '@/dominio/entidades/CierreCaja';
import { Dinero } from '@/dominio/valores/Dinero';
import { FechaOperativa } from '@/dominio/valores/FechaOperativa';

/** Traduce entre la fila de `cierres_dia` y la entidad CierreCaja. */
export const MapeadorDeCierre = {
  aDominio(fila) {
    return new CierreCaja({
      id: fila.id,
      fecha: new FechaOperativa(fila.fecha),
      dineroInicial: Dinero.deSoles(fila.dinero_inicial),
      dineroFinal: Dinero.deSoles(fila.dinero_final),
      masasRestantes: fila.masas_restantes,
      dejoHarina: fila.dejo_harina,
      harinaKg: Number(fila.harina_kg),
      observaciones: fila.observaciones || '',
      cerrado: fila.cerrado,
      cerradoPor: fila.cerrado_por || '',
    });
  },

  aFila(cierre) {
    return {
      fecha: cierre.fecha.iso,
      dinero_inicial: cierre.dineroInicial.soles,
      dinero_final: cierre.dineroFinal.soles,
      masas_restantes: cierre.masasRestantes,
      dejo_harina: cierre.dejoHarina,
      harina_kg: cierre.harinaKg,
      observaciones: cierre.observaciones,
      cerrado: cierre.cerrado,
      cerrado_por: cierre.cerradoPor,
      actualizado_en: new Date().toISOString(),
    };
  },
};
