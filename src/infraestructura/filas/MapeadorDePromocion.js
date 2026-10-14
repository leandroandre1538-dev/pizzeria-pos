import { Promocion } from '@/dominio/entidades/Promocion';
import { Dinero } from '@/dominio/valores/Dinero';
import { FechaOperativa } from '@/dominio/valores/FechaOperativa';

/** Traduce entre la fila de `promociones` y la entidad Promocion. */
export const MapeadorDePromocion = {
  aDominio(fila) {
    return new Promocion({
      id: fila.id,
      nombre: fila.nombre,
      descripcion: fila.descripcion || '',
      tipo: fila.tipo,
      valor: Number(fila.valor),
      montoMinimo: Dinero.deSoles(fila.monto_minimo),
      fechaInicio: new FechaOperativa(fila.fecha_inicio),
      fechaFin: new FechaOperativa(fila.fecha_fin),
      diasSemana: fila.dias_semana || [],
      activo: fila.activo,
    });
  },

  aFila(promocion) {
    return {
      nombre: promocion.nombre,
      descripcion: promocion.descripcion,
      tipo: promocion.tipo,
      valor: promocion.valor,
      monto_minimo: promocion.montoMinimo.soles,
      fecha_inicio: promocion.fechaInicio.iso,
      fecha_fin: promocion.fechaFin.iso,
      dias_semana: promocion.diasSemana,
      activo: promocion.activo,
    };
  },
};
