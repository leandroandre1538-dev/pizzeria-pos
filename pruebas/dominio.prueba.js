/**
 * Pruebas de las reglas de negocio.
 *
 * Se ejecutan con `npm test`. No necesitan base de datos ni servidor: el
 * dominio es codigo puro, y esa es justamente la ventaja de tenerlo separado
 * de Supabase y de Next.
 */
import assert from 'node:assert/strict';

import { Dinero } from '@/dominio/valores/Dinero';
import { FechaOperativa } from '@/dominio/valores/FechaOperativa';
import { FormasDePago } from '@/dominio/valores/FormasDePago';
import { Pedido } from '@/dominio/entidades/Pedido';
import { LineaPedido, Adicional } from '@/dominio/entidades/LineaPedido';
import { Promocion } from '@/dominio/entidades/Promocion';
import { Gasto } from '@/dominio/entidades/Gasto';
import { CierreCaja } from '@/dominio/entidades/CierreCaja';
import { ArqueoDeCaja } from '@/dominio/servicios/ArqueoDeCaja';
import { ResumenDiario } from '@/dominio/servicios/ResumenDiario';
import { ErrorDeValidacion } from '@/dominio/errores/ErroresDominio';

let pasadas = 0;
const fallos = [];

function prueba(nombre, cuerpo) {
  try {
    cuerpo();
    pasadas += 1;
    console.log(`  ok  ${nombre}`);
  } catch (error) {
    fallos.push({ nombre, error });
    console.log(`  FALLO  ${nombre}\n        ${error.message}`);
  }
}

function grupo(titulo) {
  console.log(`\n${titulo}`);
}

/* ====================================================================== */
grupo('Dinero');

prueba('suma sin errores de redondeo binario', () => {
  const total = Dinero.sumar([Dinero.deSoles(0.1), Dinero.deSoles(0.2)]);
  assert.equal(total.soles, 0.3);
});

prueba('un porcentaje se calcula sobre centimos', () => {
  assert.equal(Dinero.deSoles(23).porcentaje(10).soles, 2.3);
});

prueba('un descuento nunca deja el total en negativo', () => {
  assert.equal(Dinero.deSoles(10).menos(Dinero.deSoles(25)).nuncaNegativo().soles, 0);
});

/* ====================================================================== */
grupo('FechaOperativa');

prueba('reconoce el dia de la semana (1 = lunes)', () => {
  assert.equal(new FechaOperativa('2026-09-19').diaSemana, 6); // sabado
  assert.equal(new FechaOperativa('2026-09-21').diaSemana, 1); // lunes
});

prueba('rechaza una fecha con formato invalido', () => {
  assert.throws(() => new FechaOperativa('19/09/2026'), ErrorDeValidacion);
});

/* ====================================================================== */
grupo('Pedido');

const fecha = new FechaOperativa('2026-09-19'); // sabado

function lineaAmericanaFamiliar({ cantidad = 1, precio = 23, adicionales = [] } = {}) {
  return new LineaPedido({
    productoId: 4,
    varianteId: 12,
    nombreProducto: 'Americana',
    nombreVariante: 'Familiar',
    tipo: 'pizza',
    pizzasEquivalentes: 1,
    cantidad,
    precioLista: Dinero.deSoles(23),
    precioUnitario: Dinero.deSoles(precio),
    adicionales,
  });
}

prueba('suma las lineas y cobra los adicionales por unidad', () => {
  const linea = lineaAmericanaFamiliar({
    cantidad: 2,
    adicionales: [new Adicional('Porcion de queso extra', Dinero.deSoles(6))],
  });

  // (23 + 6) x 2 = 58
  assert.equal(linea.total.soles, 58);

  const pedido = Pedido.registrar({
    fecha,
    correlativo: 1,
    lineas: [linea],
    formasDePago: new FormasDePago({}),
  });

  assert.equal(pedido.subtotal.soles, 58);
  assert.equal(pedido.total.soles, 58);
  assert.equal(pedido.pizzasVendidas, 2);
});

