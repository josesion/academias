# `ItemGenerico` - Componente para Visualización de Datos

El componente `ItemGenerico` es una herramienta flexible y reutilizable para renderizar dinámicamente los pares clave-valor de un objeto. Proporciona una visualización clara y estructurada de los datos, e incluye botones opcionales de "Editar" y "Eliminar" que activan funciones personalizadas. Es ideal para mostrar elementos de listas o tablas de manera consistente.

---

## 📖 Propiedades (`Props`)

| Propiedad | Tipo | Descripción |
| :--- | :--- | :--- |
| `data` | `Record<string, unknown>` | El objeto que contiene los datos a mostrar. Sus claves se usarán como etiquetas y sus valores se mostrarán al lado. |
| `onEditarButton` | `(data) => void` | La función de callback que se ejecuta al hacer clic en el botón de "Editar". Se le pasa el objeto `data` completo como argumento. |
| `onEliminarButton` | `(data) => void` | La función de callback que se ejecuta al hacer clic en el botón de "Eliminar". Se le pasa el objeto `data` completo como argumento. |

---

## ⚙️ Funciones Auxiliares

### `capitalize`

Esta es una función auxiliar simple que se utiliza internamente para capitalizar la primera letra de las claves del objeto `data` antes de mostrarlas.

* **Parámetros:** `s` (string) - La cadena a capitalizar.
* **Retorno:** La cadena con la primera letra en mayúscula.

---

## 💡 Ejemplos de uso

### Visualización de un objeto de usuario

```jsx
import { ItemGenerico } from "./ItemGenerico";

const usuarioEjemplo = {
  id: 1,
  usuario: "joses",
  nombre_completo: "José Sánchez",
};

<ItemGenerico
  data={usuarioEjemplo}
  onEditarButton={(data) => console.log('Editar:', data)}
  onEliminarButton={(data) => console.log('Eliminar:', data)}
/>
```

### El resultado visual del ejemplo anterior sería:

* **ID:** 1
* **Usuario:** joses
* **Nombre_completo:** José Sánchez
* **Botones:** "Editar" y "Eliminar"
