import { redirect } from 'next/navigation';
import { sesionActual } from '@/infraestructura/http/Sesion';
import Barra from '@/components/Barra';

export const dynamic = 'force-dynamic';

const ENLACES = [
  { href: '/caja', texto: 'Nuevo pedido' },
  { href: '/caja/pedidos', texto: 'Pedidos del dia' },
  { href: '/caja/gastos', texto: 'Gastos' },
  { href: '/caja/cierre', texto: 'Cierre de caja' },
];

/** Adaptador de entrada: protege toda la seccion de caja. */
export default function LayoutCaja({ children }) {
  const sesion = sesionActual();
  if (!sesion) redirect('/');

  return (
    <>
      <Barra enlaces={ENLACES} nombre={sesion.nombre} perfil={sesion.perfil} />
      <div className="contenido">{children}</div>
    </>
  );
}
