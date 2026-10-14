import { ordenarCarta } from './ordenarCarta';
import { ordenarPorMasPedidos } from './ordenarPorMasPedidos';

/** Ventana de dias que se mira para decidir que es "lo mas pedido". */
const DIAS_DE_VENTAS = 60;

/**
 * Caso de uso: la carta tal como la ve la cajera al tomar un pedido.
 *
 * Devuelve solo lo activo, ordenado de lo mas pedido a lo menos pedido, y le
 * suma las promociones que realmente aplican hoy: el repositorio filtra por
 * rango de fechas y el dominio decide si el dia de la semana corresponde.
 */
export class ObtenerCartaVigente {
  constructor({ repositorioDeCarta, repositorioDePromociones, repositorioDePedidos, reloj }) {
    this.repositorioDeCarta = repositorioDeCarta;
    this.repositorioDePromociones = repositorioDePromociones;
    this.repositorioDePedidos = repositorioDePedidos;
    this.reloj = reloj;
  }

  async ejecutar() {
    const hoy = this.reloj.hoy();

    const [carta, promociones, vendidos] = await Promise.all([
      this.repositorioDeCarta.obtenerCartaActiva(),
      this.repositorioDePromociones.listarVigentesEn(hoy),
      this.repositorioDePedidos.contarVendidosPorProducto(hoy.restarDias(DIAS_DE_VENTAS)),
    ]);

    return {
      hoy,
      ...ordenarPorMasPedidos(ordenarCarta(carta), vendidos),
      promociones: promociones.filter((promocion) => promocion.estaVigenteEn(hoy)),
    };
  }
}
