---
sessionId: session-261112-190857-1xbc
---

# Spec 049 — Títulos amigables por página

### Contexto actual

Todas las páginas que usan el componente genérico `AbmVista` muestran el título:

```
Gestión: {entidad}
```

Donde `{entidad}` viene de `config.recursoSingular` de cada hook (`useAbmGenerico` → línea 427). Además, las páginas con diseño custom tienen títulos propios pero varios usan lenguaje técnico.

### Problema

"Gestión: Alumno" suena a software contable genérico. El usuario no se identifica con el título; no le habla a él.

### Solución

Agregar un campo `tituloPagina` opcional a la configuración del hook y pasarlo como prop a `AbmVista`. Cuando exista, `AbmVista` muestra ese título en vez de `"Gestión: {entidad}"`. Las páginas custom cambian su `<h1>` directamente.

### Inventario completo de títulos

| Página | Archivo | Título actual | Nuevo título |
|---|---|---|---| | AbmVista | AbmVista | Custom |
| Alumnos | `Alumnos.tsx` | "Gestión: Alumno" | "Mis Alumnos" | AbmVista |
| Profesores | `profesor.usuario.tsx` | "Gestión: Profesor" | "Profesores de la Escuela" | AbmVista |
| Niveles | `nivel.usuario.tsx` | "Gestión: Nivel" | "Niveles" | AbmVista |
| Tipos | `tipo.usuario.tsx` | "Gestión: Tipo" | "Tipos de Clase" | AbmVista |
| Planes | `planes.usuario.tsx` | "Gestión: Planes" | "Planes de Pago" | AbmVista |
| Tipos Cuenta | `tipo.cuenta.tsx` | "Gestión: Tipos Cuenta" | "Métodos de Pago" | AbmVista |
| Categoría Caja | `categoria.caja.usuario.tsx` | "Gestión: Categoria Caja" | "Categorías de Caja" | AbmVista |
| Horarios | `Horarios.tsx` | "Gestión de Horarios" (oculto) | "Horarios de Clases" | Custom |
| Inscripción | `Inscripcion.tsx` | "Inscripción de alumnos" | "Inscribir Alumnos" | Custom |
| Caja | `Caja.tsx` | "Gestión de Caja" | "Mi Caja" | Custom |
| Listado Cajas | `ListadoCajas.tsx` | Sin h1 | "Historial de Cajas" | Custom |
| Listado Asistencias | `ListadoAsistencias.tsx` | "Listado de Asistencias" | "Historial de Asistencias" | Custom |
| Listado Inscripciones | `ListadoInscrip.tsx` | "Gestión de Inscripciones :" | "Mis Inscripciones" | Custom |
| Flyers | `Flayers.tsx` | "Gestión de Flyers" | "Flyers y Novedades" | Custom |

### Páginas que NO cambian

- **Asistencia** (`FormularioAsistencia.tsx`): Ya muestra `{state.nombreEscuela}` — es personal.
- **Dashboard Usuario** (`Usuario.tsx`): Métricas sin h1 genérico.
- **Perfil Usuario**, **Admin SaaS**, **Principal Alumno**, **Data Escuela**: Son páginas de rol específico, se abordan en specs posteriores.

### Arquitectura del cambio

1. **`useAbmGenerico.ts`**: Agregar `tituloPagina?: string` a `AbmConfig`. Retornarlo en el hook.
2. **`AbmVista.tsx`**: Agregar prop `tituloPagina?: string`. En el `<h1>`, si existe `tituloPagina` lo usa; si no, cae en `"Gestión: {entidad}"` (backward compatible).
3. **Cada hook de config**: Agregar `tituloPagina` al `config` object.
4. **Cada página AbmVista**: Pasar `tituloPagina` como prop a `<AmbVistas>`.
5. **Páginas custom**: Cambiar el texto del `<h1>` directamente.

# Delivery Steps

### ✓ Step 1: 1. Extender useAbmGenerico y AbmVista para aceptar tituloPagina
Agregar el campo `tituloPagina` opcional al flujo genérico CRUD para que cada página pueda personalizar su título.
- En `hooks/useAbmGenerico.ts`: Agregar `tituloPagina?: string` a la interfaz `AbmConfig` y retornarlo en el objeto del hook.
- En `componentes/Crud/AbmVista/AbmVista.tsx`: Agregar prop `tituloPagina?: string`. En el `<h1>`, usar `tituloPagina` si existe; de lo contrario, mantener `"Gestión: {entidad}"` como fallback.
- Esto mantiene backward compatibility: las páginas que no pasen `tituloPagina` siguen funcionando igual.

### ✓ Step 2: 2. Actualizar los 7 hooks de config con los títulos amigables
Agregar `tituloPagina` al objeto `config` de cada hook que usa `useAbmGenerico`.
- `utils/abmAlumnos.ts` → `tituloPagina: "Mis Alumnos"`
- `hookNegocios/abmProfesor.ts` → `tituloPagina: "Profesores de la Escuela"`
- `hookNegocios/abmNivel.ts` → `tituloPagina: "Niveles"`
- `hookNegocios/abmTipo.ts` → `tituloPagina: "Tipos de Clase"`
- `hookNegocios/abmPlanesUsuarios.ts` → `tituloPagina: "Planes de Pago"`
- `hookNegocios/tipo.cuentas.ts` → `tituloPagina: "Métodos de Pago"`
- `hookNegocios/ambCategoria.caja.ts` → `tituloPagina: "Categorías de Caja"`

### * Step 3: 3. Pasar tituloPagina en las 7 páginas AbmVista y actualizar las 6 páginas custom
Conectar el título en las páginas y cambiar los títulos de las páginas con diseño propio.
- En las 7 páginas que usan `AbmVista` (`Alumnos.tsx`, `profesor.usuario.tsx`, `nivel.usuario.tsx`, `tipo.usuario.tsx`, `planes.usuario.tsx`, `tipo.cuenta.tsx`, `categoria.caja.usuario.tsx`): desestructurar `tituloPagina` del hook y pasarlo como prop a `<AmbVistas>`.
- `Horarios.tsx`: Cambiar `<h1>` de "Gestión de Horarios" a "Horarios de Clases" y quitar `visually-hidden` para que sea visible.
- `Inscripcion.tsx`: Cambiar de "Inscripción de alumnos" a "Inscribir Alumnos".
- `Caja.tsx`: Cambiar de "Gestión de Caja" a "Mi Caja".
- `ListadoCajas.tsx`: Agregar `<h1>Historial de Cajas</h1>` (falta h1).
- `ListadoAsistencias.tsx`: Cambiar de "Listado de Asistencias" a "Historial de Asistencias".
- `ListadoInscrip.tsx`: Cambiar de "Gestión de Inscripciones :" a "Mis Inscripciones".
- `Flayers.tsx`: Cambiar de "Gestión de Flyers" a "Flyers y Novedades".