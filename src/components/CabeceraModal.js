'use client';

import { X } from 'lucide-react';
import Icono from './Icono';

/** Cabecera comun de todas las ventanas: titulo, subtitulo y boton para cerrar. */
export default function CabeceraModal({ titulo, subtitulo, onCerrar }) {
  return (
    <div className="modal-cab">
      <div className="tx">
        <div className="t">{titulo}</div>
        {subtitulo && <div className="s">{subtitulo}</div>}
      </div>
      {onCerrar && (
        <button className="btn-icono" onClick={onCerrar} aria-label="Cerrar">
          <Icono de={X} />
        </button>
      )}
    </div>
  );
}
