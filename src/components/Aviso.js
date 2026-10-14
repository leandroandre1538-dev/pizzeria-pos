'use client';

import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import Icono from './Icono';

const ESTILO = {
  ok: { clase: 'aviso-ok', icono: CircleCheck },
  error: { clase: 'aviso-error', icono: CircleAlert },
  info: { clase: 'aviso-info', icono: Info },
};

/** Mensaje de exito, error o informacion, con boton opcional para cerrarlo. */
export default function Aviso({ tipo = 'info', onCerrar, children }) {
  const { clase, icono } = ESTILO[tipo] || ESTILO.info;

  return (
    <div className={`aviso ${clase}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <Icono de={icono} />
      <span className="tx">{children}</span>
      {onCerrar && (
        <button className="cerrar" onClick={onCerrar} aria-label="Cerrar aviso">
          <Icono de={X} />
        </button>
      )}
    </div>
  );
}
