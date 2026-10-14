'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CirclePlus, Minus, Plus } from 'lucide-react';
import Icono from '@/components/Icono';
import CabeceraModal from '@/components/CabeceraModal';
import { soles, precioCorto } from '@/compartido/formato';
import { redondear } from './useCarrito';

/**
 * Detalle de un producto antes de sumarlo al pedido:
 * cantidad, adicionales, nota para la cocina y, si hace falta, precio editado.
 *
 * Los adicionales empiezan plegados: la mayoria de pizzas salen tal cual, asi
 * que no tiene sentido llenar la pantalla del celular con nueve casillas que
 * casi nunca se marcan.
 *
 * La edicion de precio esta detras de un boton a proposito: es una excepcion,
 * no el flujo normal, y cada cambio queda registrado con su motivo para que el
 * dueno lo vea en el resumen del dia.
 */
export default function ModalAgregarProducto({ producto, variante, adicionales, onCancelar, onAgregar }) {
  const [presentacion, setPresentacion] = useState(variante);
  const precioDeCarta = Number(presentacion.precio);

  const [cantidad, setCantidad] = useState(1);
  const [precio, setPrecio] = useState(precioCorto(precioDeCarta));
  const [editandoPrecio, setEditandoPrecio] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [elegidos, setElegidos] = useState([]);
  const [verAdicionales, setVerAdicionales] = useState(false);
  const [nota, setNota] = useState('');

  const precioFinal = redondear(precio);
  const adicionalesUnidad = redondear(
    elegidos.reduce((suma, a) => suma + Number(a.precio), 0)
  );
  const fueEditado = precioFinal !== precioDeCarta;

  /** Cambiar de presentacion vuelve a poner el precio de la carta de esa presentacion. */
  function elegirPresentacion(nueva) {
    setPresentacion(nueva);
    setPrecio(precioCorto(nueva.precio));
    setEditandoPrecio(false);
    setMotivo('');
  }

  function alternarAdicional(adicional) {
    setElegidos((actuales) =>
      actuales.some((a) => a.nombre === adicional.nombre)
        ? actuales.filter((a) => a.nombre !== adicional.nombre)
        : [...actuales, { nombre: adicional.nombre, precio: Number(adicional.precio) }]
    );
  }

  function confirmar() {
    onAgregar({
      productoId: producto.id,
      varianteId: presentacion.id,
      nombreProducto: producto.nombre,
      nombreVariante: presentacion.nombre,
      tipo: producto.tipo,
      pizzasEquivalentes: Number(producto.pizzas_equivalentes || 0),
      cantidad,
      precioLista: precioDeCarta,
      precioUnitario: precioFinal,
      motivoEdicion: fueEditado ? motivo : '',
      adicionales: elegidos,
      nota,
    });
  }

  return (
    <div className="fondo-modal" onClick={onCancelar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <CabeceraModal
          titulo={producto.nombre}
          subtitulo={`${presentacion.nombre} · precio de carta ${soles(precioDeCarta)}`}
          onCerrar={onCancelar}
        />

        <div className="modal-cuerpo">
          {producto.variantes.length > 1 && (
            <div className="campo">
              <label id="etiqueta-presentacion">Presentacion</label>
              <div className="chips" role="group" aria-labelledby="etiqueta-presentacion">
                {producto.variantes.map((opcion) => (
                  <button
                    key={opcion.id}
                    className={`chip ${opcion.id === presentacion.id ? 'activo' : ''}`}
                    onClick={() => elegirPresentacion(opcion)}
                  >
                    {opcion.nombre} · {precioCorto(opcion.precio)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="fila">
            <div className="campo">
              <label>Cantidad</label>
              <div className="cant">
                <button onClick={() => setCantidad((c) => Math.max(1, c - 1))} aria-label="Quitar uno">
                  <Icono de={Minus} />
                </button>
                <span>{cantidad}</span>
                <button onClick={() => setCantidad((c) => c + 1)} aria-label="Agregar uno">
                  <Icono de={Plus} />
                </button>
              </div>
            </div>

            <div className="campo">
              <label>Precio unitario</label>
              {editandoPrecio ? (
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.50"
                  min="0"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  autoFocus
                />
              ) : (
                <div className="entre">
                  <b style={{ fontSize: 19 }}>{soles(precioFinal)}</b>
                  <button className="btn btn-chico btn-claro" onClick={() => setEditandoPrecio(true)}>
                    Cambiar precio
                  </button>
                </div>
              )}
            </div>
          </div>

          {editandoPrecio && fueEditado && (
            <div className="campo">
              <label>Motivo del cambio (opcional)</label>
              <input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Cliente frecuente, pizza con demora, acuerdo..."
              />
              <div className="chico" style={{ marginTop: 6 }}>
                Precio de carta {soles(precioDeCarta)} → nuevo {soles(precioFinal)}. Queda
                registrado en el resumen del dueno.
              </div>
            </div>
          )}

          {producto.permite_extras && adicionales.length > 0 && (
            <div className="campo">
              <button
                type="button"
                className="plegable"
                onClick={() => setVerAdicionales((v) => !v)}
                aria-expanded={verAdicionales}
              >
                <Icono de={CirclePlus} />
                Adicionales
                {elegidos.length > 0 && <span className="cuenta">{elegidos.length}</span>}
                <Icono de={verAdicionales ? ChevronUp : ChevronDown} />
              </button>

              {verAdicionales && (
              <div className="extras-grid">
                {adicionales.map((adicional) => {
                  const marcado = elegidos.some((a) => a.nombre === adicional.nombre);
                  return (
                    <label key={adicional.id} className={`extra-chk ${marcado ? 'marcado' : ''}`}>
                      <input
                        type="checkbox"
                        checked={marcado}
                        onChange={() => alternarAdicional(adicional)}
                      />
                      <span>{adicional.nombre}</span>
                      <span className="pr">+{precioCorto(adicional.precio)}</span>
                    </label>
                  );
                })}
              </div>
              )}
            </div>
          )}

          <div className="campo">
            <label>Nota para la cocina (opcional)</label>
            <input
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Sin aceituna, bien dorada, cortar en 12..."
            />
          </div>

          <div className="tarjeta" style={{ background: 'var(--crema)', padding: 14, boxShadow: 'none' }}>
            <div className="tot-linea">
              <span>Producto ({cantidad} x {soles(precioFinal)})</span>
              <span>{soles(precioFinal * cantidad)}</span>
            </div>
            {adicionalesUnidad > 0 && (
              <div className="tot-linea">
                <span>Adicionales ({cantidad} x {soles(adicionalesUnidad)})</span>
                <span>{soles(adicionalesUnidad * cantidad)}</span>
              </div>
            )}
            <div className="tot-linea grande">
              <span>Subtotal</span>
              <span>{soles((precioFinal + adicionalesUnidad) * cantidad)}</span>
            </div>
          </div>
        </div>

        <div className="modal-pie">
          <button className="btn btn-claro" onClick={onCancelar}>Cancelar</button>
          <button className="btn btn-primario" onClick={confirmar}>
            <Icono de={Plus} />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
