# `ListadoMolde` - Componente para Renderizar Listas

El componente `ListadoMolde` es una solución reutilizable para mostrar listas de datos de forma dinámica. Recibe un array de objetos y, para cada uno, renderiza un componente `ItemGenerico`, lo que te permite crear listas flexibles con opciones de "Editar" y "Eliminar".

---

## 📖 Propiedades (`Props`)

| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `items` | `Array<Record<string, unknown>>` | Un array de objetos, donde cada objeto representa un ítem en la lista. Este es el único prop obligatorio. |
| `onEditar` | `(data) => void` | Una función de callback que se ejecuta cuando se hace clic en el botón "Editar" de un ítem. Recibe como argumento el objeto de datos completo del ítem. |
| `onEliminar` | `(data) => void` | Una función de callback que se ejecuta cuando se hace clic en el botón "Eliminar" de un ítem. Recibe como argumento el objeto de datos completo del ítem. |

---

## ⚙️ Lógica de Renderizado

`ListadoMolde` itera sobre el array `items` que recibe como prop. Por cada elemento en el array, renderiza un componente `ItemGenerico`.

La **propiedad `key`** de cada `ItemGenerico` se determina de la siguiente manera para garantizar un rendimiento óptimo en React:
- Si el objeto de datos (`item`) tiene una propiedad `id` (de tipo string o number), se usa como la clave.
- Si no tiene una propiedad `id` válida, se utiliza el índice del array (`idx`) como clave.

Además, los props `onEditar` y `onEliminar` se pasan directamente a `onEditarButton` y `onEliminarButton` de cada `ItemGenerico`, asegurando que las acciones de editar y eliminar se manejen a nivel de la lista.

---

## 💡 Ejemplo de uso

### Visualización de una lista de productos

```jsx
import React from "react";
import { ListadoMolde } from "./ListadoMolde";

// Datos de ejemplo para la lista
const productosEjemplo = [
  { id: "p1", nombre: "Laptop", precio: 1200 },
  { id: "p2", nombre: "Mouse", precio: 25 },
  { id: "p3", nombre: "Teclado", precio: 75 },
];

const handleEditar = (producto) => {
  console.log("Editando producto:", producto);
};

const handleEliminar = (producto) => {
  console.log("Eliminando producto:", producto);
};

const App = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Listado de Productos</h1>
      <ListadoMolde
        items={productosEjemplo}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />
    </div>
  );
};

export default App;
```

### El resultado visual del ejemplo anterior mostrará:

* Un `ItemGenerico` para cada producto, con sus propiedades `nombre` y `precio`.
* Un botón de "Editar" y "Eliminar" en cada ítem, que al hacer clic ejecutará las funciones `handleEditar` y `handleEliminar` con los datos del producto correspondiente.
