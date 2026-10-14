'use client';

import { useEffect, useState, useCallback } from 'react';
import { Ban, ChevronDown, ChevronUp } from 'lucide-react';
import Icono from '@/components/Icono';
import { api } from '@/components/clienteApi';
import { soles } from '@/compartido/formato';

/** Listado de los pedidos del dia, con su detalle y la opcion de anular. */
export default function PedidosDelDia() {
  const [datos, setDatos] = useState(null);
  const [abierto, setAbierto] = useState(null);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    api.obtener('/api/pedidos').then(setDatos).catch((f) => setError(f.message));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function anular(id) {
    if (!confirm('Anular este pedido? No se borra: queda marcado como anulado.')) return;
    try {
      await api.eliminar(`/api/pedidos/${id}`);
      cargar();
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  if (error) return <div className="aviso aviso-error">{error}</div>;
  if (!datos) return <div className="cargando">Cargando pedidos...</div>;

  const activos = datos.pedidos.filter((p) => !p.anulado);
  const totalVendido = activos.reduce((suma, p) => suma + p.total, 0);
  const pizzas = activos.reduce((suma, p) => suma + p.pizzas, 0);

  return (
    <>
      <h1>Pedidos del dia</h1>
      <p className="sub">{datos.fecha} · se actualiza cada vez que registras un pedido.</p>

      <div className="metricas">
        <Metrica etiqueta="Pedidos" valor={activos.length} />
        <Metrica etiqueta="Pizzas vendidas" valor={pizzas} />
        <Metrica etiqueta="Total vendido" valor={soles(totalVendido)} />
        <Metrica
          etiqueta="Ticket promedio"
          valor={soles(activos.length ? totalVendido / activos.length : 0)}
        />
      </div>

      {datos.pedidos.length === 0 ? (
        <div className="tarjeta vacio">Todavia no hay pedidos registrados hoy.</div>
      ) : (
        <div className="lista-pd">
          {datos.pedidos.map((pedido) => (
            <TarjetaDePedido
              key={pedido.id}
              pedido={pedido}
              abierto={abierto === pedido.id}
              onAlternar={() => setAbierto(abierto === pedido.id ? null : pedido.id)}
              onAnular={() => anular(pedido.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

/** Un pedido plegado en una linea; al tocarlo muestra lo que lleva. */
function TarjetaDePedido({ pedido, abierto, onAlternar, onAnular }) {
  return (
    <div className={`pd${pedido.anulado ? ' anulado' : ''}`}>
      <button className="pd-cab" onClick={onAlternar} aria-expanded={abierto}>
        <span className="pd-num">#{pedido.correlativo}</span>
        <span className="pd-info">
          <b>{pedido.cliente || 'Sin nombre'}</b>
          <span className="chico">
            {pedido.canal === 'delivery' ? 'Delivery' : 'Local'} · {describirPago(pedido)}
          </span>
          {(pedido.anulado || pedido.promocionNombre) && (
            <span>
              {pedido.anulado && <span className="etiqueta et-rojo">anulado</span>}{' '}
              {pedido.promocionNombre && (
                <span className="etiqueta et-vino">{pedido.promocionNombre}</span>
              )}
            </span>
          )}
        </span>
        <span className="pd-total">{soles(pedido.total)}</span>
        <Icono de={abierto ? ChevronUp : ChevronDown} />
      </button>

      {abierto && (
        <div className="pd-detalle">
          <DetalleDelPedido pedido={pedido} />
          {!pedido.anulado && (
            <button className="btn btn-chico btn-peligro mt" onClick={onAnular}>
              <Icono de={Ban} tamano="chico" />
              Anular pedido
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DetalleDelPedido({ pedido }) {
  return (
    <>
      {pedido.items.map((item, indice) => (
        <div key={indice} className="pd-item">
          <div>
            <b>{item.cantidad}x {item.nombreProducto}</b>
            {item.nombreVariante && <span className="chico"> {item.nombreVariante}</span>}

            {item.precioEditado && (
              <div>
                <span className="etiqueta et-ambar">
                  precio editado: carta {soles(item.precioLista)}
                  {item.motivoEdicion ? ` · ${item.motivoEdicion}` : ''}
                </span>
              </div>
            )}

            {item.adicionales.length > 0 && (
              <div className="chico">
                + {item.adicionales.map((a) => a.nombre).join(', ')}
              </div>
            )}

            {item.nota && <div className="chico">Nota: {item.nota}</div>}
          </div>

          <span className="linea-tot">{soles(item.totalLinea)}</span>
        </div>
      ))}

      {pedido.direccion && <div className="chico mt">Direccion: {pedido.direccion}</div>}
      {pedido.nota && <div className="chico">Observacion: {pedido.nota}</div>}
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

function describirPago(pedido) {
  return [
    pedido.efectivo > 0 && `Efectivo ${soles(pedido.efectivo)}`,
    pedido.yape > 0 && `Yape ${soles(pedido.yape)}`,
    pedido.plin > 0 && `Plin ${soles(pedido.plin)}`,
  ]
    .filter(Boolean)
    .join(' · ');
}
