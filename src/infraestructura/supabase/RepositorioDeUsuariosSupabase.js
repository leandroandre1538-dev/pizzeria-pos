import { RepositorioDeUsuarios } from '@/aplicacion/puertos/RepositorioDeUsuarios';
import { ErrorDeValidacion } from '@/dominio/errores/ErroresDominio';
import { clienteSupabase, resultado } from './ClienteSupabase';
import { MapeadorDeUsuario } from '../filas/MapeadorDeUsuario';

const CODIGO_DUPLICADO = '23505';

/** Adaptador de salida: administradores sobre Supabase/Postgres. */
export class RepositorioDeUsuariosSupabase extends RepositorioDeUsuarios {
  #sb;

  constructor(cliente = clienteSupabase()) {
    super();
    this.#sb = cliente;
  }

  async buscarPorUsuario(usuario) {
    const fila = resultado(
      await this.#sb.from('usuarios').select('*').eq('usuario', usuario).maybeSingle(),
      'No se pudo leer el usuario'
    );
    return fila ? MapeadorDeUsuario.aDominio(fila) : null;
  }

  async buscarPorId(id) {
    const fila = resultado(
      await this.#sb.from('usuarios').select('*').eq('id', id).maybeSingle(),
      'No se pudo leer el usuario'
    );
    return fila ? MapeadorDeUsuario.aDominio(fila) : null;
  }

  async listar() {
    // Sin password_hash: no hay motivo para que salga de la base.
    return resultado(
      await this.#sb
        .from('usuarios')
        .select('id, usuario, nombre, rol, activo, creado_en')
        .order('id'),
      'No se pudieron leer los usuarios'
    ) || [];
  }

  async crear({ usuario, nombre, passwordHash }) {
    const { error } = await this.#sb
      .from('usuarios')
      .insert({ usuario, nombre, password_hash: passwordHash, rol: 'admin' });

    if (error) {
      if (error.code === CODIGO_DUPLICADO) {
        throw new ErrorDeValidacion('Ese usuario ya existe.');
      }
      throw new Error(`No se pudo crear el usuario: ${error.message}`);
    }
  }

  async actualizar(id, cambios) {
    const fila = MapeadorDeUsuario.cambiosAFila(cambios);

    resultado(
      await this.#sb.from('usuarios').update(fila).eq('id', id),
      'No se pudo actualizar el usuario'
    );
  }
}
