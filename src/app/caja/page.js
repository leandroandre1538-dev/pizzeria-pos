'use client';

import { useEffect, useState } from 'react';
import { api } from '@/components/clienteApi';
import { soles } from '@/compartido/formato';
import { useCarrito } from '@/components/caja/useCarrito';
import CatalogoDeProductos from '@/components/caja/CatalogoDeProductos';
import PedidoActual from '@/components/caja/PedidoActual';
import Aviso from '@/components/Aviso';
import ModalAgregarProducto from '@/components/caja/ModalAgregarProducto';
import ModalCerrarPedido from '@/components/caja/ModalCerrarPedido';

/**
 * Pantalla principal de la caja.
 *
 * Solo orquesta: la carta, el carrito y los dos pasos del pedido son
 * componentes propios. Asi esta pantalla se lee de un vistazo y cada pieza se
 * puede tocar por separado.
 */
export default function NuevoPedido() {
  const [carta, setCarta] = useState(null);
  const [errorDeCarga, setErrorDeCarga] = useState('');
  const [eligiendo, setEligiendo] = useState(null);
  const [cerrando, setCerrando] = useState(false);
  const [aviso, setAviso] = useState(null);

  const carrito = useCarrito();

  useEffect(() => {
    api.obtener('/api/carta')
      .then(setCarta)
      .catch((fallo) => setErrorDeCarga(fallo.message));
  }, []);

  async function registrarPedido(datosDelCierre) {
    try {
      const { pedido } = await api.crear('/api/pedidos', {
        ...datosDelCierre,
        items: carrito.aPeticion(),
      });

      carrito.vaciar();
      setCerrando(false);
      setAviso({
        tipo: 'ok',
        texto: `Pedido #${pedido.correlativo} registrado por ${soles(pedido.total)}.`,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    } catch (fallo) {
      setAviso({ tipo: 'error', texto: fallo.message });
      return false;
    }
  }

  if (errorDeCarga) {
    return <div className="aviso aviso-error">{errorDeCarga}</div>;
  }

  if (!carta) {
    return <div className="cargando">Cargando la carta...</div>;
  }

  return (
    <>
      <PedidoActual carrito={carrito} onCobrar={() => setCerrando(true)} />

      {aviso && <Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>{aviso.texto}</Aviso>}

      {carta.promociones.length > 0 && (
        <Aviso tipo="info">
          <b>Promos de hoy:</b>{' '}
          {carta.promociones.map((p) => `${p.nombre} (${p.descuentoLegible})`).join(' · ')}
        </Aviso>
      )}

      <CatalogoDeProductos
        categorias={carta.categorias}
        productos={carta.productos}
        onElegir={setEligiendo}
      />

      {eligiendo && (
        <ModalAgregarProducto
          producto={eligiendo.producto}
          variante={eligiendo.variante}
          adicionales={carta.adicionales}
          onCancelar={() => setEligiendo(null)}
          onAgregar={(linea) => {
            carrito.agregar(linea);
            setEligiendo(null);
          }}
        />
      )}

      {cerrando && (
        <ModalCerrarPedido
          subtotal={carrito.subtotal}
          promociones={carta.promociones}
          onCancelar={() => setCerrando(false)}
          onConfirmar={registrarPedido}
        />
      )}
    </>
  );
}
