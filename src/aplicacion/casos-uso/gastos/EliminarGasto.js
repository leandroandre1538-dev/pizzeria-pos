import { ErrorDeValidacion } from '@/dominio/errores/ErroresDominio';

/** Caso de uso: borrar un gasto mal anotado. */
export class EliminarGasto {
  constructor({ repositorioDeGastos }) {
    this.repositorioDeGastos = repositorioDeGastos;
  }

  async ejecutar(id) {
    if (!id) throw new ErrorDeValidacion('Falta el gasto a eliminar.');
    await this.repositorioDeGastos.eliminar(id);
  }
}
