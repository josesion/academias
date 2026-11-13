---
sessionId: session-261112-200324-1n0a
---

# Requerimientos

### Overview
Agregar un saludo personalizado en el panel del usuario que muestre el nombre del usuario, el nombre de su escuela y la fecha actual. Así, al iniciar sesión, el usuario recibe un contexto personal en lugar de llegar directamente a métricas frías.

### Alcance

**Incluido:**
- Saludo en `Usuario.tsx`: "Hola, [nombre] — Bienvenido a [escuela]" con la fecha actual.
- Reutilizar datos ya disponibles en el contexto (`rol.usuario` y `rol.razon_social`).
- Fecha formateada en español (ej: "martes, 10 de noviembre de 2025").
- Estilos CSS integrados con el encabezado existente.

**Excluido:**
- Panel del Admin: el administrador no pertenece a una escuela.
- Cambios en el backend: los datos ya están en el frontend.
- Saludos por hora del día (se puede agregar después).

### Requerimientos Funcionales
1. El encabezado del panel usuario muestra un saludo con nombre y escuela.
2. La fecha se formatea en español según el locale del navegador.
3. Si no hay datos de usuario o escuela, no se muestra el saludo (fallback silencioso).
4. El saludo es accesible para lectores de pantalla.

### Requerimientos No Funcionales
- Responsive: se adapta a pantallas pequeñas sin romper el layout.
- Sin dependencias nuevas: solo usa APIs nativas del navegador.

# Diseño Técnico

### Implementación Actual

**Datos disponibles en el contexto:**
- `RutasProtegidasContext` (`protectRutas.tsx`) expone `rol` con:
  - `rol.usuario`: nombre de usuario.
  - `rol.razon_social`: nombre de la escuela.

**Encabezado actual en `Usuario.tsx`:**
- Etiqueta: "Principal"
- Título: `<h1>Panel de la academia</h1>`
- Descripción: "Alumnos, asistencia y actividad reciente de tu escuela."
- Botón: "Asistencia rápida"

**No se necesita backend.** Los datos ya llegan al frontend.

### Cambios Propuestos

**1. `cliente/src/pagina/privado/usuario/Usuario.tsx`**
- Importar `RutasProtegidasContext`.
- Extraer `rol.usuario` y `rol.razon_social`.
- Formatear fecha con `Intl.DateTimeFormat` en español.
- Insertar `<p className="usuario_saludo">` entre la etiqueta y el `<h1>`.

**2. `cliente/src/pagina/privado/usuario/usuario.css`**
- `.usuario_saludo`: color secundario, fuente reducida, margen.
- Media query para pantallas pequeñas.

### Arquitectura

Cambio puramente visual/frontend. El saludo lee del contexto existente y se renderiza en el encabezado.

```
mermaid
graph LR
    A[RutasProtegidasContext] -->|rol.usuario + rol.razon_social| B[Usuario.tsx]
    B -->|renderiza| C[Saludo en header]
```

### Archivos a modificar
- `cliente/src/pagina/privado/usuario/Usuario.tsx`
- `cliente/src/pagina/privado/usuario/usuario.css`

# Plan de Entrega

### ✓ Step 1: Agregar saludo personalizado a Usuario.tsx
El panel del usuario mostrará un saludo con nombre, escuela y fecha actual.

- Importar `useContext` y `RutasProtegidasContext` en `Usuario.tsx`.
- Extraer `rol.usuario` y `rol.razon_social` del contexto.
- Formatear la fecha con `Intl.DateTimeFormat` en español.
- Insertar `<p className="usuario_saludo">` en el encabezado con el texto: "Hola, [usuario] — Bienvenido a [escuela] • [fecha]".
- Si no hay datos de rol, no renderizar el saludo (fallback silencioso).

### ✓ Step 2: Estilos CSS del saludo en usuario.css
El saludo se integra visualmente con el encabezado existente.

- Agregar `.usuario_saludo` con color secundario, tamaño de fuente reducido y margen.
- Agregar media query para pantallas pequeñas: ajustar tamaño de fuente.
- Verificar que el layout no se rompa con el nuevo elemento en el encabezado.