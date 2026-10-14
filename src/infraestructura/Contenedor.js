// Adaptadores de salida
import { crearAdaptadoresDeSalida } from './AdaptadoresDeSalida';
import { ArmadorDeCorreoDeResumen } from './correo/ArmadorDeCorreoDeResumen';
import { RelojDeLima } from './reloj/RelojDeLima';
import { HasheadorSha256 } from './seguridad/HasheadorSha256';
import { GestorDeSesion } from './seguridad/GestorDeSesion';

// Casos de uso
import { RegistrarPedido } from '@/aplicacion/casos-uso/pedidos/RegistrarPedido';
import { ListarPedidosDelDia } from '@/aplicacion/casos-uso/pedidos/ListarPedidosDelDia';
import { AnularPedido } from '@/aplicacion/casos-uso/pedidos/AnularPedido';
import { RegistrarGasto } from '@/aplicacion/casos-uso/gastos/RegistrarGasto';
import { ListarGastosDelDia } from '@/aplicacion/casos-uso/gastos/ListarGastosDelDia';
import { EliminarGasto } from '@/aplicacion/casos-uso/gastos/EliminarGasto';
import { ObtenerCierreDelDia } from '@/aplicacion/casos-uso/cierre/ObtenerCierreDelDia';
import { GuardarCierreDelDia } from '@/aplicacion/casos-uso/cierre/GuardarCierreDelDia';
import { ObtenerCartaVigente } from '@/aplicacion/casos-uso/carta/ObtenerCartaVigente';
import { AdministrarCarta } from '@/aplicacion/casos-uso/carta/AdministrarCarta';
import { AdministrarAdicionales } from '@/aplicacion/casos-uso/carta/AdministrarAdicionales';
import { AdministrarPromociones } from '@/aplicacion/casos-uso/promociones/AdministrarPromociones';
import { GenerarResumenDiario } from '@/aplicacion/casos-uso/resumen/GenerarResumenDiario';
import { EnviarResumenDiario } from '@/aplicacion/casos-uso/resumen/EnviarResumenDiario';
import { IniciarSesion } from '@/aplicacion/casos-uso/usuarios/IniciarSesion';
import { AdministrarUsuarios } from '@/aplicacion/casos-uso/usuarios/AdministrarUsuarios';

/**
 * Raiz de composicion: el unico lugar donde se decide que implementacion
 * concreta usa cada puerto.
 *
 * Los casos de uso reciben sus dependencias ya armadas y nunca importan
 * Supabase ni Resend. Que juego de adaptadores se usa (Supabase o memoria) lo
 * decide `AdaptadoresDeSalida.js`; aqui solo se reparten.
 *
 * Se construye una sola vez por instancia del servidor y se reutiliza entre
 * peticiones (creacion perezosa: nada se instancia hasta que se pide).
 */
class Contenedor {
  #cache = new Map();

  /** Memoriza cada dependencia la primera vez que se pide. */
  #una(clave, construir) {
    if (!this.#cache.has(clave)) this.#cache.set(clave, construir());
    return this.#cache.get(clave);
  }

  // ------------------------------------------------------------ adaptadores
  get reloj() {
    return this.#una('reloj', () => new RelojDeLima());
  }

