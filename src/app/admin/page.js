'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/components/clienteApi';
import { soles } from '@/compartido/formato';

/**
 * Panel del dueno: el mismo resumen que llega por correo, pero consultable
 * para cualquier fecha y sin esperar a la medianoche.
 */
export default function ResumenAdmin() {
  const [fecha, setFecha] = useState('');
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState(null);

  const cargar = useCallback(async (fechaPedida) => {
    setCargando(true);
    try {
      const ruta = fechaPedida ? `/api/resumen?fecha=${fechaPedida}` : '/api/resumen';
      const datos = await api.obtener(ruta);
      setResumen(datos.resumen);
      if (!fechaPedida) setFecha(datos.resumen.fecha);
    } catch (fallo) {
      setAviso({ tipo: 'error', texto: fallo.message });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function enviarPorCorreo() {
    setEnviando(true);
    setAviso(null);
    try {
      const { destinatarios } = await api.crear('/api/admin/enviar-resumen', { fecha });
      setAviso({ tipo: 'ok', texto: `Correo enviado a ${destinatarios}.` });
    } catch (fallo) {
      setAviso({ tipo: 'error', texto: fallo.message });
    } finally {
      setEnviando(false);
    }
  }

  if (cargando || !resumen) return <div className="cargando">Cargando resumen...</div>;

  return (
    <>
      <div className="entre mb">
        <div>
          <h1>Resumen del dia</h1>
          <p className="sub" style={{ margin: 0 }}>{resumen.fechaTexto}</p>
        </div>
        <div className="fila" style={{ flex: '0 0 auto' }}>
          <input
            type="date"
            className="input"
            value={fecha}
            onChange={(e) => { setFecha(e.target.value); cargar(e.target.value); }}
          />
          <button className="btn btn-claro" onClick={enviarPorCorreo} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar por correo'}
          </button>
        </div>
      </div>

      {aviso && (
        <div className={`aviso aviso-${aviso.tipo === 'ok' ? 'ok' : 'error'}`}>{aviso.texto}</div>
      )}

      {!resumen.hayCierre && (
        <div className="aviso aviso-info">
          La cajera aun no registro el cierre de caja de este dia, por eso no hay datos de dinero
          inicial y final, masas ni harina.
        </div>
      )}

      <div className="metricas">
        <Metrica
          etiqueta="Pedidos"
          valor={resumen.pedidos.cantidad}
          pie={`${resumen.pedidos.delivery} delivery · ${resumen.pedidos.local} local`}
        />
        <Metrica etiqueta="Pizzas vendidas" valor={resumen.pizzas.total} />
        <Metrica
          etiqueta="Venta total"
          valor={soles(resumen.ventas.total)}
          pie={`Ticket ${soles(resumen.pedidos.ticketPromedio)}`}
        />
        <Metrica etiqueta="Gastos" valor={soles(resumen.gastos.total)} />
        <Metrica etiqueta="Utilidad aprox." valor={soles(resumen.utilidadAproximada)} />
      </div>

      <div className="dos-col">
        <div>
          <Tarjeta titulo="Cuadre de caja">
            <table className="tabla">
              <tbody>
                <Fila texto="Dinero al inicio del dia" valor={soles(resumen.caja.dineroInicial)} />
                <Fila texto="Dinero al final del dia" valor={soles(resumen.caja.dineroFinal)} />
                <Fila texto="Efectivo esperado" valor={soles(resumen.caja.efectivoEsperado)} />
                <Fila texto="Diferencia" valor={soles(resumen.caja.diferencia)} />
                <tr>
                  <td>Estado</td>
                  <td className="num">
                    <span className={`etiqueta ${claseDeCuadre(resumen.caja.cuadra)}`}>
                      {resumen.caja.resumenLegible}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </Tarjeta>

          <Tarjeta titulo="Formas de pago">
            <table className="tabla">
              <tbody>
                <Fila texto="Efectivo" valor={soles(resumen.ventas.efectivo)} />
                <Fila texto="Yape" valor={soles(resumen.ventas.yape)} />
                <Fila texto="Plin" valor={soles(resumen.ventas.plin)} />
                <Fila texto="Descuentos aplicados" valor={soles(resumen.ventas.descuento)} />
                <Fila texto="Cobrado en adicionales" valor={soles(resumen.ventas.adicionales)} />
              </tbody>
            </table>
          </Tarjeta>

          <Tarjeta titulo="Masa y harina">
            <table className="tabla">
              <tbody>
                <Fila
                  texto="Masas que quedaron"
                  valor={resumen.masa.masasRestantes ?? <span className="chico">no registrado</span>}
                />
                <Fila
                  texto="Dejo harina para manana"
                  valor={
                    resumen.masa.dejoHarina === null
                      ? <span className="chico">no registrado</span>
                      : resumen.masa.dejoHarina ? 'Si' : 'No'
                  }
                />
                <Fila
                  texto="Cuanta harina"
                  valor={resumen.masa.dejoHarina ? `${resumen.masa.harinaKg} kg` : '—'}
                />
              </tbody>
            </table>
          </Tarjeta>
        </div>

        <div>
          <Tarjeta titulo="Pizzas vendidas por tipo">
            {resumen.pizzas.porTipo.length === 0 ? (
              <div className="vacio">Sin pizzas registradas.</div>
            ) : (
              <table className="tabla">
                <tbody>
                  {resumen.pizzas.porTipo.map(([nombre, cantidad]) => (
                    <tr key={nombre}>
                      <td>{nombre}</td>
                      <td className="num"><b>{cantidad}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Tarjeta>

          <Tarjeta titulo="Gastos del dia">
            {resumen.gastos.detalle.length === 0 ? (
              <div className="vacio">Sin gastos registrados.</div>
            ) : (
              <table className="tabla">
                <tbody>
                  {resumen.gastos.detalle.map((gasto) => (
                    <tr key={gasto.id}>
                      <td>
                        {gasto.descripcion}
                        <div className="chico">{gasto.categoria} · {gasto.medioDePago}</div>
                      </td>
                      <td className="num">{soles(gasto.monto)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td><b>Total</b></td>
                    <td className="num"><b>{soles(resumen.gastos.total)}</b></td>
                  </tr>
                </tbody>
              </table>
            )}
          </Tarjeta>

          <Tarjeta titulo="Observaciones de la cajera">
            <p style={{ whiteSpace: 'pre-wrap', margin: 0, fontSize: 14 }}>
              {resumen.observaciones || <span className="chico">Sin observaciones.</span>}
            </p>
          </Tarjeta>

          {resumen.preciosEditados.length > 0 && (
            <Tarjeta titulo="Precios editados manualmente">
              <table className="tabla">
                <tbody>
                  {resumen.preciosEditados.map((edicion, indice) => (
                    <tr key={indice}>
                      <td>
                        <b>#{edicion.correlativo}</b> · {edicion.producto}
                        {edicion.motivo && <div className="chico">{edicion.motivo}</div>}
                      </td>
                      <td className="num">
                        <span className="tachado">{soles(edicion.precioLista)}</span>{' '}
                        <b>{soles(edicion.precioCobrado)}</b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Tarjeta>
          )}
        </div>
      </div>
    </>
  );
}

function Tarjeta({ titulo, children }) {
  return (
    <div className="tarjeta">
      <div className="tarjeta-titulo">{titulo}</div>
      {children}
    </div>
  );
}

function Metrica({ etiqueta, valor, pie }) {
  return (
    <div className="metrica">
      <div className="et">{etiqueta}</div>
      <div className="val">{valor}</div>
      {pie && <div className="pie">{pie}</div>}
    </div>
  );
}

function Fila({ texto, valor }) {
  return (
    <tr>
      <td>{texto}</td>
      <td className="num">{valor}</td>
    </tr>
  );
}

function claseDeCuadre(cuadra) {
  if (cuadra === null) return 'et-ambar';
  return cuadra ? 'et-verde' : 'et-rojo';
}
