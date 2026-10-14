import crypto from 'crypto';
import { HasheadorDeClaves } from '@/aplicacion/puertos/HasheadorDeClaves';

/**
 * Adaptador del puerto HasheadorDeClaves usando SHA-256.
 *
 * El nombre de usuario entra en el hash para que dos administradores con la
 * misma clave no generen el mismo valor almacenado.
 *
 * Para un sistema con dos o tres administradores es suficiente. Si algun dia
 * el sistema maneja muchos usuarios, conviene pasar a bcrypt o argon2: como
 * esto es un adaptador, se cambia este archivo y nada mas.
 */
export class HasheadorSha256 extends HasheadorDeClaves {
  calcular(usuario, clave) {
    return crypto.createHash('sha256').update(`${usuario}:${clave}`).digest('hex');
  }

  coincide(usuario, clave, hashGuardado) {
    const calculado = this.calcular(usuario, clave);
    if (!hashGuardado || calculado.length !== hashGuardado.length) return false;
    // Comparacion de tiempo constante: no filtra informacion por cuanto tarda.
    return crypto.timingSafeEqual(Buffer.from(calculado), Buffer.from(hashGuardado));
  }
}
