import { GuiaSeccion } from "../GuiaSeccion";

/**
 * Guía paso a paso: Inscripciones.
 *
 * Explica cómo inscribir un alumno, consultar el listado y anular inscripciones.
 */
export const GuiaInscripcionesPage = () => {
  const pasos = [
    {
      numero: 1,
      titulo: "Acceder al listado de inscripciones",
      descripcion:
        'Desde el menú lateral, ve a "Diario" → "Inscripciones". Verás el listado completo de todas las inscripciones de tu academia con un panel de filtros lateral.',
      imagen: "inscripciones-listado",
      nota: "💡 Consejo: El listado muestra primero las inscripciones más recientes. Usá los filtros laterales para encontrar inscripciones específicas rápidamente.",
    },
    {
      numero: 2,
      titulo: "Inscribir un alumno desde el panel",
      descripcion:
        'Puedes inscribir rápidamente desde el panel principal haciendo clic en el botón "Inscribir" en el encabezado. Se abrirá un modal con el formulario de inscripción. También puedes hacerlo desde el listado presionando el botón "Inscribir".',
      imagen: "inscripciones-boton-inscribir",
      nota: "⚠️ Importante: Si tenés el plan Intermedio, necesitás tener la caja abierta para poder inscribir. Si la caja está cerrada, el sistema no permitirá registrar la inscripción.",
    },
    {
      numero: 3,
      titulo: "Seleccionar el alumno",
      descripcion:
        "En el formulario de inscripción, selecciona el alumno de la lista desplegable. Si el alumno no existe, primero debes darlo de alta en 'Mi Escuela' → 'Alumnos Inscriptos'.",
      imagen: "inscripciones-seleccionar-alumno",
      nota: "💡 Consejo: Podés buscar al alumno escribiendo su nombre o DNI en el campo de búsqueda del select. Solo aparecen los alumnos activos en el listado.",
    },
    {
      numero: 4,
      titulo: "Elegir el plan de pago",
      descripcion:
        "Selecciona el plan de pago que corresponde al alumno. Los planes disponibles son los que hayas creado en 'Mi Escuela' → 'Planes de Pago'.",
      imagen: "inscripciones-seleccionar-plan",
      nota: "Captura: Select de planes de pago con opciones visibles.",
    },
    {
      numero: 5,
      titulo: "Seleccionar el método de pago",
      descripcion:
        "Si tienes el plan Intermedio, elige el método de pago (efectivo, tarjeta, transferencia, etc.). Los métodos disponibles son los que hayas configurado en 'Ajustes' → 'Tipos de Cuentas'.",
      imagen: "inscripciones-metodo-pago",
      nota: "Captura: Select de métodos de pago con opciones (solo plan Intermedio).",
    },
    {
      numero: 6,
      titulo: "Confirmar la inscripción",
      descripcion:
        "Opcionalmente agrega notas sobre la inscripción. Luego presiona el botón de confirmar para completar el proceso. Si tienes el plan Intermedio y la caja está abierta, la inscripción se registrará automáticamente en ella.",
      imagen: "inscripciones-confirmar",
      nota: "✅ Una vez confirmada, la inscripción queda activa y el alumno puede comenzar a asistir a clases. La fecha de vencimiento se calcula automáticamente según la duración del plan seleccionado.",
    },
    {
      numero: 7,
      titulo: "Anular una inscripción",
      descripcion:
        "En el listado de inscripciones, haz clic en una inscripción para ver su detalle. Si está activa, verás la opción 'Anular'. Selecciona el método de pago para el reembolso y confirma.",
      imagen: "inscripciones-anular",
      nota: "⚠️ Importante: Al anular una inscripción, se revierten las clases que ya se consumieron y se restablece el saldo del alumno. Si tenés plan Intermedio y la caja abierta, se registra automáticamente un movimiento de egreso correspondiente al reembolso.",
    },
    {
      numero: 8,
      titulo: "Usar los filtros del listado",
      descripcion:
        "En el listado, usa el panel lateral (se abre con una lengüeta) para buscar por texto, filtrar por estado y por rango de fechas. Esto te ayuda a encontrar inscripciones específicas rápidamente.",
      imagen: "inscripciones-filtros",
      nota: "💡 Consejo: Usá el filtro de estado para ver rápidamente solo las inscripciones activas, anuladas o vencidas. Combinarlo con el filtro de fechas te permite ver inscripciones de un período específico.",
    },
  ];

  return (
    <GuiaSeccion
      titulo="Inscripciones"
      subtitulo="Aprende a inscribir alumnos y gestionar sus planes."
      carpetaImagenes="inscripciones"
      pasos={pasos}
    />
  );
};
