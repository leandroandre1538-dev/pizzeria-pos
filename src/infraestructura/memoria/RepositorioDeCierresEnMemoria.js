import { RepositorioDeCierres } from '@/aplicacion/puertos/RepositorioDeCierres';
import { MapeadorDeCierre } from '../filas/MapeadorDeCierre';

/** Adaptador de salida: cierres de caja en memoria (modo local). */
export class RepositorioDeCierresEnMemoria extends RepositorioDeCierres {
  #base;

  constructor(base) {
    super();
    this.#base = base;
  }

  async buscarPorFecha(fecha) {
    const fila = this.#base.buscar('cierres_dia', (c) => c.fecha === fecha.iso);
    return fila ? MapeadorDeCierre.aDominio(fila) : null;
  }

  /** Un unico cierre por fecha: si ya existe se actualiza (igual que el upsert en Postgres). */
  async guardar(cierre) {
    const fila = MapeadorDeCierre.aFila(cierre);
    const esDeLaFecha = (c) => c.fecha === fila.fecha;

    if (this.#base.buscar('cierres_dia', esDeLaFecha)) {
      this.#base.actualizar('cierres_dia', esDeLaFecha, fila);
    } else {
      this.#base.insertar('cierres_dia', fila);
    }

    return MapeadorDeCierre.aDominio(this.#base.buscar('cierres_dia', esDeLaFecha));
  }
}
