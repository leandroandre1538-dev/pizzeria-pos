import { RepositorioDePromociones } from '@/aplicacion/puertos/RepositorioDePromociones';
import { MapeadorDePromocion } from '../filas/MapeadorDePromocion';
import { clienteSupabase, resultado } from './ClienteSupabase';

/** Adaptador de salida: promociones sobre Supabase/Postgres. */
export class RepositorioDePromocionesSupabase extends RepositorioDePromociones {
  #sb;

  constructor(cliente = clienteSupabase()) {
    super();
    this.#sb = cliente;
  }

  async listarTodas() {
    const filas = resultado(
      await this.#sb.from('promociones').select('*').order('fecha_inicio', { ascending: false }),
      'No se pudieron leer las promociones'
    );
    return (filas || []).map(MapeadorDePromocion.aDominio);
  }

  async listarVigentesEn(fecha) {
    // El filtro por rango de fechas lo hace la base (es lo que sabe indexar);
    // el dia de la semana y el monto minimo los decide el dominio.
    const filas = resultado(
      await this.#sb
        .from('promociones')
        .select('*')
        .eq('activo', true)
        .lte('fecha_inicio', fecha.iso)
        .gte('fecha_fin', fecha.iso),
      'No se pudieron leer las promociones vigentes'
    );
    return (filas || []).map(MapeadorDePromocion.aDominio);
  }

  async buscarPorId(id) {
    const fila = resultado(
      await this.#sb.from('promociones').select('*').eq('id', id).maybeSingle(),
      'No se pudo leer la promocion'
    );
    return fila ? MapeadorDePromocion.aDominio(fila) : null;
  }

  async guardar(promocion) {
    const fila = resultado(
      await this.#sb
        .from('promociones')
        .insert(MapeadorDePromocion.aFila(promocion))
        .select()
        .single(),
      'No se pudo guardar la promocion'
    );

    return MapeadorDePromocion.aDominio(fila);
  }

  async actualizar(id, cambios) {
    resultado(
      await this.#sb.from('promociones').update(cambios).eq('id', id),
      'No se pudo actualizar la promocion'
    );
  }

  async eliminar(id) {
    resultado(
      await this.#sb.from('promociones').delete().eq('id', id),
      'No se pudo eliminar la promocion'
    );
  }
}
