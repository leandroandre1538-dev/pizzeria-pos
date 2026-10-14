import { Reloj } from '@/aplicacion/puertos/Reloj';
import { FechaOperativa } from '@/dominio/valores/FechaOperativa';

const DESFASE_LIMA_MS = 5 * 60 * 60 * 1000; // UTC-5; Peru no cambia de hora
const UN_DIA_MS = 24 * 60 * 60 * 1000;

/**
 * Adaptador del puerto Reloj para la hora de Peru.
 *
 * Vercel ejecuta todo en UTC, asi que a las 19:00 de Lima el servidor ya cree
 * que es el dia siguiente. Convertir aqui, en un solo lugar, evita que un
 * pedido de la noche se registre con la fecha equivocada.
 */
export class RelojDeLima extends Reloj {
  hoy() {
    return new FechaOperativa(this.#aFechaLocal(Date.now()));
  }

  ayer() {
    return new FechaOperativa(this.#aFechaLocal(Date.now() - UN_DIA_MS));
  }

  ahora() {
    return new Date().toISOString();
  }

  #aFechaLocal(milisegundos) {
    return new Date(milisegundos - DESFASE_LIMA_MS).toISOString().slice(0, 10);
  }
}
