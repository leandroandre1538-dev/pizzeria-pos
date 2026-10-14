import { Dinero } from '../valores/Dinero';
import { ErrorDeValidacion } from '../errores/ErroresDominio';

/**
 * Politicas de descuento (patron Strategy).
 *
 * Cada politica sabe calcular y validar un tipo de descuento. Para agregar una
 * forma nueva (por ejemplo "2x1" o "envio gratis") se registra una politica
 * mas aqui y nada del codigo existente cambia: ni la entidad Promocion, ni los
 * casos de uso, ni las rutas. Eso es el principio abierto/cerrado.
 */

class PoliticaDeDescuento {
  constructor(codigo, etiqueta) {
    this.codigo = codigo;
    this.etiqueta = etiqueta;
  }

  /** @returns {Dinero} descuento a aplicar sobre el subtotal */
  calcular(_subtotal, _valor) {
    throw new Error('Cada politica debe implementar calcular().');
  }

  /** Valida el valor configurado para esta politica. */
  validarValor(_valor) {
    throw new Error('Cada politica debe implementar validarValor().');
  }

  /** Como se muestra el descuento en pantalla: "10%" o "S/ 5.00". */
  describir(_valor) {
    throw new Error('Cada politica debe implementar describir().');
  }
}

class DescuentoPorcentual extends PoliticaDeDescuento {
  constructor() {
    super('porcentaje', 'Porcentaje (%)');
  }

  calcular(subtotal, valor) {
    return subtotal.porcentaje(valor);
  }

  validarValor(valor) {
    if (valor <= 0) throw new ErrorDeValidacion('El descuento debe ser mayor a cero.');
    if (valor > 100) throw new ErrorDeValidacion('Un descuento en porcentaje no puede pasar de 100.');
  }

  describir(valor) {
    return `${valor}%`;
  }
}

class DescuentoMontoFijo extends PoliticaDeDescuento {
  constructor() {
    super('monto', 'Monto fijo (S/)');
  }

  calcular(subtotal, valor) {
    // Nunca descuenta mas de lo que cuesta el pedido.
    return Dinero.deSoles(valor).acotadoA(subtotal);
  }

  validarValor(valor) {
    if (valor <= 0) throw new ErrorDeValidacion('El descuento debe ser mayor a cero.');
  }

  describir(valor) {
    return `S/ ${Number(valor).toFixed(2)}`;
  }
}

const REGISTRO = new Map(
  [new DescuentoPorcentual(), new DescuentoMontoFijo()].map((p) => [p.codigo, p])
);

/** Devuelve la politica pedida o falla si el tipo no existe. */
export function politicaDeDescuento(codigo) {
  const politica = REGISTRO.get(codigo);
  if (!politica) {
    throw new ErrorDeValidacion(`Tipo de descuento desconocido: "${codigo}".`);
  }
  return politica;
}

/** Tipos disponibles, para armar los selectores de la interfaz. */
export function tiposDeDescuento() {
  return [...REGISTRO.values()].map((p) => ({ codigo: p.codigo, etiqueta: p.etiqueta }));
}
