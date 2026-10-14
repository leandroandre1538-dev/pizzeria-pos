'use client';

import { useEffect, useRef, useState } from 'react';
import { Pizza } from 'lucide-react';

/**
 * Logo de la pizzeria.
 *
 * Si existe `public/logo.png` se usa esa imagen; si no, cae en el icono de
 * pizza. Asi el sistema funciona desde el primer dia y el logo real se agrega
 * despues copiando el archivo, sin tocar codigo.
 */
export default function Logo({ tamano = 86, redondo = true }) {
  const [hayImagen, setHayImagen] = useState(true);
  const imagen = useRef(null);

  // La imagen puede fallar antes de que React tome la pagina (el HTML llega
  // armado desde el servidor) y entonces onError no alcanza a dispararse.
  // Por eso tambien se revisa al montar si la carga ya habia fallado.
  useEffect(() => {
    const img = imagen.current;
    if (img && img.complete && img.naturalWidth === 0) setHayImagen(false);
  }, []);

  if (!hayImagen) {
    return (
      <div
        className="logo-respaldo"
        style={{ width: tamano, height: tamano }}
      >
        <Pizza aria-hidden="true" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imagen}
      src="/logo.png"
      alt="Marocchino's Pizzeria"
      width={tamano}
      height={tamano}
      onError={() => setHayImagen(false)}
      style={{
        width: tamano,
        height: tamano,
        objectFit: 'contain',
        borderRadius: redondo ? '50%' : 8,
        background: redondo ? '#fff' : 'transparent',
      }}
    />
  );
}
