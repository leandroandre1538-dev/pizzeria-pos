'use client';

import { useState } from 'react';
import CabeceraModal from '@/components/CabeceraModal';
import { soles } from '@/compartido/formato';
import { redondear } from './useCarrito';

const FORMAS_DE_PAGO = [
  ['efectivo', 'Efectivo'],
  ['yape', 'Yape'],
  ['plin', 'Plin'],
  ['mixto', 'Mixto'],
];

/**
 * Ultimo paso del pedido: datos del cliente, promocion y forma de pago.
 *
 * El descuento que se muestra aqui es una vista previa. El servidor vuelve a
 * calcularlo y revalida la vigencia de la promocion antes de guardar.
 */
export default function ModalCerrarPedido({ subtotal, promociones, onCancelar, onConfirmar }) {
  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [canal, setCanal] = useState('delivery');
  const [direccion, setDireccion] = useState('');
  const [promocionId, setPromocionId] = useState('');
  const [formaDePago, setFormaDePago] = useState('efectivo');
  const [desglose, setDesglose] = useState({ efectivo: '', yape: '', plin: '' });
  const [nota, setNota] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Solo se ofrecen las promos que el pedido ya alcanza por monto minimo.
  const aplicables = promociones.filter((p) => subtotal >= p.montoMinimo);
  const promocion = aplicables.find((p) => String(p.id) === promocionId);

  const descuento = !promocion
    ? 0
    : promocion.tipo === 'porcentaje'
      ? redondear((subtotal * promocion.valor) / 100)
      : Math.min(promocion.valor, subtotal);

  const total = redondear(Math.max(0, subtotal - descuento));

  const esMixto = formaDePago === 'mixto';
  const sumaDesglose = redondear(
    Object.values(desglose).reduce((suma, valor) => suma + (parseFloat(valor) || 0), 0)
  );

  async function confirmar() {
    setError('');

    let pagos = { efectivo: 0, yape: 0, plin: 0 };

    if (esMixto) {
      if (Math.abs(sumaDesglose - total) > 0.01) {
        setError(`El desglose suma ${soles(sumaDesglose)} y el total es ${soles(total)}.`);
        return;
      }
      pagos = {
        efectivo: parseFloat(desglose.efectivo) || 0,
        yape: parseFloat(desglose.yape) || 0,
        plin: parseFloat(desglose.plin) || 0,
      };
    } else {
      pagos[formaDePago] = total;
    }

    setGuardando(true);
    const listo = await onConfirmar({
      cliente,
      telefono,
      canal,
      direccion,
      promocion_id: promocion ? promocion.id : null,
      nota,
      ...pagos,
    });
    if (!listo) setGuardando(false);
  }

  return (
    <div className="fondo-modal" onClick={onCancelar}>
      <div className="modal ancho" onClick={(e) => e.stopPropagation()}>
        <CabeceraModal
          titulo="Cobrar pedido"
          subtitulo="Confirma los datos y la forma de pago"
          onCerrar={onCancelar}
        />

        <div className="modal-cuerpo">
          {error && <div className="aviso aviso-error">{error}</div>}

          <div className="fila">
            <div className="campo">
              <label>Cliente (opcional)</label>
              <input value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Nombre" />
            </div>
            <div className="campo">
              <label>Telefono (opcional)</label>
              <input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="9xx xxx xxx"
              />
            </div>
          </div>

          <div className="campo">
            <label>Tipo de pedido</label>
            <div className="chips">
              <button
                className={`chip ${canal === 'delivery' ? 'activo' : ''}`}
                onClick={() => setCanal('delivery')}
              >
                Delivery
              </button>
              <button
                className={`chip ${canal === 'local' ? 'activo' : ''}`}
                onClick={() => setCanal('local')}
              >
                Recojo en local
              </button>
            </div>
          </div>

          {canal === 'delivery' && (
            <div className="campo">
              <label>Direccion de entrega</label>
              <input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Calle, numero, referencia"
              />
            </div>
          )}

          {aplicables.length > 0 && (
            <div className="campo">
              <label>Promocion</label>
              <select value={promocionId} onChange={(e) => setPromocionId(e.target.value)}>
                <option value="">Sin promocion</option>
                {aplicables.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.descuentoLegible})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="campo">
            <label>Forma de pago</label>
            <div className="chips">
              {FORMAS_DE_PAGO.map(([valor, texto]) => (
                <button
                  key={valor}
                  className={`chip ${formaDePago === valor ? 'activo' : ''}`}
                  onClick={() => setFormaDePago(valor)}
                >
                  {texto}
                </button>
              ))}
            </div>
          </div>

          {esMixto && (
            <>
              <div className="fila">
                {['efectivo', 'yape', 'plin'].map((medio) => (
                  <div className="campo" key={medio}>
                    <label>{medio}</label>
                    <input
                      type="number" inputMode="decimal"
                      step="0.10"
                      value={desglose[medio]}
                      onChange={(e) => setDesglose({ ...desglose, [medio]: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>
              <div className="chico" style={{ marginTop: -6, marginBottom: 14 }}>
                Suma del desglose: <b>{soles(sumaDesglose)}</b> de {soles(total)}
              </div>
            </>
          )}

          <div className="campo">
            <label>Observacion del pedido (opcional)</label>
            <input
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Cliente pidio boleta, tocar timbre, etc."
            />
          </div>

          <div className="tarjeta" style={{ background: 'var(--crema)', padding: 14 }}>
            <div className="tot-linea">
              <span>Subtotal</span>
              <span>{soles(subtotal)}</span>
            </div>
            {descuento > 0 && (
              <div className="tot-linea" style={{ color: 'var(--verde)' }}>
                <span>Descuento · {promocion.nombre}</span>
                <span>− {soles(descuento)}</span>
              </div>
            )}
            <div className="tot-linea grande">
              <span>Total a cobrar</span>
              <span>{soles(total)}</span>
            </div>
          </div>
        </div>

        <div className="modal-pie">
          <button className="btn btn-claro" onClick={onCancelar} disabled={guardando}>
            Volver
          </button>
          <button className="btn btn-primario" onClick={confirmar} disabled={guardando}>
            {guardando ? 'Registrando...' : `Registrar ${soles(total)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
