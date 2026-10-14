import { ErrorDeValidacion } from '../errores/ErroresDominio';

const FORMATO = /^\d{4}-\d{2}-\d{2}$/;

const DIAS = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Objeto de valor: el dia de operacion de la pizzeria (YYYY-MM-DD).
 *
 * El dominio no sabe nada de zonas horarias: quien decide cual es "hoy" es el
 * puerto Reloj, que en produccion usa la hora de Lima. Asi el negocio queda
 * independiente de donde este desplegado el servidor.
 */
export class FechaOperativa {
  #iso;

  constructor(iso) {
    if (typeof iso !== 'string' || !FORMATO.test(iso)) {
      throw new ErrorDeValidacion(`Fecha invalida: "${iso}". Se espera AAAA-MM-DD.`);
    }
    this.#iso = iso;
  }

  static desde(valor) {
    return valor instanceof FechaOperativa ? valor : new FechaOperativa(String(valor));
  }

  get iso() {
    return this.#iso;
  }

  /** 1 = Lunes ... 7 = Domingo */
  get diaSemana() {
    const [anio, mes, dia] = this.#iso.split('-').map(Number);
    const jsDia = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay(); // 0 = Domingo
    return jsDia === 0 ? 7 : jsDia;
  }

  /** "Viernes 19 de setiembre de 2026" */
  get textoLargo() {
    const [anio, mes, dia] = this.#iso.split('-').map(Number);
    return `${DIAS[this.diaSemana - 1]} ${dia} de ${MESES[mes - 1]} de ${anio}`;
  }

  esAnteriorA(otra) {
    return this.#iso < otra.iso;
  }

  esPosteriorA(otra) {
    return this.#iso > otra.iso;
  }

  estaEntre(inicio, fin) {
    return this.#iso >= inicio.iso && this.#iso <= fin.iso;
  }

  igualA(otra) {
    return this.#iso === otra.iso;
  }

  /** La fecha `dias` dias antes de esta. */
  restarDias(dias) {
    const ms = Date.parse(`${this.#iso}T00:00:00Z`) - dias * 86400000;
    return new FechaOperativa(new Date(ms).toISOString().slice(0, 10));
  }

  /** Cantidad de dias que abarca un rango, contando ambos extremos. */
  static diasEntre(inicio, fin) {
    const ms = Date.parse(`${fin.iso}T00:00:00Z`) - Date.parse(`${inicio.iso}T00:00:00Z`);
    return Math.round(ms / 86400000) + 1;
  }

  toJSON() {
    return this.#iso;
  }

  toString() {
    return this.#iso;
  }
}
