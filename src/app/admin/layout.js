import { redirect } from 'next/navigation';
import { sesionActual } from '@/infraestructura/http/Sesion';
import { Perfil, puede } from '@/dominio/valores/Perfil';
import Barra from '@/components/Barra';

export const dynamic = 'force-dynamic';

const ENLACES = [
  { href: '/admin', texto: 'Resumen del dia' },
  { href: '/admin/carta', texto: 'Carta y precios' },
  { href: '/admin/promociones', texto: 'Promociones' },
  { href: '/admin/adicionales', texto: 'Adicionales' },
  { href: '/admin/usuarios', texto: 'Usuarios' },
  { href: '/caja', texto: 'Ir a caja' },
];

/** Adaptador de entrada: solo el perfil con permiso de administrar entra aqui. */
export default function LayoutAdmin({ children }) {
  const sesion = sesionActual();
  if (!sesion) redirect('/');
  if (!puede(sesion.perfil, 'administrar')) redirect('/caja');

  return (
    <>
      <Barra enlaces={ENLACES} nombre={sesion.nombre} perfil={Perfil.ADMIN} />
      <div className="contenido">{children}</div>
    </>
  );
}
