# 📋 Mejoras de Experiencia de Usuario — Pendientes

---

## 🔴 Alta Prioridad (Impacto inmediato en el usuario diario)

### 1. Títulos amigables por página
**Problema:** "Gestión: Alumnos" suena a software contable genérico.
**Mejora:** Cada página debe tener un título que el usuario reconozca: "Mis Alumnos", "Profesores de la Escuela", "Planes de Pago"...

### 2. Buscador siempre visible en listados
**Problema:** El buscador está escondido detrás de una lengüeta "Filtro".
**Mejora:** La búsqueda es la acción más común en un listado; debe estar siempre visible, no escondida.

### 3. Métricas con contexto comparativo
**Problema:** "Alumnos: 45" — ¿45 es mucho? ¿poco? ¿subió o bajó?
**Mejora:** Mostrar "+12% vs mes anterior" o "3 nuevos esta semana" para que los números cobren sentido.

### 4. Saludo personalizado con nombre y escuela
**Problema:** Al loguearse, llega a métricas frías sin contexto personal.
**Mejora:** "Hola, [nombre] — Bienvenido/a a [nombre de la escuela]" con la fecha actual.

### 5. Vista de detalle (no solo modificar/eliminar)
**Problema:** Desde la tabla puede "Modificar" o "Eliminar", pero no "Ver".
**Mejora:** Agregar acción "Ver" para revisar datos sin riesgo de editar por error.

### 6. Mensajes de error específicos por tipo
**Problema:** "Error 500" o "Error genérico" no le dicen al usuario qué hacer.
**Mejora:** Cada error debe tener un mensaje amigable y una acción sugerida (ej: "No se encontró el alumno con ese DNI. Verificá el número e intentá de nuevo").

### 7. "Deshacer" después de eliminar
**Problema:** Si el usuario elimina algo por error, no puede recuperarlo.
**Mejora:** Un toast con "[Elemento] eliminado — [Deshacer]" durante 5 segundos.

---

## 🟡 Media Prioridad (Mejoran el flujo de trabajo)

### 8. Renombrar secciones del menú a lenguaje del usuario
**Problema:** "Operaciones" vs "Gestión" — ¿cuál es la diferencia?
**Mejora:** "Diario" (asistencia, caja, inscripciones), "Mi Escuela" (alumnos, profesores, planes, horarios), "Ajustes" (niveles, tipos, categorías).

### 9. Atajos a acciones frecuentes en el dashboard
**Problema:** Registrar asistencia, inscribir alumno, abrir caja están escondidos en el menú.
**Mejora:** Botones grandes en el dashboard para las 3 acciones que hace todos los días.

### 10. Resumen antes de confirmar en inscripciones
**Problema:** El usuario completa todo y presiona "Inscribir" sin ver un resumen.
**Mejora:** Un paso de confirmación con resumen previene errores de inscripción.

### 11. Vista semanal para el alumno, no solo "hoy"
**Problema:** El alumno solo ve las clases del día actual.
**Mejora:** Un mini-calendario semanal para que el alumno planifique mejor.

### 12. Contacto con la escuela desde el panel del alumno
**Problema:** Si tiene una duda, no hay botón de WhatsApp, email o mensaje.
**Mejora:** Botón de contacto directo (WhatsApp o email) desde el panel del alumno.

### 13. Exportación de datos a Excel/CSV
**Problema:** Si el dueño quiere un Excel de sus alumnos, no puede.
**Mejora:** Botón "Exportar" en los listados principales (alumnos, inscripciones, caja).

### 14. Wizard de horarios con pasos numerados
**Problema:** Son muchos pasos (profesor → nivel → tipo → hora → días) y si se equivoca, tiene que volver.
**Mejora:** Wizard con pasos numerados y resumen al final antes de confirmar.

### 15. Badge de alertas en el menú
**Problema:** Si tiene 5 alumnos por vencer, no lo sabe hasta que entra a la página.
**Mejora:** Un badge o contador en el ítem del menú que indique problemas pendientes.

---

## 🟢 Baja Prioridad (Mejoras de confort)

### 16. Programación de flyers por fecha
**Mejora:** Poder programar "este flyer se activa el 1 de diciembre" para campañas planificadas.

### 17. Inscripción masiva desde Excel
**Mejora:** Si tiene 10 nuevos alumnos, importar desde archivo en vez de repetir el proceso 10 veces.

### 18. Breadcrumbs en todas las páginas
**Mejora:** Mejor orientación para saber en qué nivel de la jerarquía está el usuario.

### 19. Atajos de teclado
**Mejora:** Ctrl+K para buscar, Escape para cerrar modales (ya funciona), etc. para usuarios avanzados.

### 20. Perfil de profesores visible para el alumno
**Mejora:** El alumno quiere ver quiénes son sus profesores, con foto y especialidad.

### 21. Cambio de plan desde el panel del alumno
**Mejora:** El alumno puede ver los planes y solicitar un cambio directamente.

### 22. Menú persistente en desktop
**Mejora:** El menú no se cierre al cambiar de ruta en desktop para navegar más rápido.

### 23. "Recordarme" y "Olvidé mi contraseña" en login
**Mejora:** Menos fricción en el login y recuperación de contraseña por email.

---

## 💡 La mejora más importante

**Dar personalidad al sistema.**

Hoy el sistema se siente como un software genérico de gestión. Cada título, cada mensaje, cada estado vacío está escrito en un lenguaje técnico.

Si cada página tuviera un título que el usuario reconoce, cada error le dijera qué hacer, y cada estado vacío le sugiriera la siguiente acción, la experiencia pasaría de "funcional" a "agradable" sin cambiar la arquitectura del código.
