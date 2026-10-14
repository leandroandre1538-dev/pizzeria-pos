import { soles } from '@/compartido/formato';

/**
 * Presentadores: convierten entidades del dominio en objetos planos para el
 * navegador.
 *
 * Existen para que el dominio no tenga que hablar JSON y para que la interfaz
 * no reciba instancias de Dinero, que no sobreviven a la serializacion. Es la
 * frontera entre "el modelo del negocio" y "lo que viaja por la red".
 */

export function pedidoAJson(pedido) {
  return {
    id: pedido.id,
    fecha: pedido.fecha.iso,
    correlativo: pedido.correlativo,
    cliente: pedido.cliente,
    telefono: pedido.telefono,
    canal: pedido.canal,
    direccion: pedido.direccion,
    subtotal: pedido.subtotal.soles,
    descuento: pedido.descuento.soles,
    total: pedido.total.soles,
    promocionNombre: pedido.promocionNombre,
    efectivo: pedido.formasDePago.efectivo.soles,
    yape: pedido.formasDePago.yape.soles,
    plin: pedido.formasDePago.plin.soles,
    nota: pedido.nota,
    anulado: pedido.anulado,
    pizzas: pedido.pizzasVendidas,
    items: pedido.lineas.map(lineaAJson),
  };
}

function lineaAJson(linea) {
  return {
    nombreProducto: linea.nombreProducto,
    nombreVariante: linea.nombreVariante,
    cantidad: linea.cantidad,
    precioLista: linea.precioLista.soles,
    precioUnitario: linea.precioUnitario.soles,
    precioEditado: linea.precioFueEditado,
    motivoEdicion: linea.motivoEdicion,
    adicionales: linea.adicionales.map((a) => a.toJSON()),
    totalLinea: linea.total.soles,
    nota: linea.nota,
  };
}

export function gastoAJson(gasto) {
  return {
    id: gasto.id,
    fecha: gasto.fecha.iso,
    descripcion: gasto.descripcion,
    categoria: gasto.categoria,
    monto: gasto.monto.soles,
    medioDePago: gasto.medioDePago,
  };
}

export function cierreAJson(cierre) {
  if (!cierre) return null;
  return {
    fecha: cierre.fecha.iso,
    dineroInicial: cierre.dineroInicial.soles,
    dineroFinal: cierre.dineroFinal.soles,
    masasRestantes: cierre.masasRestantes,
    dejoHarina: cierre.dejoHarina,
    harinaKg: cierre.harinaKg,
    observaciones: cierre.observaciones,
    cerrado: cierre.cerrado,
  };
}

export function promocionAJson(promocion, hoy) {
  return {
    id: promocion.id,
    nombre: promocion.nombre,
    descripcion: promocion.descripcion,
    tipo: promocion.tipo,
    valor: promocion.valor,
    montoMinimo: promocion.montoMinimo.soles,
    fechaInicio: promocion.fechaInicio.iso,
    fechaFin: promocion.fechaFin.iso,
    diasSemana: promocion.diasSemana,
    activo: promocion.activo,
    duracionEnDias: promocion.duracionEnDias,
    descuentoLegible: promocion.descuentoLegible,
    estado: hoy ? promocion.estadoAl(hoy) : null,
  };
}

export function resumenAJson(resumen) {
  const { arqueo, cierre } = resumen;

  return {
    fecha: resumen.fecha.iso,
    fechaTexto: resumen.fecha.textoLargo,
    hayCierre: resumen.hayCierre,
    pedidos: {
      cantidad: resumen.pedidos.length,
      delivery: resumen.pedidosDelivery,
      local: resumen.pedidosEnLocal,
      ticketPromedio: resumen.ticketPromedio.soles,
    },
    ventas: {
      total: resumen.ventaTotal.soles,
      descuento: resumen.descuentoTotal.soles,
      adicionales: resumen.cobradoEnAdicionales.soles,
      efectivo: resumen.ventasEnEfectivo.soles,
      yape: resumen.ventasPorYape.soles,
      plin: resumen.ventasPorPlin.soles,
    },
    pizzas: {
      total: resumen.pizzasVendidas,
      porTipo: resumen.pizzasPorTipo,
      porPresentacion: resumen.pizzasPorPresentacion,
    },
    gastos: {
      total: resumen.gastoTotal.soles,
      efectivo: resumen.gastosEnEfectivo.soles,
      detalle: resumen.gastos.map(gastoAJson),
    },
    caja: {
      dineroInicial: arqueo.dineroInicial.soles,
      dineroFinal: arqueo.dineroFinal.soles,
      efectivoEsperado: arqueo.efectivoEsperado.soles,
      diferencia: arqueo.diferencia.soles,
      cuadra: arqueo.cuadra,
      resumenLegible:
        arqueo.cuadra === null
          ? 'Sin cierre registrado'
          : arqueo.cuadra
            ? 'La caja cuadra'
            : `${arqueo.falta ? 'Falta' : 'Sobra'} ${soles(arqueo.diferencia.valorAbsoluto())}`,
    },
    masa: {
      masasRestantes: cierre?.masasRestantes ?? null,
      dejoHarina: cierre?.dejoHarina ?? null,
      harinaKg: cierre?.harinaKg ?? 0,
    },
    observaciones: cierre?.observaciones || '',
    preciosEditados: resumen.lineasConPrecioEditado.map(({ correlativo, linea }) => ({
      correlativo,
      producto: linea.etiqueta,
      precioLista: linea.precioLista.soles,
      precioCobrado: linea.precioUnitario.soles,
      motivo: linea.motivoEdicion,
    })),
    utilidadAproximada: resumen.utilidadAproximada.soles,
  };
}
