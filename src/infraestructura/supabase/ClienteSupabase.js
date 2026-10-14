import { createClient } from '@supabase/supabase-js';

let instancia = null;

/**
 * Cliente de Supabase con la llave de servicio.
 *
 * Solo se usa del lado del servidor. La app nunca habla con Supabase desde el
 * navegador: todo pasa por las rutas de API, que es lo que permite mantener
 * RLS cerrado y las reglas de negocio en un solo lugar.
 *
 * Se crea una sola vez por instancia de servidor (patron singleton) para no
 * abrir una conexion nueva en cada peticion.
 */
export function clienteSupabase() {
  if (instancia) return instancia;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const llave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !llave) {
    throw new Error(
      'Faltan las variables NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  instancia = createClient(url, llave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return instancia;
}

/**
 * Desenvuelve una respuesta de Supabase y convierte el error en excepcion.
 * Evita repetir `if (error) throw ...` en cada repositorio.
 */
export function resultado({ data, error }, contexto) {
  if (error) {
    throw new Error(`${contexto}: ${error.message}`);
  }
  return data;
}
