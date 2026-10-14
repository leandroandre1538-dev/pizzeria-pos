'use client';

import { useEffect, useState, useCallback } from 'react';
import { Calendar, CalendarDays, Pause, Play, Plus, Trash2, Wallet } from 'lucide-react';
import { api } from '@/components/clienteApi';
import Icono from '@/components/Icono';
import Aviso from '@/components/Aviso';
import { soles, NOMBRES_DE_DIA } from '@/compartido/formato';
import ModalNuevaPromocion from '@/components/admin/ModalNuevaPromocion';

const CLASE_POR_ESTADO = {
  'vigente hoy': 'et-verde',
  'vigente otros dias': 'et-vino',
  programada: 'et-ambar',
  vencida: 'et-gris',
  desactivada: 'et-gris',
};

/** Gestion de promociones con vigencia por fechas. */
export default function AdminPromociones() {
  const [datos, setDatos] = useState(null);
  const [creando, setCreando] = useState(false);
  const [aviso, setAviso] = useState(null);

  const cargar = useCallback(() => {
    api.obtener('/api/admin/promociones')
      .then(setDatos)
      .catch((fallo) => setAviso({ tipo: 'error', texto: fallo.message }));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function ejecutar(accion, mensaje) {
    try {
      await accion();
      if (mensaje) setAviso({ tipo: 'ok', texto: mensaje });
      cargar();
    } catch (fallo) {
      setAviso({ tipo: 'error', texto: fallo.message });
    }
  }

  if (!datos) return <div className="cargando">Cargando promociones...</div>;

  return (
    <>
      <div className="entre mb">
        <div>
          <h1>Promociones</h1>
          <p className="sub" style={{ margin: 0 }}>
            Cada promocion tiene fecha de inicio y fin. Para una promo de un solo dia, pon la misma
            fecha en los dos campos.
          </p>
        </div>
        <button className="btn btn-primario" onClick={() => setCreando(true)}>
          <Icono de={Plus} />
          Nueva promocion
        </button>
      </div>

      {aviso && <Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>{aviso.texto}</Aviso>}

      {datos.promociones.length === 0 ? (
        <div className="tarjeta vacio">Todavia no hay promociones cargadas.</div>
      ) : (
        <div className="lista-admin">
          {datos.promociones.map((promocion) => (
            <TarjetaDePromocion
              key={promocion.id}
              promocion={promocion}
              onAlternar={() =>
                ejecutar(() =>
                  api.actualizar('/api/admin/promociones', {
                    id: promocion.id,
                    activo: !promocion.activo,
                  })
                )
              }
              onBorrar={() => {
                if (!confirm(`Eliminar la promocion "${promocion.nombre}"?`)) return;
                ejecutar(
                  () => api.eliminar(`/api/admin/promociones?id=${promocion.id}`),
                  'Promocion eliminada.'
                );
              }}
            />
          ))}
        </div>
      )}

      {creando && (
        <ModalNuevaPromocion
          hoy={datos.hoy}
          onCerrar={() => setCreando(false)}
          onCreada={() => {
            setCreando(false);
            cargar();
            setAviso({ tipo: 'ok', texto: 'Promocion creada.' });
          }}
        />
      )}
    </>
  );
}

function TarjetaDePromocion({ promocion, onAlternar, onBorrar }) {
  return (
    <div className="admin-item">
      <div className="entre" style={{ alignItems: 'flex-start' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <b>{promocion.nombre}</b>{' '}
          <span className={`etiqueta ${CLASE_POR_ESTADO[promocion.estado] || 'et-gris'}`}>
            {promocion.estado}
          </span>
          <div className="chico">{promocion.descripcion}</div>
        </div>
        <span className="promo-valor">{promocion.descuentoLegible}</span>
      </div>

      <div className="promo-datos">
        <span><Icono de={Calendar} tamano="chico" />{describirVigencia(promocion)}</span>
        <span><Icono de={CalendarDays} tamano="chico" />{describirDias(promocion.diasSemana)}</span>
        {promocion.montoMinimo > 0 && (
          <span><Icono de={Wallet} tamano="chico" />Desde {soles(promocion.montoMinimo)}</span>
        )}
      </div>

      <div className="acciones-fila">
        <button className="btn btn-chico btn-claro" onClick={onAlternar}>
          <Icono de={promocion.activo ? Pause : Play} tamano="chico" />
          {promocion.activo ? 'Desactivar' : 'Activar'}
        </button>
        <button className="btn btn-chico btn-peligro" onClick={onBorrar}>
          <Icono de={Trash2} tamano="chico" />
          Borrar
        </button>
      </div>
    </div>
  );
}

function describirVigencia(promocion) {
  return promocion.fechaInicio === promocion.fechaFin
    ? `Solo ${promocion.fechaInicio}`
    : `${promocion.fechaInicio} al ${promocion.fechaFin} (${promocion.duracionEnDias} dias)`;
}

function describirDias(dias) {
  if (!dias?.length) return 'Todos los dias';
  return dias.map((d) => NOMBRES_DE_DIA[d]).join(' ');
}
