// Produccion: Supabase + Resend
import { RepositorioDePedidosSupabase } from './supabase/RepositorioDePedidosSupabase';
import { RepositorioDeGastosSupabase } from './supabase/RepositorioDeGastosSupabase';
import { RepositorioDeCierresSupabase } from './supabase/RepositorioDeCierresSupabase';
import { RepositorioDeCartaSupabase } from './supabase/RepositorioDeCartaSupabase';
import { RepositorioDePromocionesSupabase } from './supabase/RepositorioDePromocionesSupabase';
import { RepositorioDeUsuariosSupabase } from './supabase/RepositorioDeUsuariosSupabase';
import { RegistroDeEnviosSupabase } from './supabase/RegistroDeEnviosSupabase';
import { ServicioDeCorreoResend } from './correo/ServicioDeCorreoResend';

// Modo local: todo en memoria, el correo se guarda como archivo
import { BaseEnMemoria } from './memoria/BaseEnMemoria';
import { sembrar } from './memoria/datosIniciales';
import { RepositorioDePedidosEnMemoria } from './memoria/RepositorioDePedidosEnMemoria';
import { RepositorioDeGastosEnMemoria } from './memoria/RepositorioDeGastosEnMemoria';
import { RepositorioDeCierresEnMemoria } from './memoria/RepositorioDeCierresEnMemoria';
import { RepositorioDeCartaEnMemoria } from './memoria/RepositorioDeCartaEnMemoria';
import { RepositorioDePromocionesEnMemoria } from './memoria/RepositorioDePromocionesEnMemoria';
import { RepositorioDeUsuariosEnMemoria } from './memoria/RepositorioDeUsuariosEnMemoria';
import { RegistroDeEnviosEnMemoria } from './memoria/RegistroDeEnviosEnMemoria';
import { ServicioDeCorreoEnArchivo } from './correo/ServicioDeCorreoEnArchivo';
import { esModoLocal } from './modo';

/**
 * Arma los adaptadores de salida segun el modo.
 * Los dos juegos cumplen los mismos puertos, asi que los casos de uso no
 * saben ni les importa cual reciben.
 */
export function crearAdaptadoresDeSalida({ reloj, hasheadorDeClaves }) {
  return esModoLocal()
    ? adaptadoresEnMemoria({ reloj, hasheadorDeClaves })
    : adaptadoresDeProduccion();
}

function adaptadoresDeProduccion() {
  return {
    repositorioDePedidos: new RepositorioDePedidosSupabase(),
    repositorioDeGastos: new RepositorioDeGastosSupabase(),
    repositorioDeCierres: new RepositorioDeCierresSupabase(),
    repositorioDeCarta: new RepositorioDeCartaSupabase(),
    repositorioDePromociones: new RepositorioDePromocionesSupabase(),
    repositorioDeUsuarios: new RepositorioDeUsuariosSupabase(),
    registroDeEnvios: new RegistroDeEnviosSupabase(),
    servicioDeCorreo: new ServicioDeCorreoResend(),
  };
}

export function adaptadoresEnMemoria({ reloj, hasheadorDeClaves, base }) {
  const datos =
    base ||
    BaseEnMemoria.compartida((nueva) =>
      sembrar(nueva, {
        hoy: reloj.hoy().iso,
        hashDelAdmin: hasheadorDeClaves.calcular('admin', 'marocchinos2026'),
      })
    );

  return {
    repositorioDePedidos: new RepositorioDePedidosEnMemoria(datos),
    repositorioDeGastos: new RepositorioDeGastosEnMemoria(datos),
    repositorioDeCierres: new RepositorioDeCierresEnMemoria(datos),
    repositorioDeCarta: new RepositorioDeCartaEnMemoria(datos),
    repositorioDePromociones: new RepositorioDePromocionesEnMemoria(datos),
    repositorioDeUsuarios: new RepositorioDeUsuariosEnMemoria(datos),
    registroDeEnvios: new RegistroDeEnviosEnMemoria(datos),
    servicioDeCorreo: new ServicioDeCorreoEnArchivo(),
  };
}
