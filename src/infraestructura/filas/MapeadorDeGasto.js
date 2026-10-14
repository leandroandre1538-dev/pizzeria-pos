import { Gasto } from '@/dominio/entidades/Gasto';
import { Dinero } from '@/dominio/valores/Dinero';
import { FechaOperativa } from '@/dominio/valores/FechaOperativa';

/**
 * Traduce entre la fila de la tabla `gastos` y la entidad Gasto.
 * La usan todos los adaptadores que guardan filas (Supabase y memoria).
 */
export const MapeadorDeGasto = {
  aDominio(fila) {
    return new Gasto({
      id: fila.id,
      fecha: new FechaOperativa(fila.fecha),
      descripcion: fila.descripcion,
      categoria: fila.categoria,
      monto: Dinero.deSoles(fila.monto),
      medioDePago: fila.metodo_pago,
      registradoPor: fila.registrado_por || '',
      creadoEn: fila.creado_en,
    });
  },

  aFila(gasto) {
    return {
      fecha: gasto.fecha.iso,
      descripcion: gasto.descripcion,
      categoria: gasto.categoria,
      monto: gasto.monto.soles,
      metodo_pago: gasto.medioDePago,
      registrado_por: gasto.registradoPor,
    };
  },
};
