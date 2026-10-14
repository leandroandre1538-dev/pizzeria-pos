'use client';

import { useState } from 'react';
import CabeceraModal from '@/components/CabeceraModal';
import { api } from '@/components/clienteApi';
import { NOMBRES_DE_DIA } from '@/compartido/formato';

const DIAS = [1, 2, 3, 4, 5, 6, 7];

/** Alta de una promocion: descuento, vigencia y dias en los que aplica. */
export default function ModalNuevaPromocion({ hoy, onCerrar, onCreada }) {
  const [datos, setDatos] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'porcentaje',
    valor: '',
    monto_minimo: '0',
    fecha_inicio: hoy,
    fecha_fin: hoy,
    dias_semana: [],
  });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const esPorcentaje = datos.tipo === 'porcentaje';

  function alternarDia(dia) {
    setDatos((actuales) => ({
      ...actuales,
      dias_semana: actuales.dias_semana.includes(dia)
        ? actuales.dias_semana.filter((d) => d !== dia)
        : [...actuales.dias_semana, dia].sort(),
    }));
  }

  async function guardar() {
    setError('');
    setGuardando(true);
    try {
      await api.crear('/api/admin/promociones', datos);
      onCreada();
    } catch (fallo) {
      setError(fallo.message);
      setGuardando(false);
    }
  }

  const duracion = calcularDuracion(datos.fecha_inicio, datos.fecha_fin);
  const cambiar = (campo) => (evento) => setDatos({ ...datos, [campo]: evento.target.value });

  return (
    <div className="fondo-modal" onClick={onCerrar}>
      <div className="modal ancho" onClick={(e) => e.stopPropagation()}>
        <CabeceraModal
          titulo="Nueva promocion"
          subtitulo="Define el descuento y por cuantos dias estara vigente"
          onCerrar={onCerrar}
        />

        <div className="modal-cuerpo">
          {error && <div className="aviso aviso-error">{error}</div>}

          <div className="campo">
            <label>Nombre de la promocion</label>
            <input
              value={datos.nombre}
              onChange={cambiar('nombre')}
              placeholder="Ej: Martes Pizzero"
              autoFocus
            />
          </div>

          <div className="campo">
            <label>Descripcion (la ve la cajera)</label>
            <input
              value={datos.descripcion}
              onChange={cambiar('descripcion')}
              placeholder="10% de descuento en todo el pedido"
            />
          </div>

          <div className="fila">
            <div className="campo">
              <label>Tipo de descuento</label>
              <select value={datos.tipo} onChange={cambiar('tipo')}>
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="monto">Monto fijo (S/)</option>
              </select>
            </div>
            <div className="campo">
              <label>{esPorcentaje ? 'Porcentaje' : 'Soles de descuento'}</label>
              <input
                type="number" inputMode="decimal" step="0.50" min="0"
                value={datos.valor}
                onChange={cambiar('valor')}
                placeholder={esPorcentaje ? '10' : '5.00'}
              />
            </div>
            <div className="campo">
              <label>Monto minimo del pedido</label>
              <input
                type="number" inputMode="decimal" step="1" min="0"
                value={datos.monto_minimo}
                onChange={cambiar('monto_minimo')}
              />
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label>Vigente desde</label>
              <input type="date" value={datos.fecha_inicio} onChange={cambiar('fecha_inicio')} />
            </div>
            <div className="campo">
              <label>Vigente hasta</label>
              <input type="date" value={datos.fecha_fin} onChange={cambiar('fecha_fin')} />
            </div>
          </div>

          {duracion > 0 && (
            <div className="chico" style={{ marginTop: -6, marginBottom: 14 }}>
              Duracion: <b>{duracion} dia{duracion > 1 ? 's' : ''}</b>
            </div>
          )}

          <div className="campo">
            <label>Solo estos dias de la semana (opcional)</label>
            <div className="chips">
              {DIAS.map((dia) => (
                <button
                  key={dia}
                  className={`chip ${datos.dias_semana.includes(dia) ? 'activo' : ''}`}
                  onClick={() => alternarDia(dia)}
                >
                  {NOMBRES_DE_DIA[dia]}
                </button>
              ))}
            </div>
            <div className="chico">
              Si no marcas ninguno, la promocion aplica todos los dias dentro de la vigencia.
            </div>
          </div>
        </div>

        <div className="modal-pie">
          <button className="btn btn-claro" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primario" onClick={guardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Crear promocion'}
          </button>
        </div>
      </div>
    </div>
  );
}

function calcularDuracion(inicio, fin) {
  if (!inicio || !fin) return 0;
  const dias = Math.round((Date.parse(fin) - Date.parse(inicio)) / 86400000) + 1;
  return dias > 0 ? dias : 0;
}
