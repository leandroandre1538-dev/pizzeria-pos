'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/components/clienteApi';
import PrecioEditable from '@/components/admin/PrecioEditable';

const FORMULARIO_VACIO = { nombre: '', precio: '' };

/** Catalogo de adicionales que la cajera puede sumar a una pizza. */
export default function AdminAdicionales() {
  const [adicionales, setAdicionales] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [error, setError] = useState('');

  const cargar = useCallback(() => {
    api.obtener('/api/admin/extras')
      .then((datos) => setAdicionales(datos.adicionales))
      .catch((fallo) => setError(fallo.message));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function ejecutar(accion) {
    setError('');
    try {
      await accion();
      cargar();
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  function agregar(evento) {
    evento.preventDefault();
    ejecutar(async () => {
      await api.crear('/api/admin/extras', formulario);
      setFormulario(FORMULARIO_VACIO);
    });
  }

  if (!adicionales) return <div className="cargando">Cargando adicionales...</div>;

  return (
    <>
      <h1>Adicionales</h1>
      <p className="sub">
        Ingredientes extra que la cajera puede agregar a una pizza al tomar el pedido.
      </p>

      {error && <div className="aviso aviso-error">{error}</div>}

      <div className="dos-col">
        <form className="tarjeta" onSubmit={agregar}>
          <div className="tarjeta-titulo">Nuevo adicional</div>

          <div className="campo">
            <label>Nombre</label>
            <input
              value={formulario.nombre}
              onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
              placeholder="Ej: Doble tocino"
              required
            />
          </div>

          <div className="campo">
            <label>Precio (S/)</label>
            <input
              type="number" inputMode="decimal" step="0.50" min="0"
              value={formulario.precio}
              onChange={(e) => setFormulario({ ...formulario, precio: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <button className="btn btn-primario btn-ancho">Agregar</button>
        </form>

        <div className="tarjeta">
          <div className="tarjeta-titulo">Adicionales de la carta</div>

          <table className="tabla">
            <thead>
              <tr><th>Nombre</th><th>Precio</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {adicionales.map((adicional) => (
                <tr key={adicional.id} style={adicional.activo ? undefined : { opacity: 0.5 }}>
                  <td><b>{adicional.nombre}</b></td>
                  <td>
                    <PrecioEditable
                      precio={adicional.precio}
                      ancho={84}
                      onGuardar={(precio) =>
                        ejecutar(() =>
                          api.actualizar('/api/admin/extras', { id: adicional.id, precio })
                        )
                      }
                    />
                  </td>
                  <td>
                    <span className={`etiqueta ${adicional.activo ? 'et-verde' : 'et-gris'}`}>
                      {adicional.activo ? 'activo' : 'oculto'}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-chico btn-claro"
                      onClick={() =>
                        ejecutar(() =>
                          api.actualizar('/api/admin/extras', {
                            id: adicional.id,
                            activo: !adicional.activo,
                          })
                        )
                      }
                    >
                      {adicional.activo ? 'Ocultar' : 'Mostrar'}
                    </button>
                    <button
                      className="btn btn-chico btn-peligro"
                      style={{ marginLeft: 6 }}
                      onClick={() => {
                        if (!confirm('Eliminar este adicional?')) return;
                        ejecutar(() => api.eliminar(`/api/admin/extras?id=${adicional.id}`));
                      }}
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
