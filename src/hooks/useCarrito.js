import { useCallback, useEffect, useState } from "react";

// El carrito vive en localStorage ("carrito") con el formato de siempre:
// [{ id, nombre, precio, cantidad, ... }]. El evento "carritoActualizado"
// mantiene sincronizados el layout y las vistas del cliente.

function leer() {
  try {
    const carrito = JSON.parse(localStorage.getItem("carrito"));
    return Array.isArray(carrito) ? carrito : [];
  } catch {
    return [];
  }
}

function guardar(carrito) {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  window.dispatchEvent(new Event("carritoActualizado"));
}

export default function useCarrito() {
  const [carrito, setCarrito] = useState(leer);

  useEffect(() => {
    const sincronizar = () => setCarrito(leer());
    window.addEventListener("carritoActualizado", sincronizar);
    window.addEventListener("storage", sincronizar);
    return () => {
      window.removeEventListener("carritoActualizado", sincronizar);
      window.removeEventListener("storage", sincronizar);
    };
  }, []);

  const agregar = useCallback((producto, cantidad = 1) => {
    const actual = leer();
    const existe = actual.find((item) => item.id === producto.id);
    guardar(
      existe
        ? actual.map((item) =>
            item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item,
          )
        : [
            ...actual,
            {
              id: producto.id,
              nombre: producto.nombre,
              precio: producto.precio,
              categoria: producto.categoria,
              cantidad,
            },
          ],
    );
  }, []);

  const actualizar = useCallback((id, cantidad) => {
    const actual = leer();
    guardar(
      cantidad <= 0
        ? actual.filter((item) => item.id !== id)
        : actual.map((item) => (item.id === id ? { ...item, cantidad } : item)),
    );
  }, []);

  const quitar = useCallback((id) => guardar(leer().filter((item) => item.id !== id)), []);
  const vaciar = useCallback(() => guardar([]), []);

  const totalUnidades = carrito.reduce((suma, item) => suma + item.cantidad, 0);

  return { carrito, totalUnidades, agregar, actualizar, quitar, vaciar };
}
