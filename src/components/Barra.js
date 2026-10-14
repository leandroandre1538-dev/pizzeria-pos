'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Pizza } from 'lucide-react';
import { api } from './clienteApi';
import Icono from './Icono';

/**
 * Barra superior de navegacion, comun a caja y administracion.
 * En el celular la navegacion baja a una segunda fila que se desliza con el dedo.
 */
export default function Barra({ enlaces, nombre, perfil }) {
  const ruta = usePathname();
  const router = useRouter();

  async function salir() {
    await api.crear('/api/auth/logout', {});
    router.push('/');
    router.refresh();
  }

  return (
    <header className="barra">
      <div className="barra-fila">
        <div className="marca">
          <span className="sello"><Icono de={Pizza} /></span>
          <div>
            MAROCCHINO&apos;S
            <small>{perfil === 'admin' ? 'ADMINISTRACION' : 'CAJA'}</small>
          </div>
        </div>

        <nav>
          {enlaces.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={ruta === enlace.href ? 'activo' : ''}
            >
              {enlace.texto}
            </Link>
          ))}
        </nav>

        <div className="derecha">
          <span className="quien">{nombre}</span>
          <button className="btn-icono" onClick={salir} aria-label="Salir" title="Salir">
            <Icono de={LogOut} />
          </button>
        </div>
      </div>
    </header>
  );
}
