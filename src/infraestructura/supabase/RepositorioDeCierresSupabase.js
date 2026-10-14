import { RepositorioDeCierres } from '@/aplicacion/puertos/RepositorioDeCierres';
import { MapeadorDeCierre } from '../filas/MapeadorDeCierre';
import { clienteSupabase, resultado } from './ClienteSupabase';

/** Adaptador de salida: cierre de caja sobre Supabase/Postgres. */
export class RepositorioDeCierresSupabase extends RepositorioDeCierres {
  #sb;

  constructor(cliente = clienteSupabase()) {
    super();
    this.#sb = cliente;
  }

  async buscarPorFecha(fecha) {
    const fila = resultado(
      await this.#sb.from('cierres_dia').select('*').eq('fecha', fecha.iso).maybeSingle(),
      'No se pudo leer el cierre del dia'
    );

    return fila ? MapeadorDeCierre.aDominio(fila) : null;
  }

  async guardar(cierre) {
    // upsert por fecha: la cajera guarda avances varias veces en el dia y
    // siempre debe quedar un unico cierre.
    const fila = resultado(
      await this.#sb
        .from('cierres_dia')
        .upsert(MapeadorDeCierre.aFila(cierre), { onConflict: 'fecha' })
        .select()
        .single(),
      'No se pudo guardar el cierre'
    );

    return MapeadorDeCierre.aDominio(fila);
  }
}
