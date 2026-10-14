import './globals.css';
import { esModoLocal } from '@/infraestructura/modo';

export const metadata = {
  title: "Marocchino's Pizzeria - Sistema de Caja",
  description: 'Sistema de pedidos, gastos y cierre de caja de Marocchinos Pizzeria',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#3d0a13',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {esModoLocal() && (
          <div className="cinta-local" role="note">
            Modo local
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
