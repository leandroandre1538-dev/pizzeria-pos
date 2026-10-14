/**
 * Pruebas del modo local.
 *
 * Recorren un dia completo con los casos de uso reales conectados a los
 * adaptadores en memoria: si esto pasa, `npm run local` se comporta igual que
 * el sistema con Supabase, porque la unica diferencia son los adaptadores.
 *
 * Tambien verifican que la carta del modo local sea identica a la del SQL.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { BaseEnMemoria } from '@/infraestructura/memoria/BaseEnMemoria';
import { sembrar, productosIniciales, ADICIONALES } from '@/infraestructura/memoria/datosIniciales';
import { adaptadoresEnMemoria } from '@/infraestructura/AdaptadoresDeSalida';
import { HasheadorSha256 } from '@/infraestructura/seguridad/HasheadorSha256';
import { FechaOperativa } from '@/dominio/valores/FechaOperativa';

import { RegistrarPedido } from '@/aplicacion/casos-uso/pedidos/RegistrarPedido';
import { ListarPedidosDelDia } from '@/aplicacion/casos-uso/pedidos/ListarPedidosDelDia';
import { AnularPedido } from '@/aplicacion/casos-uso/pedidos/AnularPedido';
import { RegistrarGasto } from '@/aplicacion/casos-uso/gastos/RegistrarGasto';
import { GuardarCierreDelDia } from '@/aplicacion/casos-uso/cierre/GuardarCierreDelDia';
import { GenerarResumenDiario } from '@/aplicacion/casos-uso/resumen/GenerarResumenDiario';
import { ObtenerCartaVigente } from '@/aplicacion/casos-uso/carta/ObtenerCartaVigente';
import { IniciarSesion } from '@/aplicacion/casos-uso/usuarios/IniciarSesion';

let pasadas = 0;
const fallos = [];

async function prueba(nombre, cuerpo) {
  try {
    await cuerpo();
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

/* ---------------------------------------------------------------------- */
/* Un sistema completo en memoria, con un reloj fijo en un sabado          */
/* ---------------------------------------------------------------------- */
const HOY = '2026-09-19'; // sabado
const reloj = {
  hoy: () => new FechaOperativa(HOY),
  ayer: () => new FechaOperativa('2026-09-18'),
  ahora: () => new Date(`${HOY}T20:00:00-05:00`),
};
const hasheadorDeClaves = new HasheadorSha256();

function sistemaNuevo() {
  const base = new BaseEnMemoria();
  sembrar(base, { hoy: HOY, hashDelAdmin: hasheadorDeClaves.calcular('admin', 'marocchinos2026') });

  const dependencias = {
    reloj,
    hasheadorDeClaves,
    ...adaptadoresEnMemoria({ reloj, hasheadorDeClaves, base }),
  };

  return {
    base,
    carta: new ObtenerCartaVigente(dependencias),
    registrarPedido: new RegistrarPedido(dependencias),
    listarPedidos: new ListarPedidosDelDia(dependencias),
    anularPedido: new AnularPedido(dependencias),
    registrarGasto: new RegistrarGasto(dependencias),
    guardarCierre: new GuardarCierreDelDia(dependencias),
    resumen: new GenerarResumenDiario(dependencias),
    iniciarSesion: new IniciarSesion(dependencias),
  };
}

/** Arma un item de pedido como lo manda la caja, tomando el precio de la carta. */
function item(carta, nombreProducto, presentacion, opciones = {}) {
  const producto = carta.productos.find((p) => p.nombre === nombreProducto);
  const variante = producto.variantes.find((v) => v.nombre === presentacion);
  return {
    producto_id: producto.id,
    variante_id: variante.id,
    nombre_producto: producto.nombre,
    nombre_variante: variante.nombre,
    tipo: producto.tipo,
    pizzas_equivalentes: producto.pizzas_equivalentes,
    cantidad: opciones.cantidad || 1,
    precio_lista: variante.precio,
    precio_unitario: opciones.precio ?? variante.precio,
    extras: opciones.extras || [],
  };
}

/* ====================================================================== */
grupo('Modo local: carta');

