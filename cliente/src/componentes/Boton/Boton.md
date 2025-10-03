# `Boton` - Componente de Botón Reutilizable

El componente `Boton` es un elemento de UI versátil diseñado para ser utilizado en cualquier parte de la aplicación. Puede mostrar texto, un ícono o ambos, y su estilo se puede personalizar fácilmente a través de sus propiedades.

---

## 📖 Propiedades (`Props`)

| Propiedad | Tipo | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- |
| `texto` | `string` | El texto que se muestra en el botón. Es opcional. | `"Enviar"` |
| `logo` | `string` | Nombre del ícono a mostrar. Se utiliza para mapear a un componente de `react-icons`. | `"Check"` |
| `size` | `number` | El tamaño del ícono en píxeles. Por defecto es `20`. | `30` |
| `clase` | `string` | La clase CSS para aplicar estilos predefinidos. | `"aceptar"` |
| `onClick` | `function` | Función que se ejecuta cuando se hace clic en el botón. | `() => console.log('clic')` |

---

## 🎨 Tipos de `clase` disponibles

Se han definido las siguientes clases CSS para estilizar el botón. Debes asegurarte de que estas clases existan en tu archivo `boton.css`.

* **`aceptar`**: Para acciones de confirmación, como "Aceptar" o "Guardar".
* **`cancelar`**: Para acciones de cancelación o rechazo.
* **`agregar`**: Para acciones que añaden un nuevo elemento.
* **`eliminar`**: Para acciones que eliminan un elemento.
* **`listar`**: Para botones que muestran listas.
* **`flechas`**: Para botones de navegación (adelante/atrás).
* **`editar`**: Para botones que permiten la edición.

---

## 💡 Ejemplos de uso

### Botón con texto y un ícono de verificación

```jsx
<Boton
  texto="Aceptar"
  logo="Check"
  clase="aceptar"
  onClick={() => alert("¡Acción aceptada!")}
/>
```

### Botón solo con un ícono de lista

```jsx
<Boton
  logo="List"
  clase="listar"
  size={24}
  onClick={() => alert("Mostrando lista de elementos...")}
/>
```

### Botón de eliminación sin ícono

```jsx
<Boton
  texto="Eliminar"
  clase="eliminar"
  onClick={() => alert("¡Elemento eliminado!")}
/>
```

---

```jsx
