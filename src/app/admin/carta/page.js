'use client';

import { useEffect, useState, useCallback } from 'react';
import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { api } from '@/components/clienteApi';
import Icono from '@/components/Icono';
import Aviso from '@/components/Aviso';
import { letraDePresentacion } from '@/compartido/formato';
import PrecioEditable from '@/components/admin/PrecioEditable';
import ModalNuevoProducto from '@/components/admin/ModalNuevoProducto';

const TODAS = 0;

/** Mantenimiento de la carta: precios, visibilidad y productos nuevos. */
export default function AdminCarta() {
  const [datos, setDatos] = useState(null);
  const [aviso, setAviso] = useState(null);
  const [creando, setCreando] = useState(false);
  const [categoria, setCategoria] = useState(TODAS);

  const cargar = useCallback(() => {
    api.obtener('/api/admin/productos')
      .then(setDatos)
      .catch((fallo) => setAviso({ tipo: 'error', texto: fallo.message }));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function ejecutar(accion, mensajeDeExito) {
    try {
      await accion();
      if (mensajeDeExito) setAviso({ tipo: 'ok', texto: mensajeDeExito });
      cargar();
    } catch (fallo) {
      setAviso({ tipo: 'error', texto: fallo.message });
    }
  }

  const guardarPrecio = (id, precio) =>
    ejecutar(
      () => api.actualizar('/api/admin/variantes', { id, precio }),
      'Precio actualizado. Ya rige en caja.'
    );

  const alternarVisibilidad = (producto) =>
    ejecutar(() =>
      api.actualizar('/api/admin/productos', { id: producto.id, activo: !producto.activo })
    );

  function borrar(producto) {
    const confirmado = confirm(
      `Eliminar "${producto.nombre}" de la carta?\n\nSi ya se vendio alguna vez, conviene ocultarlo en lugar de borrarlo.`
    );
    if (!confirmado) return;
    ejecutar(() => api.eliminar(`/api/admin/productos?id=${producto.id}`), 'Producto eliminado.');
  }

  if (!datos) return <div className="cargando">Cargando carta...</div>;

  const visibles =
    categoria === TODAS
      ? datos.productos
      : datos.productos.filter((p) => p.categoria_id === categoria);

  return (
    <>
      <div className="entre mb">
        <div>
          <h1>Carta y precios</h1>
          <p className="sub" style={{ margin: 0 }}>
            Escribe el precio nuevo y confirma. El cambio se aplica al instante en caja.
          </p>
        </div>
        <button className="btn btn-primario" onClick={() => setCreando(true)}>
          <Icono de={Plus} />
          Nuevo producto
        </button>
      </div>

      {aviso && <Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>{aviso.texto}</Aviso>}

      <div className="chips deslizable">
        <button
          className={`chip ${categoria === TODAS ? 'activo' : ''}`}
          onClick={() => setCategoria(TODAS)}
        >
          Todo ({datos.productos.length})
        </button>
        {datos.categorias.map((c) => (
          <button
            key={c.id}
            className={`chip ${categoria === c.id ? 'activo' : ''}`}
            onClick={() => setCategoria(c.id)}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      <div className="lista-admin">
        {visibles.map((producto) => (
          <TarjetaDeProducto
            key={producto.id}
            producto={producto}
            onGuardarPrecio={guardarPrecio}
            onAlternar={() => alternarVisibilidad(producto)}
            onBorrar={() => borrar(producto)}
          />
        ))}
      </div>

      {creando && (
        <ModalNuevoProducto
          categorias={datos.categorias}
          onCerrar={() => setCreando(false)}
          onCreado={() => {
            setCreando(false);
            cargar();
            setAviso({ tipo: 'ok', texto: 'Producto agregado a la carta.' });
          }}
        />
      )}
    </>
  );
}

/** Un producto de la carta con sus presentaciones editables. */
function TarjetaDeProducto({ producto, onGuardarPrecio, onAlternar, onBorrar }) {
  return (
    <div className={`admin-item${producto.activo ? '' : ' oculto'}`}>
      <div className="entre" style={{ alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <b>{producto.nombre}</b>{' '}
          {producto.tipo === 'pizza' && <span className="etiqueta et-vino">pizza</span>}
          {producto.tipo === 'combo' && <span className="etiqueta et-ambar">combo</span>}
          {!producto.activo && <span className="etiqueta et-gris">oculto</span>}
          <div className="chico">{producto.descripcion}</div>
        </div>

        <div className="acciones-fila">
          <button
            className="btn btn-chico btn-claro"
            onClick={onAlternar}
            aria-label={producto.activo ? 'Ocultar de la caja' : 'Mostrar en la caja'}
          >
            <Icono de={producto.activo ? EyeOff : Eye} tamano="chico" />
            {producto.activo ? 'Ocultar' : 'Mostrar'}
          </button>
          <button className="btn-quitar" onClick={onBorrar} aria-label={`Borrar ${producto.nombre}`}>
            <Icono de={Trash2} />
          </button>
        </div>
      </div>

      <div className="precios-admin">
        {producto.variantes.map((variante) => (
          <div key={variante.id} className="precio-admin">
            <span>{letraDePresentacion(variante.nombre) || variante.nombre}</span>
            <PrecioEditable
              precio={variante.precio}
              onGuardar={(precio) => onGuardarPrecio(variante.id, precio)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
