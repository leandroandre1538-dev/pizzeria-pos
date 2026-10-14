import { soles, escaparHtml } from '@/compartido/formato';

/**
 * Convierte un ResumenDiario en el correo que recibe el dueno.
 *
 * Es un adaptador de presentacion: decide como se ve el resumen, no que
 * contiene. Cambiar el diseno del correo no toca ninguna regla de negocio, y
 * el mismo resumen podria presentarse manana como PDF o como mensaje de
 * WhatsApp escribiendo otro armador.
 */
export class ArmadorDeCorreoDeResumen {
  armar(resumen, { motivo = 'automatico' } = {}) {
    return {
      asunto: this.#asunto(resumen, motivo),
      html: this.#html(resumen),
    };
  }

  #asunto(resumen, motivo) {
    const partes = [
      "Marocchino's",
      resumen.fecha.textoLargo,
      `${resumen.pizzasVendidas} pizzas`,
      soles(resumen.ventaTotal),
    ];
    if (resumen.arqueo.cuadra === false) partes.push('CAJA NO CUADRO');
    if (motivo === 'manual') partes.push('(envio manual)');
    return partes.join(' · ');
  }

  #html(resumen) {
    const { arqueo, cierre } = resumen;

    return `<!doctype html>
<html lang="es"><body style="margin:0;padding:24px;background:#f4f1ef;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif">
  <div style="max-width:640px;margin:0 auto">

    ${encabezado(resumen)}

    ${bloque('Resumen general', [
      fila('Pedidos atendidos', `<b>${resumen.pedidos.length}</b>`),
      fila('Pizzas vendidas', `<b>${resumen.pizzasVendidas}</b>`),
      fila('Venta total', soles(resumen.ventaTotal), true),
      fila('Gastos del dia', soles(resumen.gastoTotal)),
      fila('Utilidad aproximada', soles(resumen.utilidadAproximada), true),
      fila('Ticket promedio', soles(resumen.ticketPromedio)),
      fila('Delivery / Local', `${resumen.pedidosDelivery} / ${resumen.pedidosEnLocal}`),
    ])}

    ${bloque('Formas de pago', [
      fila('Efectivo', soles(resumen.ventasEnEfectivo)),
      fila('Yape', soles(resumen.ventasPorYape)),
      fila('Plin', soles(resumen.ventasPorPlin)),
      fila('Descuentos aplicados', soles(resumen.descuentoTotal)),
      fila('Cobrado en adicionales', soles(resumen.cobradoEnAdicionales)),
    ])}

    ${bloque('Cuadre de caja', [
      fila('Dinero encontrado al inicio del dia', soles(arqueo.dineroInicial)),
      fila('Dinero encontrado al final del dia', soles(arqueo.dineroFinal)),
      fila('Efectivo esperado en caja', soles(arqueo.efectivoEsperado)),
      fila('Diferencia', soles(arqueo.diferencia)),
      fila('Estado', estadoDeCuadre(arqueo), true),
    ])}

    ${bloque('Masa y harina para manana', [
      fila('Masas que quedaron', cierre ? `<b>${cierre.masasRestantes}</b>` : noRegistrado()),
      fila('Dejo harina para preparar masa', cierre ? (cierre.dejoHarina ? 'SI' : 'NO') : noRegistrado()),
      fila('Cuanta harina dejo', cierre?.dejoHarina ? `<b>${cierre.harinaKg} kg</b>` : '—'),
    ])}

    ${bloque(
      'Pizzas vendidas por tipo',
      resumen.pizzasPorTipo.length
        ? resumen.pizzasPorTipo.map(([nombre, cantidad]) => fila(escaparHtml(nombre), `<b>${cantidad}</b>`))
        : [fila('Sin pizzas registradas', '—')]
    )}

    ${bloque(
      'Detalle de gastos',
      resumen.gastos.length
        ? resumen.gastos.map((gasto) =>
            fila(
              `${escaparHtml(gasto.descripcion)} <span style="color:#999">(${gasto.categoria} / ${gasto.medioDePago})</span>`,
              soles(gasto.monto)
            )
          )
        : [fila('Sin gastos registrados', soles(0))]
    )}

    ${observaciones(cierre)}
    ${avisoPreciosEditados(resumen)}
    ${avisoSinCierre(resumen)}

    <div style="text-align:center;color:#999;font-size:12px;margin-top:22px;line-height:1.6">
      Correo automatico generado a las 00:05 (hora de Peru).<br/>
      Marocchino's Pizzeria · Asoc. Los Claveles Mz. U2 Lote 13, G.A.L. Tacna
    </div>
  </div>
</body></html>`;
  }
}