  /** Repositorios, correo y bitacora: Supabase en produccion, memoria en modo local. */
  get #salida() {
    return this.#una('salida', () =>
      crearAdaptadoresDeSalida({ reloj: this.reloj, hasheadorDeClaves: this.hasheadorDeClaves })
    );
  }

  get repositorioDePedidos() {
    return this.#salida.repositorioDePedidos;
  }

  get repositorioDeGastos() {
    return this.#salida.repositorioDeGastos;
  }

  get repositorioDeCierres() {
    return this.#salida.repositorioDeCierres;
  }

  get repositorioDeCarta() {
    return this.#salida.repositorioDeCarta;
  }

  get repositorioDePromociones() {
    return this.#salida.repositorioDePromociones;
  }

  get repositorioDeUsuarios() {
    return this.#salida.repositorioDeUsuarios;
  }

  get registroDeEnvios() {
    return this.#salida.registroDeEnvios;
  }

  get servicioDeCorreo() {
    return this.#salida.servicioDeCorreo;
  }

  get armadorDeCorreo() {
    return this.#una('armadorCorreo', () => new ArmadorDeCorreoDeResumen());
  }

  get hasheadorDeClaves() {
    return this.#una('hasheador', () => new HasheadorSha256());
  }

  get gestorDeSesion() {
    return this.#una('sesion', () => new GestorDeSesion());
  }

  // ----------------------------------------------------------- casos de uso
  get registrarPedido() {
    return this.#una('cu:registrarPedido', () => new RegistrarPedido(this.#dependencias()));
  }

  get listarPedidosDelDia() {
    return this.#una('cu:listarPedidos', () => new ListarPedidosDelDia(this.#dependencias()));
  }

  get anularPedido() {
    return this.#una('cu:anularPedido', () => new AnularPedido(this.#dependencias()));
  }

  get registrarGasto() {
    return this.#una('cu:registrarGasto', () => new RegistrarGasto(this.#dependencias()));
  }

  get listarGastosDelDia() {
    return this.#una('cu:listarGastos', () => new ListarGastosDelDia(this.#dependencias()));
  }

  get eliminarGasto() {
    return this.#una('cu:eliminarGasto', () => new EliminarGasto(this.#dependencias()));
  }

  get obtenerCierreDelDia() {
    return this.#una('cu:obtenerCierre', () => new ObtenerCierreDelDia(this.#dependencias()));
  }

  get guardarCierreDelDia() {
    return this.#una('cu:guardarCierre', () => new GuardarCierreDelDia(this.#dependencias()));
  }

  get obtenerCartaVigente() {
    return this.#una('cu:cartaVigente', () => new ObtenerCartaVigente(this.#dependencias()));
  }

  get administrarCarta() {
    return this.#una('cu:adminCarta', () => new AdministrarCarta(this.#dependencias()));
  }

  get administrarAdicionales() {
    return this.#una('cu:adminAdicionales', () => new AdministrarAdicionales(this.#dependencias()));
  }

  get administrarPromociones() {
    return this.#una('cu:adminPromos', () => new AdministrarPromociones(this.#dependencias()));
  }

  get generarResumenDiario() {
    return this.#una('cu:generarResumen', () => new GenerarResumenDiario(this.#dependencias()));
  }

  get enviarResumenDiario() {
    return this.#una(
      'cu:enviarResumen',
      () =>
        new EnviarResumenDiario({
          generarResumenDiario: this.generarResumenDiario,
          servicioDeCorreo: this.servicioDeCorreo,
          armadorDeCorreo: this.armadorDeCorreo,
          registroDeEnvios: this.registroDeEnvios,
        })
    );
  }

  get iniciarSesion() {
    return this.#una('cu:iniciarSesion', () => new IniciarSesion(this.#dependencias()));
  }

  get administrarUsuarios() {
    return this.#una('cu:adminUsuarios', () => new AdministrarUsuarios(this.#dependencias()));
  }

  /**
   * Bolsa de puertos que reciben los casos de uso.
   * Cada uno toma por nombre solo lo que necesita y deja el resto.
   */
  #dependencias() {
    return {
      reloj: this.reloj,
      repositorioDePedidos: this.repositorioDePedidos,
      repositorioDeGastos: this.repositorioDeGastos,
      repositorioDeCierres: this.repositorioDeCierres,
      repositorioDeCarta: this.repositorioDeCarta,
      repositorioDePromociones: this.repositorioDePromociones,
      repositorioDeUsuarios: this.repositorioDeUsuarios,
      hasheadorDeClaves: this.hasheadorDeClaves,
    };
  }
}

export const contenedor = new Contenedor();
