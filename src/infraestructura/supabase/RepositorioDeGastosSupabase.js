import { RepositorioDeGastos } from '@/aplicacion/puertos/RepositorioDeGastos';
import { MapeadorDeGasto } from '../filas/MapeadorDeGasto';
import { clienteSupabase, resultado } from './ClienteSupabase';

/** Adaptador de salida: gastos sobre Supabase/Postgres. */
export class RepositorioDeGastosSupabase extends RepositorioDeGastos {
  #sb;

  constructor(cliente = clienteSupabase()) {
    super();
    this.#sb = cliente;
  }

  async guardar(gasto) {
    const fila = resultado(
      await this.#sb
        .from('gastos')
        .insert(MapeadorDeGasto.aFila(gasto))
        .select()
        .single(),
      'No se pudo guardar el gasto'
    );

    return MapeadorDeGasto.aDominio(fila);
  }

  async listarPorFecha(fecha) {
    const filas = resultado(
      await this.#sb
        .from('gastos')
        .select('*')
        .eq('fecha', fecha.iso)
        .order('creado_en', { ascending: false }),
      'No se pudieron leer los gastos'
    );

    return (filas || []).map(MapeadorDeGasto.aDominio);
  }

  async eliminar(id) {
    resultado(
      await this.#sb.from('gastos').delete().eq('id', id),
      'No se pudo eliminar el gasto'
    );
  }
}