/* ---------------------------------------------------------------- piezas */

function encabezado(resumen) {
  return `<div style="background:#3d0a13;border-radius:12px;padding:22px 24px;margin-bottom:20px">
      <div style="color:#f6c453;font-size:12px;letter-spacing:2px;font-weight:700">MAROCCHINO'S PIZZERIA</div>
      <div style="color:#fff;font-size:24px;font-weight:800;margin-top:4px">Resumen del dia</div>
      <div style="color:#e6bfc6;font-size:14px;margin-top:2px">${resumen.fecha.textoLargo}</div>
    </div>`;
}

function bloque(titulo, filas) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fff;border:1px solid #e8e8e8;border-radius:10px;overflow:hidden;margin-bottom:18px">
      <tr><td colspan="2" style="background:#5c0f1b;color:#fff;padding:11px 14px;font-size:13px;font-weight:700;letter-spacing:.6px;text-transform:uppercase">${titulo}</td></tr>
      ${filas.join('')}
    </table>`;
}

function fila(etiqueta, valor, destacado = false) {
  const estiloValor = destacado
    ? 'font-weight:700;color:#7a1220'
    : 'color:#222';
  return `<tr>
      <td style="padding:9px 14px;border-bottom:1px solid #eee;color:#555;font-size:14px">${etiqueta}</td>
      <td style="padding:9px 14px;border-bottom:1px solid #eee;text-align:right;font-size:14px;${estiloValor}">${valor}</td>
    </tr>`;
}

function noRegistrado() {
  return '<span style="color:#b26a00">no registrado</span>';
}

function estadoDeCuadre(arqueo) {
  if (arqueo.cuadra === null) {
    return '<span style="color:#b26a00;font-weight:700">SIN CIERRE REGISTRADO</span>';
  }
  if (arqueo.cuadra) {
    return '<span style="color:#1a7f37;font-weight:700">SI CUADRO</span>';
  }
  const palabra = arqueo.falta ? 'falta' : 'sobra';
  return `<span style="color:#c62828;font-weight:700">NO CUADRO (${palabra} ${soles(
    arqueo.diferencia.valorAbsoluto()
  )})</span>`;
}

function observaciones(cierre) {
  const texto = cierre?.observaciones
    ? escaparHtml(cierre.observaciones)
    : 'Sin observaciones.';

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fff;border:1px solid #e8e8e8;border-radius:10px;overflow:hidden">
      <tr><td style="background:#5c0f1b;color:#fff;padding:11px 14px;font-size:13px;font-weight:700;letter-spacing:.6px;text-transform:uppercase">Observaciones de la cajera</td></tr>
      <tr><td style="padding:14px;font-size:14px;color:#333;white-space:pre-wrap">${texto}</td></tr>
    </table>`;
}

function avisoPreciosEditados(resumen) {
  const editadas = resumen.lineasConPrecioEditado;
  if (!editadas.length) return '';

  const detalle = editadas
    .map(
      ({ correlativo, linea }) =>
        `<li>Pedido #${correlativo} · ${escaparHtml(linea.etiqueta)}: carta ${soles(
          linea.precioLista
        )} → cobrado ${soles(linea.precioUnitario)}${
          linea.motivoEdicion ? ` (${escaparHtml(linea.motivoEdicion)})` : ''
        }</li>`
    )
    .join('');

  return `<div style="margin-top:16px;padding:12px 14px;background:#fff7e6;border:1px solid #f0d8a8;border-radius:8px;font-size:13px;color:#7a5200">
      <b>Precios editados manualmente (${editadas.length}):</b>
      <ul style="margin:8px 0 0;padding-left:18px;line-height:1.6">${detalle}</ul>
    </div>`;
}

function avisoSinCierre(resumen) {
  if (resumen.hayCierre) return '';
  return `<div style="margin-top:16px;padding:12px 14px;background:#fdecea;border:1px solid #f5c6c0;border-radius:8px;font-size:13px;color:#8a1c12">
      Atencion: la cajera no registro el cierre de caja de este dia.
    </div>`;
}
