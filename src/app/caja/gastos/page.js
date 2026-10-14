'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/components/clienteApi';
import { soles } from '@/compartido/formato';

const CATEGORIAS = [
  ['insumos', 'Insumos (queso, harina, embutidos...)'],
  ['personal', 'Personal / pagos'],
  ['servicios', 'Servicios (luz, agua, gas, internet)'],
  ['delivery', 'Delivery / movilidad'],
  ['otros', 'Otros'],
];

const FORMULARIO_VACIO = {
  descripcion: '',
  monto: '',
  categoria: 'insumos',
  metodo_pago: 'efectivo',
};

/** Registro de las salidas de dinero del dia. */
export default function Gastos() {
  const [datos, setDatos] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(() => {
    api.obtener('/api/gastos').then(setDatos).catch((f) => setError(f.message));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function guardar(evento) {
    evento.preventDefault();
    setError('');
    setGuardando(true);

    try {
      await api.crear('/api/gastos', formulario);
      setFormulario(FORMULARIO_VACIO);
      cargar();
    } catch (fallo) {
      setError(fallo.message);
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(id) {
    if (!confirm('Eliminar este gasto?')) return;
    try {
      await api.eliminar(`/api/gastos?id=${id}`);
      cargar();
    } catch (fallo) {
      setError(fallo.message);
    }
  }

  if (!datos) return <div className="cargando">Cargando gastos...</div>;

  const total = datos.gastos.reduce((suma, g) => suma + g.monto, 0);
  const salioDeCaja = datos.gastos
    .filter((g) => g.medioDePago === 'efectivo')
    .reduce((suma, g) => suma + g.monto, 0);

  const cambiar = (campo) => (evento) =>
    setFormulario({ ...formulario, [campo]: evento.target.value });

  return (
    <>
      <h1>Gastos del dia</h1>
      <p className="sub">
        {datos.fecha} · anota aqui todo lo que salga de caja. Los gastos en efectivo se descuentan
        del cuadre.
      </p>

      <div className="metricas">
        <div className="metrica">
          <div className="et">Total gastado</div>
          <div className="val">{soles(total)}</div>
        </div>
        <div className="metrica">
          <div className="et">Salio de caja (efectivo)</div>
          <div className="val">{soles(salioDeCaja)}</div>
        </div>
        <div className="metrica">
          <div className="et">Registros</div>
          <div className="val">{datos.gastos.length}</div>
        </div>
      </div>

      <div className="dos-col">
        <form className="tarjeta" onSubmit={guardar}>
          <div className="tarjeta-titulo">Registrar un gasto</div>

          {error && <div className="aviso aviso-error">{error}</div>}

          <div className="campo">
            <label>Descripcion</label>
            <input
              value={formulario.descripcion}
              onChange={cambiar('descripcion')}
              placeholder="Ej: 5 kg de queso mozzarella"
              required
            />
          </div>

          <div className="fila">
            <div className="campo">
              <label>Monto (S/)</label>
              <input
                type="number" inputMode="decimal"
                step="0.10"
                min="0.10"
                value={formulario.monto}
                onChange={cambiar('monto')}
                placeholder="0.00"
                required
              />
            </div>
            <div className="campo">
              <label>Pagado con</label>
              <select value={formulario.metodo_pago} onChange={cambiar('metodo_pago')}>
                <option value="efectivo">Efectivo</option>
                <option value="yape">Yape</option>
                <option value="plin">Plin</option>
              </select>
            </div>
          </div>

          <div className="campo">
            <label>Categoria</label>
            <select value={formulario.categoria} onChange={cambiar('categoria')}>
              {CATEGORIAS.map(([valor, texto]) => (
                <option key={valor} value={valor}>{texto}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-primario btn-ancho" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Agregar gasto'}
          </button>
        </form>

        <div className="tarjeta">
          <div className="tarjeta-titulo">Gastos registrados hoy</div>

          {datos.gastos.length === 0 ? (
            <div className="vacio">Todavia no hay gastos registrados.</div>
          ) : (
            <table className="tabla">
              <thead>
                <tr><th>Descripcion</th><th className="num">Monto</th><th></th></tr>
              </thead>
              <tbody>
                {datos.gastos.map((gasto) => (
                  <tr key={gasto.id}>
                    <td>
                      {gasto.descripcion}
                      <div className="chico">{gasto.categoria} · {gasto.medioDePago}</div>
                    </td>
                    <td className="num"><b>{soles(gasto.monto)}</b></td>
                    <td>
                      <button className="btn btn-chico btn-peligro" onClick={() => borrar(gasto.id)}>
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td><b>Total</b></td>
                  <td className="num"><b>{soles(total)}</b></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
