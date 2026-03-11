LOGICA DE INSCRIPCIONES - APP ACADEMIAS

1. Estructura del Listado (Columnas)

---

Alumno: Nombre completo y DNI.

Plan / Oferta: Nombre del plan y cantidad de meses (ej. "Pack 3 Meses").

Clases (Consumo): Visualización del uso real (ej. 6 / 12).

Vigencia: Fecha de fin del plan.

Pago: Estado siempre en ✅ Pagado (Monto total). No se permiten deudas ni saldos parciales en el sistema.

---

2. Alertas Visuales y Filtros (UX)
   Badge "Casi Agotado": El contador de clases se pone en Naranja cuando quedan 1 o 2 clases.

Línea "Vencida": Si la fecha actual superó la vigencia, la fila se muestra en Gris/Rojo para diferenciarla de los activos.

Filtro "Próximos Vencimientos": Botón para listar alumnos que vencen en los próximos 7 días (ideal para avisos preventivos por WhatsApp).

Filtro "Últimas Clases": Botón para listar alumnos con 1 o 2 clases restantes (foco en ventas/renovación).

3. Organización por Pestañas
   Pestaña [Activas]: Alumnos con clases disponibles y fecha de vigencia futura.

Pestaña [Finalizadas]: Historial de alumnos que ya agotaron clases o tiempo.

Pestaña [Anuladas]: Registro de auditoría de inscripciones eliminadas.

hostorial [Historico]: Registro historial de los vencidos por 3 o 6 meses.

4. Acciones y Gestión de Caja
   Renovación Rápida: Botón que abre "Nueva Inscripción" con Alumno y Plan anterior ya pre-cargados. Requiere confirmar pago para activarse.

Eliminar (Anular): \* Solo permitido si la inscripción está Vigente.

Genera automáticamente un egreso (monto negativo) en la Caja por el total devuelto.
solamente si esa inscripcion no tiene clases asistidas regla q sea 1
si tiene mas de una q no se pueda eliminar
Editar Plan (Reemplazo):

El sistema anula el plan viejo (pone el monto en negativo en caja).

Se carga el nuevo plan (genera el ingreso positivo en caja).

El dueño solo cobra la diferencia física al alumno, pero el sistema registra ambos movimientos para que el cierre de caja sea exacto.

5. BOTÓN: DETALLE DE ASISTENCIAS (Historial del Plan)
   Función del Botón: Al hacer clic en el icono (ej. un ojo 👁️ o lista 📋), se abre un modal con el historial exacto de entradas vinculadas a esa inscripción específica.

Información en Pantalla:

Fecha y Hora: Momento exacto en que el alumno pasó el DNI.

Clase/Disciplina: A qué clase asistió (Bachata, Árabe, Contemporáneo, etc.).

Contador Visual: Número de clase dentro del plan (Ej: "Clase 1 de 12", "Clase 2 de 12").

Utilidad Operativa:

Evita Discusiones: Si un padre o alumno dice "vine menos veces", el sistema tiene la prueba irrefutable con día y hora.

Transparencia Total: El dueño puede mostrar la pantalla o enviar una captura por WhatsApp para validar el consumo del plan.

Lógica de Datos: El sistema filtra la tabla de asistencias usando el inscripcion_id para asegurar que solo se vean las clases que corresponden al plan pagado actualmente.
