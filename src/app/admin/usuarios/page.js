'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/components/clienteApi';

const FORMULARIO_VACIO = { usuario: '', nombre: '', clave: '' };

/** Gestion de administradores. La cajera no aparece: no tiene credenciales. */
export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [aviso, setAviso] = useState(null);
  const [cambiandoClaveDe, setCambiandoClaveDe] = useState(null);
  const [nuevaClave, setNuevaClave] = useState('');

  const cargar = useCallback(() => {
    api.obtener('/api/admin/usuarios')
      .then((datos) => setUsuarios(datos.usuarios))
      .catch((fallo) => setAviso({ tipo: 'error', texto: fallo.message }));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function ejecutar(accion, mensaje) {
    setAviso(null);
    try {
      await accion();
      if (mensaje) setAviso({ tipo: 'ok', texto: mensaje });
      cargar();
    } catch (fallo) {
      setAviso({ tipo: 'error', texto: fallo.message });
    }
  }

  function crear(evento) {
    evento.preventDefault();
    ejecutar(async () => {
      await api.crear('/api/admin/usuarios', formulario);
      setFormulario(FORMULARIO_VACIO);
    }, 'Administrador creado.');
  }

  function cambiarClave(id) {
    ejecutar(async () => {
      await api.actualizar('/api/admin/usuarios', { id, clave: nuevaClave });
      setCambiandoClaveDe(null);
      setNuevaClave('');
    }, 'Clave actualizada.');
  }

  if (!usuarios) return <div className="cargando">Cargando usuarios...</div>;

  return (
    <>
      <h1>Usuarios administradores</h1>
      <p className="sub">
        Solo el perfil administrador necesita usuario y clave. La cajera entra directo desde la
        pantalla de inicio.
      </p>

      {aviso && (
        <div className={`aviso aviso-${aviso.tipo === 'ok' ? 'ok' : 'error'}`}>{aviso.texto}</div>
      )}

      <div className="dos-col">
        <form className="tarjeta" onSubmit={crear}>
          <div className="tarjeta-titulo">Nuevo administrador</div>

          <div className="campo">
            <label>Usuario</label>
            <input
              value={formulario.usuario}
              onChange={(e) => setFormulario({ ...formulario, usuario: e.target.value })}
              placeholder="sin espacios, ej: dueno"
              required
            />
          </div>

          <div className="campo">
            <label>Nombre para mostrar</label>
            <input
              value={formulario.nombre}
              onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
              placeholder="Ej: Juan Perez"
            />
          </div>

          <div className="campo">
            <label>Clave (minimo 6 caracteres)</label>
            <input
              type="password"
              value={formulario.clave}
              onChange={(e) => setFormulario({ ...formulario, clave: e.target.value })}
              required
            />
          </div>

          <button className="btn btn-primario btn-ancho">Crear administrador</button>
        </form>

        <div className="tarjeta">
          <div className="tarjeta-titulo">Administradores registrados</div>

          <table className="tabla">
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <b>{usuario.nombre}</b>
                    <div className="chico">{usuario.usuario}</div>

                    {cambiandoClaveDe === usuario.id && (
                      <div className="fila mt">
                        <input
                          className="input"
                          type="password"
                          placeholder="Nueva clave"
                          value={nuevaClave}
                          onChange={(e) => setNuevaClave(e.target.value)}
                        />
                        <button
                          className="btn btn-chico btn-primario"
                          style={{ flex: '0 0 auto' }}
                          onClick={() => cambiarClave(usuario.id)}
                        >
                          Guardar
                        </button>
                      </div>
                    )}
                  </td>

                  <td>
                    <span className={`etiqueta ${usuario.activo ? 'et-verde' : 'et-gris'}`}>
                      {usuario.activo ? 'activo' : 'inactivo'}
                    </span>
                  </td>

                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-chico btn-claro"
                      onClick={() => {
                        setCambiandoClaveDe(cambiandoClaveDe === usuario.id ? null : usuario.id);
                        setNuevaClave('');
                      }}
                    >
                      Cambiar clave
                    </button>
                    <button
                      className="btn btn-chico btn-claro"
                      style={{ marginLeft: 6 }}
                      onClick={() =>
                        ejecutar(() =>
                          api.actualizar('/api/admin/usuarios', {
                            id: usuario.id,
                            activo: !usuario.activo,
                          })
                        )
                      }
                    >
                      {usuario.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
