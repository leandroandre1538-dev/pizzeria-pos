/**
 * Puerto: de donde sale la fecha de trabajo.
 *
 * El negocio funciona en hora de Peru, pero el servidor corre en UTC. Aislar
 * el tiempo detras de un puerto evita que esa conversion se repita por todo
 * el codigo y permite probar los casos de uso con una fecha fija.
 */
export class Reloj {
  /** @returns {import('../../dominio/valores/FechaOperativa').FechaOperativa} */
  hoy() {
    throw new Error('Reloj.hoy() no implementado.');
  }

  /** El dia que acaba de terminar: el que resume el job de medianoche. */
  ayer() {
    throw new Error('Reloj.ayer() no implementado.');
  }

  /** Marca de tiempo actual en ISO, para los campos de auditoria. */
  ahora() {
    throw new Error('Reloj.ahora() no implementado.');
  }
}
