'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/components/clienteApi';
import { soles } from '@/compartido/formato';

const FORMULARIO_VACIO = {
  dinero_inicial: '',
  dinero_final: '',
  masas_restantes: '',
  dejo_harina: false,
  harina_kg: '',
  observaciones: '',
};

/**
 * Cierre de caja del dia.
 *
 * Muestra el cuadre en vivo mientras la cajera escribe: ve al instante si
 * falta o sobra dinero, en lugar de enterarse al dia siguiente por el correo.
 */
export default function Cierre() {
  const [resumen, setResumen] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [aviso, setAviso] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [datosResumen, datosCierre] = await Promise.all([
        api.obtener('/api/resumen'),
        api.obtener('/api/cierre'),
      ]);

      setResumen(datosResumen.resumen);

      if (datosCierre.cierre) {
        const c = datosCierre.cierre;
        setFormulario({
          dinero_inicial: String(c.dineroInicial),
          dinero_final: String(c.dineroFinal),
          masas_restantes: String(c.masasRestantes),
          dejo_harina: c.dejoHarina,
          harina_kg: String(c.harinaKg),
          observaciones: c.observaciones,
        });
      }
    } catch (fallo) {
      setAviso({ tipo: 'error', texto: fallo.message });
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function guardar(confirmandoCierre) {
    setGuardando(true);
    setAviso(null);

    try {
      await api.crear('/api/cierre', { ...formulario, cerrado: confirmandoCierre });
      setAviso({
        tipo: 'ok',
        texto: confirmandoCierre
          ? 'Cierre confirmado. El resumen se enviara al dueno a las 00:05.'
          : 'Avance guardado. Puedes seguir editando hasta confirmar el cierre.',
      });
      cargar();
    } catch (fallo) {
      setAviso({ tipo: 'error', texto: fallo.message });
    } finally {
      setGuardando(false);
    }
  }

  if (!resumen) return <div className="cargando">Cargando cierre...</div>;

  // Cuadre en vivo: el servidor hace el mismo calculo al generar el resumen.
  const inicial = parseFloat(formulario.dinero_inicial) || 0;
  const final = parseFloat(formulario.dinero_final) || 0;
  const esperado = inicial + resumen.ventas.efectivo - resumen.gastos.efectivo;
  const diferencia = Math.round((final - esperado) * 100) / 100;
  const cuadra = Math.abs(diferencia) < 0.01;
  const yaDeclaroElFinal = formulario.dinero_final !== '';

  const cambiar = (campo, valor) => setFormulario({ ...formulario, [campo]: valor });

  return (
    <>
      <h1>Cierre de caja</h1>
      <p className="sub">
        {resumen.fechaTexto} · completa estos datos al terminar el dia. A las 00:05 se envia
        automaticamente el resumen al dueno.
      </p>

      {aviso && (
        <div className={`aviso aviso-${aviso.tipo === 'ok' ? 'ok' : 'error'}`}>{aviso.texto}</div>
      )}

      <div className="metricas">
        <Metrica etiqueta="Pedidos del dia" valor={resumen.pedidos.cantidad} />
        <Metrica etiqueta="Pizzas vendidas" valor={resumen.pizzas.total} />
        <Metrica etiqueta="Venta total" valor={soles(resumen.ventas.total)} />
        <Metrica etiqueta="Gastos" valor={soles(resumen.gastos.total)} />
      </div>

      <div className="dos-col">
        <div>
          <div className="tarjeta">
            <div className="tarjeta-titulo">Dinero en caja</div>

            <div className="fila">
              <div className="campo">
                <label>Dinero encontrado al INICIO del dia</label>
                <input
                  type="number" inputMode="decimal" step="0.10" placeholder="0.00"
                  value={formulario.dinero_inicial}
                  onChange={(e) => cambiar('dinero_inicial', e.target.value)}
                />
              </div>
              <div className="campo">
                <label>Dinero encontrado al FINAL del dia</label>
                <input
                  type="number" inputMode="decimal" step="0.10" placeholder="0.00"
                  value={formulario.dinero_final}
                  onChange={(e) => cambiar('dinero_final', e.target.value)}
                />
              </div>
            </div>

            <div className="tarjeta" style={{ background: 'var(--crema)', padding: 14, boxShadow: 'none' }}>
              <div className="tot-linea"><span>Dinero al inicio</span><span>{soles(inicial)}</span></div>
              <div className="tot-linea"><span>+ Ventas en efectivo</span><span>{soles(resumen.ventas.efectivo)}</span></div>
              <div className="tot-linea"><span>− Gastos en efectivo</span><span>{soles(resumen.gastos.efectivo)}</span></div>
              <div className="tot-linea grande"><span>Deberia haber en caja</span><span>{soles(esperado)}</span></div>

              {yaDeclaroElFinal && (
                <div style={{ marginTop: 14, textAlign: 'center' }}>
                  <span
                    className={`etiqueta ${cuadra ? 'et-verde' : 'et-rojo'}`}
                    style={{ fontSize: 13, padding: '7px 16px' }}
                  >
                    {cuadra
                      ? 'LA CAJA CUADRA'
                      : `${diferencia > 0 ? 'SOBRA' : 'FALTA'} ${soles(Math.abs(diferencia))}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="tarjeta">
            <div className="tarjeta-titulo">Masa y harina para manana</div>

            <div className="campo">
              <label>Cuantas masas quedaron</label>
              <input
                type="number" inputMode="decimal" min="0" placeholder="0"
                value={formulario.masas_restantes}
                onChange={(e) => cambiar('masas_restantes', e.target.value)}
              />
            </div>

            <div className="campo">
              <label className="extra-chk" style={{ textTransform: 'none', letterSpacing: 0 }}>
                <input
                  type="checkbox"
                  checked={formulario.dejo_harina}
                  onChange={(e) => cambiar('dejo_harina', e.target.checked)}
                />
                <span>Dejo harina para preparar masa manana</span>
              </label>
            </div>

            {formulario.dejo_harina && (
              <div className="campo">
                <label>Cuanta harina dejo (kg)</label>
                <input
                  type="number" inputMode="decimal" step="0.5" min="0" placeholder="0"
                  value={formulario.harina_kg}
                  onChange={(e) => cambiar('harina_kg', e.target.value)}
                />
              </div>
            )}

            <div className="campo">
              <label>Observaciones del dia</label>
              <textarea
                value={formulario.observaciones}
                onChange={(e) => cambiar('observaciones', e.target.value)}
                placeholder="Se malogro el horno un rato, falto queso, un cliente reclamo, etc."
              />
            </div>

            <div className="fila">
              <button className="btn btn-claro" onClick={() => guardar(false)} disabled={guardando}>
                Guardar avance
              </button>
              <button className="btn btn-primario" onClick={() => guardar(true)} disabled={guardando}>
                {guardando ? 'Guardando...' : 'Confirmar cierre del dia'}
              </button>
            </div>
          </div>
        </div>

        <div className="tarjeta">
          <div className="tarjeta-titulo">Lo que vera el dueno</div>

          <table className="tabla">
            <tbody>
              <Fila texto="Pedidos atendidos" valor={resumen.pedidos.cantidad} destacado />
              <Fila texto="Pizzas vendidas" valor={resumen.pizzas.total} destacado />
              <Fila texto="Venta total" valor={soles(resumen.ventas.total)} destacado />
              <Fila texto="Efectivo" valor={soles(resumen.ventas.efectivo)} />
              <Fila texto="Yape" valor={soles(resumen.ventas.yape)} />
              <Fila texto="Plin" valor={soles(resumen.ventas.plin)} />
              <Fila texto="Descuentos" valor={soles(resumen.ventas.descuento)} />
              <Fila texto="Gastos" valor={soles(resumen.gastos.total)} />
              <Fila texto="Utilidad aproximada" valor={soles(resumen.utilidadAproximada)} destacado />
            </tbody>
          </table>

          {resumen.pizzas.porTipo.length > 0 && (
            <>
              <h3 className="mt">Pizzas por tipo</h3>
              <table className="tabla">
                <tbody>
                  {resumen.pizzas.porTipo.map(([nombre, cantidad]) => (
                    <Fila key={nombre} texto={nombre} valor={cantidad} destacado />
                  ))}
                </tbody>
              </table>
            </>
          )}

          {resumen.preciosEditados.length > 0 && (
            <div className="aviso aviso-info mt" style={{ marginBottom: 0 }}>
              Se editaron precios manualmente en {resumen.preciosEditados.length} producto(s) hoy.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Metrica({ etiqueta, valor }) {
  return (
    <div className="metrica">
      <div className="et">{etiqueta}</div>
      <div className="val">{valor}</div>
    </div>
  );
}

function Fila({ texto, valor, destacado = false }) {
  return (
    <tr>
      <td>{texto}</td>
      <td className="num">{destacado ? <b>{valor}</b> : valor}</td>
    </tr>
  );
}