await prueba('arranca con las 16 pizzas, 11 combos y los adicionales', async () => {
  const { carta } = sistemaNuevo();
  const vigente = await carta.ejecutar();
  assert.equal(vigente.productos.filter((p) => p.tipo === 'pizza').length, 16);
  assert.equal(vigente.productos.filter((p) => p.tipo === 'combo').length, 11);
  assert.equal(vigente.adicionales.length, 9);
});

await prueba('sin ventas: Americana, Hawaiana, Mozarella y despues el orden del papel', async () => {
  const { carta } = sistemaNuevo();
  const nombres = (await carta.ejecutar()).productos.map((p) => p.nombre);
  assert.deepEqual(nombres.slice(0, 5), ['Americana', 'Hawaiana', 'La Mozarella', 'Napolitana', 'La Misia']);
  assert.equal(nombres[16], 'Combo Pizzero 1');
  assert.equal(nombres.at(-1), 'Mojito de Fresa');
});

await prueba('con ventas: lo mas pedido va primero y lo anulado no cuenta', async () => {
  const sistema = sistemaNuevo();
  const vigente = await sistema.carta.ejecutar();
  const registrar = (items) =>
    sistema.registrarPedido.ejecutar({ canal: 'local', items });

  await registrar([item(vigente, 'Peperoni', 'Familiar', { cantidad: 3 })]);
  await registrar([item(vigente, 'Chicha Morada', '1 Litro'), item(vigente, 'Hawaiana', 'Personal')]);
  await registrar([item(vigente, 'Chicha Morada', '1 Litro')]);
  const anulado = await registrar([item(vigente, 'Mojito Clasico', 'Vaso', { cantidad: 9 })]);
  await sistema.anularPedido.ejecutar(anulado.id);

  const nombres = (await sistema.carta.ejecutar()).productos.map((p) => p.nombre);
  assert.deepEqual(nombres.slice(0, 5), ['Peperoni', 'Chicha Morada', 'Hawaiana', 'Americana', 'La Mozarella']);
});

await prueba('un sabado muestra las promos de todos los dias y de fin de semana, no la del martes', async () => {
  const { carta } = sistemaNuevo();
  const nombres = (await carta.ejecutar()).promociones.map((p) => p.nombre).sort();
  assert.deepEqual(nombres, ['Delivery Feliz', 'Fin de Semana 15%']);
});

await prueba('el administrador de fabrica puede entrar', async () => {
  const { iniciarSesion } = sistemaNuevo();
  const sesion = await iniciarSesion.ejecutar({ perfil: 'admin', usuario: 'admin', clave: 'marocchinos2026' });
  assert.equal(sesion.perfil, 'admin');
});

await prueba('con una clave equivocada no entra', async () => {
  const { iniciarSesion } = sistemaNuevo();
  await assert.rejects(() =>
    iniciarSesion.ejecutar({ perfil: 'admin', usuario: 'admin', clave: 'otra' })
  );
});

/* ====================================================================== */
grupo('Modo local: un dia de trabajo');

const sistema = sistemaNuevo();
const carta = await sistema.carta.ejecutar();

await prueba('registra pedidos con numero correlativo del dia', async () => {
  const uno = await sistema.registrarPedido.ejecutar({
    items: [item(carta, 'Americana', 'Familiar'), item(carta, 'Coca Cola / Inka Cola', '1 Litro')],
  });
  const dos = await sistema.registrarPedido.ejecutar({
    items: [item(carta, 'Peperoni', 'Compartida', { cantidad: 2 })],
    yape: 38,
  });
  assert.equal(uno.correlativo, 1);
  assert.equal(dos.correlativo, 2);
  assert.equal(uno.total.soles, 29);
});

await prueba('los adicionales y los precios editados se guardan tal cual', async () => {
  await sistema.registrarPedido.ejecutar({
    items: [
      item(carta, 'Marocchinos', 'Familiar', {
        precio: 30,
        extras: [{ nombre: 'Porcion de queso extra', precio: 6 }],
      }),
    ],
  });
  const { pedidos } = await sistema.listarPedidos.ejecutar();
  const linea = pedidos.find((p) => p.correlativo === 3).lineas[0];
  assert.equal(linea.precioUnitario.soles, 30);
  assert.equal(linea.precioLista.soles, 32);
  assert.equal(linea.total.soles, 36);
});

