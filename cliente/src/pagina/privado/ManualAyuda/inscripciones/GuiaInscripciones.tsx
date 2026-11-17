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
      nota: "Captura: Listado de inscripciones con filtros laterales.",
    },
    {
      numero: 2,
      titulo: "Inscribir un alumno desde el panel",
      descripcion:
        'Puedes inscribir rápidamente desde el panel principal haciendo clic en el botón "Inscribir" en el encabezado. Se abrirá un modal con el formulario de inscripción. También puedes hacerlo desde el listado presionando el botón "Inscribir".',
      imagen: "inscripciones-boton-inscribir",
      nota: "Captura: Botón 'Inscribir' en el panel principal o listado.",
    },
    {
      numero: 3,
      titulo: "Seleccionar el alumno",
      descripcion:
        "En el formulario de inscripción, selecciona el alumno de la lista desplegable. Si el alumno no existe, primero debes darlo de alta en 'Mi Escuela' → 'Alumnos Inscriptos'.",
      imagen: "inscripciones-seleccionar-alumno",
      nota: "Captura: Formulario con el select de alumnos abierto.",
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
      nota: "Captura: Botón de confirmar inscripción y mensaje de éxito.",
    },
    {
      numero: 7,
      titulo: "Anular una inscripción",
      descripcion:
        "En el listado de inscripciones, haz clic en una inscripción para ver su detalle. Si está activa, verás la opción 'Anular'. Selecciona el método de pago para el reembolso y confirma.",
      imagen: "inscripciones-anular",
      nota: "Captura: Panel de detalle con botón 'Anular' visible.",
    },
    {
      numero: 8,
      titulo: "Usar los filtros del listado",
      descripcion:
        "En el listado, usa el panel lateral (se abre con una lengüeta) para buscar por texto, filtrar por estado y por rango de fechas. Esto te ayuda a encontrar inscripciones específicas rápidamente.",
      imagen: "inscripciones-filtros",
      nota: "Captura: Panel de filtros lateral con búsqueda y estado.",
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
