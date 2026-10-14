import { RepositorioDeGastos } from '@/aplicacion/puertos/RepositorioDeGastos';
import { MapeadorDeGasto } from '../filas/MapeadorDeGasto';

/** Adaptador de salida: gastos en memoria (modo local). */
export class RepositorioDeGastosEnMemoria extends RepositorioDeGastos {
  #base;

  constructor(base) {
    super();
    this.#base = base;
  }

  async guardar(gasto) {
    return MapeadorDeGasto.aDominio(this.#base.insertar('gastos', MapeadorDeGasto.aFila(gasto)));
  }

  async listarPorFecha(fecha) {
    return this.#base
      .filtrar('gastos', (g) => g.fecha === fecha.iso)
      .sort((a, b) => b.id - a.id)
      .map(MapeadorDeGasto.aDominio);
  }

  async eliminar(id) {
    this.#base.eliminar('gastos', (g) => g.id === Number(id));
  }
}