prueba('sin desglose de pago, todo se asume en efectivo', () => {
  const pedido = Pedido.registrar({
    fecha,
    correlativo: 1,
    lineas: [lineaAmericanaFamiliar()],
    formasDePago: new FormasDePago({}),
  });

  assert.equal(pedido.formasDePago.efectivo.soles, 23);
  assert.equal(pedido.formasDePago.yape.soles, 0);
});

prueba('un pago mixto que no cuadra con el total se rechaza', () => {
  assert.throws(
    () =>
      Pedido.registrar({
        fecha,
        correlativo: 1,
        lineas: [lineaAmericanaFamiliar()],
        formasDePago: new FormasDePago({
          efectivo: Dinero.deSoles(10),
          yape: Dinero.deSoles(5), // faltan 8
        }),
      }),
    ErrorDeValidacion
  );
});

prueba('un pago mixto que cuadra se acepta', () => {
  const pedido = Pedido.registrar({
    fecha,
    correlativo: 1,
    lineas: [lineaAmericanaFamiliar()],
    formasDePago: new FormasDePago({
      efectivo: Dinero.deSoles(13),
      yape: Dinero.deSoles(10),
    }),
  });

  assert.equal(pedido.total.soles, 23);
  assert.equal(pedido.formasDePago.yape.soles, 10);
});

prueba('un precio editado queda registrado con el precio de carta', () => {
  const linea = lineaAmericanaFamiliar({ precio: 20 });
  assert.equal(linea.precioFueEditado, true);
  assert.equal(linea.precioLista.soles, 23);
  assert.equal(linea.precioUnitario.soles, 20);
});

prueba('un pedido sin productos se rechaza', () => {
  assert.throws(
    () => Pedido.registrar({ fecha, correlativo: 1, lineas: [], formasDePago: new FormasDePago({}) }),
    ErrorDeValidacion
  );
});

/* ====================================================================== */
grupo('Promociones');

function promocionDelSabado(extras = {}) {
  return new Promocion({
    id: 7,
    nombre: 'Fin de Semana 15%',
    tipo: 'porcentaje',
    valor: 15,
    montoMinimo: Dinero.deSoles(50),
    fechaInicio: new FechaOperativa('2026-09-01'),
    fechaFin: new FechaOperativa('2026-09-30'),
    diasSemana: [6, 7],
    ...extras,
  });
}

prueba('aplica el porcentaje cuando el pedido llega al monto minimo', () => {
  const promo = promocionDelSabado();
  assert.equal(promo.calcularDescuento(Dinero.deSoles(60), fecha).soles, 9);
});

prueba('no aplica si el pedido no llega al monto minimo', () => {
  const promo = promocionDelSabado();
  assert.equal(promo.calcularDescuento(Dinero.deSoles(40), fecha).soles, 0);
});

prueba('no aplica en un dia de la semana no permitido', () => {
  const lunes = new FechaOperativa('2026-09-21');
  assert.equal(promocionDelSabado().calcularDescuento(Dinero.deSoles(60), lunes).soles, 0);
});

prueba('no aplica fuera del rango de fechas', () => {
  const promo = promocionDelSabado();
  const octubre = new FechaOperativa('2026-10-03'); // sabado, pero vencida
  assert.equal(promo.calcularDescuento(Dinero.deSoles(60), octubre).soles, 0);
});

prueba('una promo de un solo dia vale solo ese dia', () => {
  const promo = new Promocion({
    nombre: 'Aniversario',
    tipo: 'monto',
    valor: 10,
    fechaInicio: fecha,
    fechaFin: fecha,
  });

  assert.equal(promo.duracionEnDias, 1);
  assert.equal(promo.calcularDescuento(Dinero.deSoles(60), fecha).soles, 10);
  assert.equal(
    promo.calcularDescuento(Dinero.deSoles(60), new FechaOperativa('2026-09-20')).soles,
    0
  );
});

prueba('un descuento de monto fijo nunca supera el total del pedido', () => {
  const promo = new Promocion({
    nombre: 'Vale',
    tipo: 'monto',
    valor: 50,
    fechaInicio: fecha,
    fechaFin: fecha,
  });

  assert.equal(promo.calcularDescuento(Dinero.deSoles(20), fecha).soles, 20);
});

