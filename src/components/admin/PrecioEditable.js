'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Icono from '@/components/Icono';
import { precioCorto } from '@/compartido/formato';

/**
 * Campo de precio que solo muestra el boton de guardar cuando hay un cambio.
 *
 * Evita el error mas comun al mantener una carta: tocar un precio sin querer y
 * no darse cuenta. Lo usan la pantalla de carta y la de adicionales.
 */
export default function PrecioEditable({ precio, onGuardar, ancho = 76 }) {
  const [valor, setValor] = useState(precioCorto(precio));
  const [modificado, setModificado] = useState(false);

  useEffect(() => {
    setValor(precioCorto(precio));
    setModificado(false);
  }, [precio]);

  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      <input
        className="input"
        style={{ padding: '8px 10px', width: ancho }}
        type="number" inputMode="decimal"
        step="0.50"
        min="0"
        value={valor}
        onChange={(e) => { setValor(e.target.value); setModificado(true); }}
      />
      {modificado && (
        <button
          className="btn btn-chico btn-primario"
          onClick={() => onGuardar(valor)}
          aria-label="Guardar precio"
        >
          <Icono de={Check} />
        </button>
      )}
    </div>
  );
}