await prueba('el listado del dia trae los pedidos del ultimo al primero', async () => {
  const { pedidos } = await sistema.listarPedidos.ejecutar();
  assert.deepEqual(pedidos.map((p) => p.correlativo), [3, 2, 1]);
});

await prueba('un pedido anulado deja de sumar en el resumen', async () => {
  await sistema.anularPedido.ejecutar(3);
  const resumen = await sistema.resumen.ejecutar();
  assert.equal(resumen.ventaTotal.soles, 29 + 38);
  assert.equal(resumen.pizzasVendidas, 3); // 1 americana + 2 peperoni
});

await prueba('los gastos y el cierre alimentan el cuadre de caja', async () => {
  await sistema.registrarGasto.ejecutar({ descripcion: 'Gas', categoria: 'servicios', monto: 45, metodo_pago: 'efectivo' });
  await sistema.registrarGasto.ejecutar({ descripcion: 'Queso', categoria: 'insumos', monto: 95, metodo_pago: 'yape' });
  // 50 al inicio + 29 en efectivo - 45 de gas = 34
  await sistema.guardarCierre.ejecutar({ dinero_inicial: 50, dinero_final: 34, masas_restantes: 12 });

  const resumen = await sistema.resumen.ejecutar();
  assert.equal(resumen.gastoTotal.soles, 140);
  assert.equal(resumen.arqueo.cuadra, true);
});

await prueba('guardar el cierre dos veces no duplica: se actualiza', async () => {
  await sistema.guardarCierre.ejecutar({ dinero_inicial: 50, dinero_final: 30, masas_restantes: 10 });
  assert.equal(sistema.base.todas('cierres_dia').length, 1);
  const resumen = await sistema.resumen.ejecutar();
  assert.equal(resumen.arqueo.falta, true);
});

/* ====================================================================== */
grupo('Modo local: la base en memoria');

await prueba('lo que se lee es una copia: modificarlo no cambia la base', async () => {
  const base = new BaseEnMemoria();
  base.insertar('extras', { nombre: 'Jamon', precio: 3 });
  base.todas('extras')[0].precio = 999;
  assert.equal(base.todas('extras')[0].precio, 3);
});

await prueba('borrar un producto borra sus presentaciones', async () => {
  const base = new BaseEnMemoria();
  const producto = base.insertar('productos', { nombre: 'Prueba' });
  base.insertar('variantes', { producto_id: producto.id, nombre: 'Unico', precio: 5 });
  base.eliminar('productos', (p) => p.id === producto.id);
  assert.equal(base.todas('variantes').length, 0);
});

/* ====================================================================== */
grupo('Modo local: la carta coincide con el SQL');

const sql = readFileSync(
  path.join(process.cwd(), 'supabase', '02_carta_inicial.sql'),
  'utf8'
);

await prueba('los precios de cada presentacion son los mismos que en 02_carta_inicial.sql', async () => {
  // Tuplas de variantes en el SQL: (producto_id,'Nombre', precio, orden)
  const enSql = new Set(
    [...sql.matchAll(/\((\d+),\s*'([^']+)',\s*([\d.]+),\s*\d+\)/g)].map(
      ([, id, nombre, precio]) => `${id}|${nombre}|${Number(precio)}`
    )
  );
  const enMemoria = productosIniciales().flatMap((p) =>
    p.presentaciones.map(([nombre, precio]) => `${p.id}|${nombre}|${precio}`)
  );

  const faltan = enMemoria.filter((clave) => !enSql.has(clave));
  assert.deepEqual(faltan, [], `No coinciden con el SQL: ${faltan.join(', ')}`);
  assert.equal(enMemoria.length, enSql.size);
});

await prueba('los adicionales y sus precios son los mismos que en el SQL', async () => {
  for (const [nombre, precio] of ADICIONALES) {
    const patron = new RegExp(`\\('${nombre.replace(/[/]/g, '\\/')}',\\s*${precio}\\.00`, 'i');
    assert.match(sql, patron, `Adicional distinto: ${nombre}`);
  }
});

/* ====================================================================== */
console.log(`\n${pasadas} pruebas pasaron, ${fallos.length} fallaron.\n`);
if (fallos.length) process.exit(1);