prueba('una promo con fecha final anterior a la inicial se rechaza', () => {
  assert.throws(
    () =>
      new Promocion({
        nombre: 'Al reves',
        tipo: 'porcentaje',
        valor: 10,
        fechaInicio: new FechaOperativa('2026-09-20'),
        fechaFin: new FechaOperativa('2026-09-19'),
      }),
    ErrorDeValidacion
  );
});

prueba('un porcentaje mayor a 100 se rechaza', () => {
  assert.throws(
    () =>
      new Promocion({
        nombre: 'Imposible',
        tipo: 'porcentaje',
        valor: 150,
        fechaInicio: fecha,
        fechaFin: fecha,
      }),
    ErrorDeValidacion
  );
});

prueba('el pedido aplica la promocion y ajusta el total', () => {
  const pedido = Pedido.registrar({
    fecha,
    correlativo: 1,
    lineas: [lineaAmericanaFamiliar({ cantidad: 3 })], // 69
    promocion: promocionDelSabado(),
    formasDePago: new FormasDePago({}),
  });

  assert.equal(pedido.subtotal.soles, 69);
  assert.equal(pedido.descuento.soles, 10.35);
  assert.equal(pedido.total.soles, 58.65);
  assert.equal(pedido.promocionNombre, 'Fin de Semana 15%');
});

prueba('si la promo ya no aplica, el pedido no queda marcado con ella', () => {
  const pedido = Pedido.registrar({
    fecha,
    correlativo: 1,
    lineas: [lineaAmericanaFamiliar()], // 23, no llega al minimo de 50
    promocion: promocionDelSabado(),
    formasDePago: new FormasDePago({}),
  });

  assert.equal(pedido.descuento.soles, 0);
  assert.equal(pedido.promocionId, null);
  assert.equal(pedido.promocionNombre, '');
});

/* ====================================================================== */
grupo('Arqueo de caja');

prueba('la caja cuadra cuando el efectivo coincide', () => {
  const arqueo = ArqueoDeCaja.calcular({
    cierre: new CierreCaja({
      fecha,
      dineroInicial: Dinero.deSoles(50),
      dineroFinal: Dinero.deSoles(180),
    }),
    ventasEnEfectivo: Dinero.deSoles(200),
    gastosEnEfectivo: Dinero.deSoles(70),
  });

  assert.equal(arqueo.efectivoEsperado.soles, 180);
  assert.equal(arqueo.cuadra, true);
});

prueba('detecta cuando falta dinero', () => {
  const arqueo = ArqueoDeCaja.calcular({
    cierre: new CierreCaja({
      fecha,
      dineroInicial: Dinero.deSoles(50),
      dineroFinal: Dinero.deSoles(150),
    }),
    ventasEnEfectivo: Dinero.deSoles(200),
    gastosEnEfectivo: Dinero.deSoles(70),
  });

  assert.equal(arqueo.cuadra, false);
  assert.equal(arqueo.falta, true);
  assert.equal(arqueo.diferencia.soles, -30);
});

prueba('sin cierre registrado el cuadre queda indefinido, no en falso', () => {
  const arqueo = ArqueoDeCaja.calcular({
    cierre: null,
    ventasEnEfectivo: Dinero.deSoles(200),
    gastosEnEfectivo: Dinero.cero(),
  });

  assert.equal(arqueo.cuadra, null);
});

prueba('los gastos por Yape no descuentan del cajon', () => {
  const gastoYape = new Gasto({
    fecha,
    descripcion: 'Publicidad',
    monto: Dinero.deSoles(30),
    medioDePago: 'yape',
  });

  assert.equal(gastoYape.salioDeCaja, false);
});

/* ====================================================================== */
grupo('Resumen del dia');

