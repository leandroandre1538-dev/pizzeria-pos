'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import Icono from '@/components/Icono';
import { soles, precioCorto, presentacionPorDefecto } from '@/compartido/formato';

const TODAS = 0;

/**
 * Catalogo con buscador y filtro por categoria.
 *
 * Cada presentacion es un boton con su precio: la cajera toca el precio que
 * quiere y se abre el detalle. Es un paso menos que elegir el producto y
 * despues el tamano.
 */
export default function CatalogoDeProductos({ categorias, productos, onElegir }) {
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState(TODAS);

  const visibles = useMemo(() => {
    const texto = normalizar(busqueda.trim());

    const deLaCategoria = productos.filter(
      (producto) => categoria === TODAS || producto.categoria_id === categoria
    );
    if (!texto) return deLaCategoria;

    // Primero lo que coincide por nombre y despues por ingredientes: al buscar
    // "americana" la pizza Americana va antes que los combos que la incluyen.
    const porNombre = deLaCategoria.filter((p) => normalizar(p.nombre).includes(texto));
    const porIngredientes = deLaCategoria.filter(
      (p) => !porNombre.includes(p) && normalizar(p.descripcion).includes(texto)
    );
    return [...porNombre, ...porIngredientes];
  }, [productos, busqueda, categoria]);

  return (
    <div>
      <div className="buscador">
        <Icono de={Search} />
        <input
          type="search"
          aria-label="Buscar producto"
          placeholder="Buscar pizza, bebida, combo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="chips deslizable">
        <button
          className={`chip ${categoria === TODAS ? 'activo' : ''}`}
          onClick={() => setCategoria(TODAS)}
        >
          Todo
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            className={`chip ${categoria === c.id ? 'activo' : ''}`}
            onClick={() => setCategoria(c.id)}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <div className="vacio">No se encontraron productos con esa busqueda.</div>
      ) : (
        <div className="grid-productos">
          {visibles.map((producto) => (
            <TarjetaDeProducto key={producto.id} producto={producto} onElegir={onElegir} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Minusculas y sin tildes: "espanola" encuentra "Española" y al reves. */
function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Tarjeta de un producto: toda la tarjeta es el boton.
 *
 * Muestra un solo precio, el de la presentacion por defecto (la familiar en
 * las pizzas). Las demas presentaciones se eligen al abrirla, que es cuando la
 * cajera ya sabe que va a pedir el cliente.
 */
function TarjetaDeProducto({ producto, onElegir }) {
  const variante = presentacionPorDefecto(producto.variantes);
  if (!variante) return null;

  const hayMasPresentaciones = producto.variantes.length > 1;

  return (
    <button
      className="producto"
      onClick={() => onElegir({ producto, variante })}
      aria-label={`${producto.nombre}, ${variante.nombre} ${soles(variante.precio)}`}
    >
      <span className="p-info">
        <span className="nom">{producto.nombre}</span>
        <span className="desc">{producto.descripcion}</span>
      </span>

      <span className="p-precio">
        <span className="p-val">{precioCorto(variante.precio)}</span>
        {hayMasPresentaciones && <span className="p-pres">{variante.nombre}</span>}
      </span>
    </button>
  );
}
