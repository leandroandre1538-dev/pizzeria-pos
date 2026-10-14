'use client';

import { useState } from 'react';
import CabeceraModal from '@/components/CabeceraModal';
import { X } from 'lucide-react';
import Icono from '@/components/Icono';
import { api } from '@/components/clienteApi';

const PRESENTACIONES_DE_PIZZA = [
  { nombre: 'Personal', precio: '' },
  { nombre: 'Compartida', precio: '' },
  { nombre: 'Familiar', precio: '' },
];

const TIPOS = [
  ['pizza', 'Pizza (cuenta en el conteo diario)'],
  ['combo', 'Combo'],
  ['simple', 'Otro (bebida, pan al ajo...)'],
];

/** Alta de un producto con sus presentaciones. */
export default function ModalNuevoProducto({ categorias, onCerrar, onCreado }) {
  const [datos, setDatos] = useState({
    nombre: '',
    descripcion: '',
    categoria_id: categorias[0]?.id || '',
    tipo: 'pizza',
    permite_extras: true,
    pizzas_equivalentes: 1,
  });
  const [presentaciones, setPresentaciones] = useState(PRESENTACIONES_DE_PIZZA);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  /** Al cambiar el tipo se ajustan las presentaciones sugeridas. */
  function cambiarTipo(tipo) {
    const esPizza = tipo === 'pizza';
    setDatos((actuales) => ({
      ...actuales,
      tipo,
      permite_extras: esPizza,
      pizzas_equivalentes: esPizza ? 1 : tipo === 'combo' ? 1 : 0,
    }));
    setPresentaciones(esPizza ? PRESENTACIONES_DE_PIZZA : [{ nombre: 'Unico', precio: '' }]);
  }

  function cambiarPresentacion(indice, campo, valor) {
    setPresentaciones((actuales) =>
      actuales.map((p, i) => (i === indice ? { ...p, [campo]: valor } : p))
    );
  }

  async function guardar() {
    setError('');
    setGuardando(true);
    try {
      await api.crear('/api/admin/productos', { ...datos, variantes: presentaciones });
      onCreado();
    } catch (fallo) {
      setError(fallo.message);
      setGuardando(false);
    }
  }

  return (
    <div className="fondo-modal" onClick={onCerrar}>
      <div className="modal ancho" onClick={(e) => e.stopPropagation()}>
        <CabeceraModal
          titulo="Nuevo producto"
          subtitulo="Aparecera en caja apenas lo guardes"
          onCerrar={onCerrar}
        />

        <div className="modal-cuerpo">
          {error && <div className="aviso aviso-error">{error}</div>}

          <div className="campo">
            <label>Nombre</label>
            <input
              value={datos.nombre}
              onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
              autoFocus
            />
          </div>

          <div className="campo">
            <label>Descripcion / ingredientes</label>
            <textarea
              value={datos.descripcion}
              onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
              placeholder="Salsa de tomate, queso mozzarella, ..."
            />
          </div>

          <div className="fila">
            <div className="campo">
              <label>Categoria</label>
              <select
                value={datos.categoria_id}
                onChange={(e) => setDatos({ ...datos, categoria_id: Number(e.target.value) })}
              >
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div className="campo">
              <label>Tipo</label>
              <select value={datos.tipo} onChange={(e) => cambiarTipo(e.target.value)}>
                {TIPOS.map(([valor, texto]) => (
                  <option key={valor} value={valor}>{texto}</option>
                ))}
              </select>
            </div>
          </div>

          {datos.tipo === 'combo' && (
            <div className="campo">
              <label>Cuantas pizzas incluye el combo</label>
              <input
                type="number" inputMode="decimal" min="0" step="1"
                value={datos.pizzas_equivalentes}
                onChange={(e) =>
                  setDatos({ ...datos, pizzas_equivalentes: Number(e.target.value) })
                }
              />
              <div className="chico" style={{ marginTop: 5 }}>
                Se usa para el conteo de pizzas vendidas del resumen diario.
              </div>
            </div>
          )}

          <div className="campo">
            <label>Presentaciones y precios</label>
            {presentaciones.map((presentacion, indice) => (
              <div className="fila" key={indice} style={{ marginBottom: 8 }}>
                <input
                  placeholder="Nombre (Personal, 1 Litro...)"
                  value={presentacion.nombre}
                  onChange={(e) => cambiarPresentacion(indice, 'nombre', e.target.value)}
                />
                <input
                  type="number" inputMode="decimal" step="0.50" min="0" placeholder="Precio"
                  value={presentacion.precio}
                  onChange={(e) => cambiarPresentacion(indice, 'precio', e.target.value)}
                />
                <button
                  className="btn-quitar"
                  style={{ flex: '0 0 auto', alignSelf: 'center' }}
                  aria-label="Quitar presentacion"
                  onClick={() =>
                    setPresentaciones(presentaciones.filter((_, i) => i !== indice))
                  }
                >
                  <Icono de={X} />
                </button>
              </div>
            ))}
            <button
              className="btn btn-claro btn-chico"
              onClick={() => setPresentaciones([...presentaciones, { nombre: '', precio: '' }])}
            >
              + Agregar presentacion
            </button>
          </div>

          <label className="extra-chk">
            <input
              type="checkbox"
              checked={datos.permite_extras}
              onChange={(e) => setDatos({ ...datos, permite_extras: e.target.checked })}
            />
            <span>Permite adicionales (queso extra, jamon, etc.)</span>
          </label>
        </div>

        <div className="modal-pie">
          <button className="btn btn-claro" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primario" onClick={guardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar producto'}
          </button>
        </div>
      </div>
    </div>
  );
}