const resumen = new ResumenDiario({
  fecha,
  pedidos: [
    Pedido.registrar({
      fecha,
      correlativo: 1,
      lineas: [
        lineaAmericanaFamiliar({ cantidad: 2 }), // 46
        new LineaPedido({
          nombreProducto: 'Coca Cola / Inka Cola',
          nombreVariante: '1 Litro',
          tipo: 'simple',
          pizzasEquivalentes: 0,
          cantidad: 1,
          precioLista: Dinero.deSoles(6),
          precioUnitario: Dinero.deSoles(6),
        }),
      ],
      formasDePago: new FormasDePago({
        efectivo: Dinero.deSoles(32),
        yape: Dinero.deSoles(20),
      }),
    }),
    Pedido.registrar({
      fecha,
      correlativo: 2,
      lineas: [
        new LineaPedido({
          nombreProducto: 'Combo Full Americanas',
          nombreVariante: 'Combo',
          tipo: 'combo',
          pizzasEquivalentes: 3,
          cantidad: 1,
          precioLista: Dinero.deSoles(74),
          precioUnitario: Dinero.deSoles(70), // precio editado
          motivoEdicion: 'Cliente frecuente',
        }),
      ],
      formasDePago: new FormasDePago({ plin: Dinero.deSoles(70) }),
    }),
    // Este va anulado: no debe contar en ningun total.
    new Pedido({
      fecha,
      correlativo: 3,
      lineas: [lineaAmericanaFamiliar()],
      subtotal: Dinero.deSoles(23),
      descuento: Dinero.cero(),
      total: Dinero.deSoles(23),
      formasDePago: FormasDePago.todoEn('efectivo', Dinero.deSoles(23)),
      anulado: true,
    }),
  ],
  gastos: [
    new Gasto({ fecha, descripcion: 'Queso', monto: Dinero.deSoles(40), medioDePago: 'efectivo' }),
    new Gasto({ fecha, descripcion: 'Volantes', monto: Dinero.deSoles(15), medioDePago: 'yape' }),
  ],
  cierre: new CierreCaja({
    fecha,
    dineroInicial: Dinero.deSoles(50),
    dineroFinal: Dinero.deSoles(42),
    masasRestantes: 8,
    dejoHarina: true,
    harinaKg: 12.5,
    observaciones: 'El horno tardo en calentar.',
  }),
});

prueba('los pedidos anulados no suman a la venta', () => {
  assert.equal(resumen.pedidos.length, 2);
  assert.equal(resumen.ventaTotal.soles, 122); // 52 + 70
});

prueba('cuenta las pizzas incluyendo las de los combos', () => {
  // 2 americanas + 3 del combo; la gaseosa no cuenta
  assert.equal(resumen.pizzasVendidas, 5);
});

prueba('agrupa las pizzas por tipo y presentacion', () => {
  assert.deepEqual(resumen.pizzasPorTipo, [
    ['Americana (Familiar)', 2],
    ['Combo Full Americanas (Combo)', 1],
  ]);
  assert.deepEqual(resumen.pizzasPorPresentacion, [['Familiar', 2], ['Combo', 1]]);
});

prueba('separa las formas de pago', () => {
  assert.equal(resumen.ventasEnEfectivo.soles, 32);
  assert.equal(resumen.ventasPorYape.soles, 20);
  assert.equal(resumen.ventasPorPlin.soles, 70);
});

prueba('solo los gastos en efectivo afectan el cuadre', () => {
  assert.equal(resumen.gastoTotal.soles, 55);
  assert.equal(resumen.gastosEnEfectivo.soles, 40);
});

prueba('el cuadre usa el efectivo real del dia', () => {
  // 50 + 32 - 40 = 42
  assert.equal(resumen.arqueo.efectivoEsperado.soles, 42);
  assert.equal(resumen.arqueo.cuadra, true);
});

prueba('reporta los precios editados al dueno', () => {
  assert.equal(resumen.lineasConPrecioEditado.length, 1);
  assert.equal(resumen.lineasConPrecioEditado[0].correlativo, 2);
  assert.equal(resumen.lineasConPrecioEditado[0].linea.motivoEdicion, 'Cliente frecuente');
});

prueba('calcula la utilidad aproximada', () => {
  assert.equal(resumen.utilidadAproximada.soles, 67); // 122 - 55
});

/* ====================================================================== */
console.log(
  `\n${pasadas} pruebas pasaron, ${fallos.length} fallaron.\n`
);

if (fallos.length) process.exit(1);
