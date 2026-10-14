'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Icono from '@/components/Icono';
import { soles, letraDePresentacion } from '@/compartido/formato';
import { adicionalesPorUnidad, totalDeLinea } from './useCarrito';

/**
 * Pedido en curso, como una barra ligera fija arriba de la carta.
 *
 * Plegada muestra lo justo: cuantos productos van, el total y el boton de
 * cobrar. Al tocarla se despliega el detalle para cambiar cantidades o quitar
 * algo. Asi la carta ocupa casi toda la pantalla del celular.
 */
export default function PedidoActual({ carrito, onCobrar }) {
  const [abierto, setAbierto] = useState(false);

  // Si el pedido se vacia (se cobro o se quito todo), vuelve a plegarse.
  useEffect(() => {
    if (carrito.estaVacio) setAbierto(false);
  }, [carrito.estaVacio]);

  const desplegado = abierto && !carrito.estaVacio;

  return (
    <section className="pedido-actual" aria-label="Pedido actual">
      <div className="pa-barra">
        <button
          className="pa-resumen"
          onClick={() => setAbierto((a) => !a)}
          disabled={carrito.estaVacio}
          aria-expanded={desplegado}
        >
          <span className="pa-bolsa">
            <Icono de={ShoppingBag} tamano="grande" />
            {carrito.cantidadDeProductos > 0 && (
              <span className="pa-cuenta">{carrito.cantidadDeProductos}</span>
            )}
          </span>

          <span className="pa-texto">
            <b>{soles(carrito.subtotal)}</b>
            <span>{carrito.estaVacio ? 'Toca un precio para empezar' : resumenCorto(carrito.lineas)}</span>
          </span>

          {!carrito.estaVacio && (
            <span className="pa-flecha">
              <Icono de={desplegado ? ChevronUp : ChevronDown} />
            </span>
          )}
        </button>

        <button className="btn btn-primario" onClick={onCobrar} disabled={carrito.estaVacio}>
          Cobrar
        </button>
      </div>

      {desplegado && (
        <>
          <div className="pa-lista">
            {carrito.lineas.map((linea) => (
              <LineaDelPedido
                key={linea.idLocal}
                linea={linea}
                onCambiarCantidad={carrito.cambiarCantidad}
                onQuitar={carrito.quitar}
              />
            ))}
          </div>

          <div className="pa-acciones">
            <button className="btn btn-claro" onClick={carrito.vaciar}>
              <Icono de={Trash2} />
              Vaciar
            </button>
          </div>
        </>
      )}
    </section>
  );
}

/** "2 Americana F, 1 Chicha Morada" */
function resumenCorto(lineas) {
  return lineas
    .map((l) => {
      const letra = letraDePresentacion(l.nombreVariante);
      return `${l.cantidad} ${l.nombreProducto}${letra ? ` ${letra}` : ''}`;
    })
    .join(', ');
}

function LineaDelPedido({ linea, onCambiarCantidad, onQuitar }) {
  const adicionales = adicionalesPorUnidad(linea);
  const editado = linea.precioUnitario !== linea.precioLista;

  return (
    <div className="linea">
      <div className="linea-top">
        <div>
          <div className="linea-nom">{linea.nombreProducto}</div>
          <div className="linea-var">
            {linea.nombreVariante} · {soles(linea.precioUnitario)}
            {editado && (
              <>
                {' '}
                <span className="tachado">{soles(linea.precioLista)}</span>{' '}
                <span className="etiqueta et-ambar">editado</span>
              </>
            )}
          </div>

          {linea.adicionales.length > 0 && (
            <div className="linea-extras">
              + {linea.adicionales.map((a) => a.nombre).join(', ')} ({soles(adicionales)})
            </div>
          )}

          {linea.nota && <div className="chico">Nota: {linea.nota}</div>}
        </div>

        <div className="linea-tot">{soles(totalDeLinea(linea))}</div>
      </div>

      <div className="linea-acc">
        <div className="cant">
          <button onClick={() => onCambiarCantidad(linea.idLocal, -1)} aria-label="Quitar uno">
            <Icono de={Minus} />
          </button>
          <span>{linea.cantidad}</span>
          <button onClick={() => onCambiarCantidad(linea.idLocal, 1)} aria-label="Agregar uno">
            <Icono de={Plus} />
          </button>
        </div>

        <button
          className="btn-quitar"
          onClick={() => onQuitar(linea.idLocal)}
          aria-label={`Quitar ${linea.nombreProducto}`}
        >
          <Icono de={Trash2} />
        </button>
      </div>
    </div>
  );
}
