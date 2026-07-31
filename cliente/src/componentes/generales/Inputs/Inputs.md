# `Inputs` - Componente de Campo de Entrada Reutilizable

El componente `Inputs` es un campo de entrada (`<input>`) genérico y reutilizable. Está diseñado para simplificar la creación de formularios al incluir automáticamente una etiqueta (`<label>`) y un espacio para mostrar mensajes de error, todo con un estilo predefinido.

---

## 📖 Propiedades (`Props`)

El componente acepta las siguientes propiedades para su configuración:

| Propiedad | Tipo | Opcional | Descripción | Ejemplo |
| :--- | :--- | :--- | :--- | :--- |
| `label` | `string` | Sí | El texto que se muestra como etiqueta para el campo de entrada. Si no se proporciona, se usará "Campo de entrada". | `"Nombre de usuario"` |
| `type` | `'text' \| 'password' \| ...` | Sí | El tipo del campo de entrada (por defecto es `"text"`). | `"password"` |
| `placeholder` | `string` | Sí | El texto de marcador de posición dentro del campo. Si no se proporciona, se usará "Ingrese un valor". | `"Contraseña"` |
| `value` | `string \| number` | Sí | El valor actual del campo de entrada. | `"ejemplo"` |
| `name` | `string` | Sí | El nombre del campo. Se utiliza para identificar el elemento en un formulario. | `"username"` |
| `onChange` | `function` | Sí | La función que se ejecuta cada vez que el valor del campo cambia. | `(e) => handleInputChange(e)` |
| `error` | `string \| null` | Sí | El mensaje de error a mostrar debajo del campo. Si no hay error, debe ser `null` o una cadena vacía. | `"El campo es obligatorio"` |

---

## 💡 Ejemplos de uso

### 1. Campo de texto básico

Este ejemplo crea un campo de entrada para un nombre con una etiqueta y un marcador de posición.

```jsx
<Inputs
  label="Nombre"
  type="text"
  placeholder="Introduce tu nombre"
  onChange={(e) => console.log(e.target.value)}
/>
```

### 2. Campo de contraseña con validación

Este ejemplo muestra un campo de contraseña que muestra un mensaje de error si no se cumple una validación.

```jsx
<Inputs
  label="Contraseña"
  type="password"
  placeholder="Ingresa tu contraseña"
  error="La contraseña debe tener al menos 8 caracteres."
/>
```

### 3. Campo de correo electrónico con un valor controlado

En este ejemplo, el valor del campo de correo electrónico está controlado por el estado de un componente superior.

```jsx
<Inputs
  label="Correo electrónico"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```
---
```jsx
