import { Pedido } from '@/dominio/entidades/Pedido';
import { LineaPedido, Adicional } from '@/dominio/entidades/LineaPedido';
import { FormasDePago } from '@/dominio/valores/FormasDePago';
import { Dinero } from '@/dominio/valores/Dinero';
import { FechaOperativa } from '@/dominio/valores/FechaOperativa';

/**
 * Traduce entre las filas de Postgres y las entidades del dominio.
 *
 * Es la unica pieza que conoce los dos lados. Gracias a esto el dominio usa
 * `Dinero` y `FechaOperativa`, mientras la base guarda numeric y date, y
 * ninguno de los dos necesita adaptarse al otro.
 */
export const MapeadorDePedido = {
  aDominio(fila) {
    return new Pedido({
      id: fila.id,
      fecha: new FechaOperativa(fila.fecha),
      correlativo: fila.correlativo,
      lineas: (fila.pedido_items || []).map(lineaADominio),
      subtotal: Dinero.deSoles(fila.subtotal),
      descuento: Dinero.deSoles(fila.descuento),
      total: Dinero.deSoles(fila.total),
      formasDePago: new FormasDePago({
        efectivo: Dinero.deSoles(fila.efectivo),
        yape: Dinero.deSoles(fila.yape),
        plin: Dinero.deSoles(fila.plin),
      }),
      promocionId: fila.promocion_id,
      promocionNombre: fila.promocion_nombre || '',
      cliente: fila.cliente || '',
      telefono: fila.telefono || '',
      canal: fila.canal,
      direccion: fila.direccion || '',
      nota: fila.nota || '',
      anulado: fila.anulado,
      atendidoPor: fila.atendido_por || '',
      creadoEn: fila.creado_en,
    });
  },

  aFilaDePedido(pedido) {
    return {
      fecha: pedido.fecha.iso,
      correlativo: pedido.correlativo,
      cliente: pedido.cliente,
      telefono: pedido.telefono,
      canal: pedido.canal,
      direccion: pedido.direccion,
      subtotal: pedido.subtotal.soles,
      descuento: pedido.descuento.soles,
      total: pedido.total.soles,
      promocion_id: pedido.promocionId,
      promocion_nombre: pedido.promocionNombre,
      efectivo: pedido.formasDePago.efectivo.soles,
      yape: pedido.formasDePago.yape.soles,
      plin: pedido.formasDePago.plin.soles,
      nota: pedido.nota,
      atendido_por: pedido.atendidoPor,
    };
  },

  aFilasDeLineas(pedido, pedidoId) {
    return pedido.lineas.map((linea) => ({
      pedido_id: pedidoId,
      producto_id: linea.productoId,
      variante_id: linea.varianteId,
      nombre_producto: linea.nombreProducto,
      nombre_variante: linea.nombreVariante,
      tipo: linea.tipo,
      pizzas_equivalentes: linea.pizzasEquivalentes,
      cantidad: linea.cantidad,
      precio_lista: linea.precioLista.soles,
      precio_unitario: linea.precioUnitario.soles,
      precio_editado: linea.precioFueEditado,
      motivo_edicion: linea.motivoEdicion,
      extras: linea.adicionales.map((a) => a.toJSON()),
      extras_total: linea.adicionalesTotal.soles,
      total_linea: linea.total.soles,
      nota: linea.nota,
    }));
  },
};

function lineaADominio(fila) {
  return new LineaPedido({
    productoId: fila.producto_id,
    varianteId: fila.variante_id,
    nombreProducto: fila.nombre_producto,
    nombreVariante: fila.nombre_variante || '',
    tipo: fila.tipo,
    pizzasEquivalentes: Number(fila.pizzas_equivalentes),
    cantidad: fila.cantidad,
    precioLista: Dinero.deSoles(fila.precio_lista),
    precioUnitario: Dinero.deSoles(fila.precio_unitario),
    adicionales: (fila.extras || []).map(
      (extra) => new Adicional(extra.nombre, Dinero.deSoles(extra.precio))
    ),
    motivoEdicion: fila.motivo_edicion || '',
    nota: fila.nota || '',
  });
}
