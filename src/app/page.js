'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/components/clienteApi';
import { ChevronRight, Receipt, ShieldCheck } from 'lucide-react';
import Icono from '@/components/Icono';
import Logo from '@/components/Logo';

const PERFIL_CAJERA = 'cajera';
const PERFIL_ADMIN = 'admin';

/**
 * Pantalla de inicio: eleccion de perfil.
 *
 * La cajera entra con un clic porque atiende con gente esperando; el
 * administrador necesita clave porque puede tocar precios y ver la caja.
 */
export default function Login() {
  const router = useRouter();
  const [pidiendoClave, setPidiendoClave] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function entrar(datos, destino) {
    setCargando(true);
    setError('');
    try {
      await api.crear('/api/auth/login', datos);
      router.push(destino);
      router.refresh();
    } catch (fallo) {
      setError(fallo.message);
      setCargando(false);
    }
  }

  return (
    <div className="login-fondo">
      <div className="login-caja">
        <div className="login-marca">
          <div className="logo-marco"><Logo tamano={84} /></div>
          <h1>MAROCCHINO&apos;S</h1>
          <p>PIZZERIA · TACNA</p>
        </div>

        {!pidiendoClave ? (
          <>
            {error && <div className="aviso aviso-error">{error}</div>}

            <button
              className="perfil-btn"
              onClick={() => entrar({ perfil: PERFIL_CAJERA }, '/caja')}
              disabled={cargando}
            >
              <div className="ic"><Icono de={Receipt} tamano="grande" /></div>
              <div className="tx">
                <b>Cajera</b>
                <span>Tomar pedidos, gastos y cierre de caja</span>
              </div>
              <Icono de={ChevronRight} />
            </button>

            <button
              className="perfil-btn"
              onClick={() => { setPidiendoClave(true); setError(''); }}
            >
              <div className="ic"><Icono de={ShieldCheck} tamano="grande" /></div>
              <div className="tx">
                <b>Administrador</b>
                <span>Carta, precios, promociones y reportes</span>
              </div>
              <Icono de={ChevronRight} />
            </button>

          </>
        ) : (
          <form
            className="tarjeta"
            onSubmit={(e) => {
              e.preventDefault();
              entrar({ perfil: PERFIL_ADMIN, usuario, clave }, '/admin');
            }}
          >
            <div className="tarjeta-titulo">Acceso de administrador</div>

            {error && <div className="aviso aviso-error">{error}</div>}

            <div className="campo">
              <label>Usuario</label>
              <input
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                autoFocus
                autoComplete="username"
                placeholder="admin"
              />
            </div>

            <div className="campo">
              <label>Clave</label>
              <input
                type="password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            <button className="btn btn-primario btn-ancho" disabled={cargando || !usuario || !clave}>
              {cargando ? 'Verificando...' : 'Entrar'}
            </button>

            <button
              type="button"
              className="btn btn-claro btn-ancho"
              style={{ marginTop: 10 }}
              onClick={() => { setPidiendoClave(false); setError(''); }}
            >
              Volver
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
