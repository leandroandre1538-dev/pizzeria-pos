import { RepositorioDePromociones } from '@/aplicacion/puertos/RepositorioDePromociones';
import { MapeadorDePromocion } from '../filas/MapeadorDePromocion';

/** Adaptador de salida: promociones en memoria (modo local). */
export class RepositorioDePromocionesEnMemoria extends RepositorioDePromociones {
  #base;

  constructor(base) {
    super();
    this.#base = base;
  }

  async listarTodas() {
    return this.#base
      .todas('promociones')
      .sort((a, b) => b.fecha_inicio.localeCompare(a.fecha_inicio))
      .map(MapeadorDePromocion.aDominio);
  }

  /** Solo el rango de fechas, como en Supabase; dia y monto minimo los decide el dominio. */
  async listarVigentesEn(fecha) {
    return this.#base
      .filtrar(
        'promociones',
        (p) => p.activo && p.fecha_inicio <= fecha.iso && p.fecha_fin >= fecha.iso
      )
      .map(MapeadorDePromocion.aDominio);
  }

  async buscarPorId(id) {
    const fila = this.#base.buscar('promociones', (p) => p.id === Number(id));
    return fila ? MapeadorDePromocion.aDominio(fila) : null;
  }

  async guardar(promocion) {
    return MapeadorDePromocion.aDominio(
      this.#base.insertar('promociones', MapeadorDePromocion.aFila(promocion))
    );
  }

  async actualizar(id, cambios) {
    this.#base.actualizar('promociones', (p) => p.id === Number(id), cambios);
  }

  async eliminar(id) {
    this.#base.eliminar('promociones', (p) => p.id === Number(id));
  }
}
