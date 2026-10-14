'use client';

import { useCallback, useMemo, useState } from 'react';

/**
 * Estado del carrito de la caja.
 *
 * Los totales que calcula son solo para que la cajera vea el monto mientras
 * arma el pedido. El importe que vale es el que recalcula el servidor al
 * registrar: aqui nadie decide cuanto se cobra.
 */
export function useCarrito() {
  const [lineas, setLineas] = useState([]);

  const agregar = useCallback((linea) => {
    setLineas((actuales) => [
      ...actuales,
      { ...linea, idLocal: `${Date.now()}-${actuales.length}` },
    ]);
  }, []);

  const cambiarCantidad = useCallback((idLocal, delta) => {
    setLineas((actuales) =>
      actuales.map((linea) =>
        linea.idLocal === idLocal
          ? { ...linea, cantidad: Math.max(1, linea.cantidad + delta) }
          : linea
      )
    );
  }, []);

  const quitar = useCallback((idLocal) => {
    setLineas((actuales) => actuales.filter((linea) => linea.idLocal !== idLocal));
  }, []);

  const vaciar = useCallback(() => setLineas([]), []);

  const subtotal = useMemo(
    () => lineas.reduce((suma, linea) => suma + totalDeLinea(linea), 0),
    [lineas]
  );

  const cantidadDeProductos = useMemo(
    () => lineas.reduce((suma, linea) => suma + linea.cantidad, 0),
    [lineas]
  );

  /** Convierte el carrito al formato que espera la API. */
  const aPeticion = useCallback(
    () =>
      lineas.map((linea) => ({
        producto_id: linea.productoId,
        variante_id: linea.varianteId,
        nombre_producto: linea.nombreProducto,
        nombre_variante: linea.nombreVariante,
        tipo: linea.tipo,
        pizzas_equivalentes: linea.pizzasEquivalentes,
        cantidad: linea.cantidad,
        precio_lista: linea.precioLista,
        precio_unitario: linea.precioUnitario,
        motivo_edicion: linea.motivoEdicion,
        extras: linea.adicionales,
        nota: linea.nota,
      })),
    [lineas]
  );

  return {
    lineas,
    subtotal,
    cantidadDeProductos,
    estaVacio: lineas.length === 0,
    agregar,
    cambiarCantidad,
    quitar,
    vaciar,
    aPeticion,
  };
}

export function adicionalesPorUnidad(linea) {
  return redondear(linea.adicionales.reduce((suma, a) => suma + Number(a.precio), 0));
}

export function totalDeLinea(linea) {
  return redondear((linea.precioUnitario + adicionalesPorUnidad(linea)) * linea.cantidad);
}

export function redondear(valor) {
  return Math.round((Number(valor) || 0) * 100) / 100;
}
