import { GuiaSeccion } from "../GuiaSeccion";

/**
 * Guía paso a paso: Asistencia.
 *
 * Explica cómo registrar asistencia en modo kiosco y consultar el historial.
 */
export const GuiaAsistenciaPage = () => {
  const pasos = [
    {
      numero: 1,
      titulo: "Acceder a la pantalla de asistencia",
      descripcion:
        'Desde el menú lateral, ve a "Diario" → "Asistencia". Verás la pantalla tipo kiosco diseñada para registro rápido, mostrando la clase en curso y la próxima clase con sus horarios.',
      imagen: "asistencia-pantalla-principal",
      nota: "Captura: Pantalla de asistencia kiosco con clase en curso y próxima clase.",
    },
    {
      numero: 2,
      titulo: "Ingresar el DNI del alumno",
      descripcion:
        "Escribe el número de DNI del alumno en el campo de identificación. El sistema buscará automáticamente al alumno en la base de datos.",
      imagen: "asistencia-campo-dni",
      nota: "💡 Consejo: Asegúrate de que el DNI esté correctamente registrado en el padrón de alumnos antes de intentar tomar asistencia. Si el sistema no encuentra al alumno, verificá que el DNI esté dado de alta en 'Mi Escuela' → 'Alumnos Inscriptos'.",
    },
    {
      numero: 3,
      titulo: "Verificar los datos del alumno",
      descripcion:
        "El sistema mostrará automáticamente la fecha de vencimiento de la inscripción y las clases restantes del alumno. Verifica que los datos sean correctos antes de registrar.",
      imagen: "asistencia-datos-alumno",
      nota: "⚠️ Importante: Si el alumno aparece con la inscripción vencida o sin clases restantes, no podrás registrar su asistencia. En ese caso, debés inscribirlo nuevamente antes de continuar.",
    },
    {
      numero: 4,
      titulo: "Registrar la asistencia",
      descripcion:
        'Presiona el botón "Registrar asistencia" para confirmar la presencia del alumno. Verás una animación de éxito que confirma el registro.',
      imagen: "asistencia-boton-registrar",
      nota: "✅ Una vez registrada, la asistencia se descuenta automáticamente de las clases restantes del alumno. Si registraste por error, podés revertirla desde el listado de asistencias.",
    },
    {
      numero: 5,
      titulo: "Consultar el historial de asistencias",
      descripcion:
        'Para ver el historial completo, ve a "Diario" → "Listado de Asistencias". Allí podrás filtrar por fechas, día, hora, profesor, nivel y tipo de clase.',
      imagen: "asistencia-listado",
      nota: "Captura: Listado de asistencias con filtros laterales.",
    },
    {
      numero: 6,
      titulo: "Usar los filtros del listado",
      descripcion:
        "En el listado de asistencias, usa el panel lateral para filtrar por rango de fechas, día de la semana, hora, profesor, nivel y tipo de clase. La tabla agrupa las asistencias por fecha mostrando hora, alumno, profesor, nivel, tipo y estado.",
      imagen: "asistencia-filtros",
      nota: "💡 Consejo: Combiná los filtros para encontrar información específica. Por ejemplo, filtrá por un día y un profesor en particular para ver todas las asistencias de ese profesor en ese día.",
    },
  ];

  return (
    <GuiaSeccion
      titulo="Asistencia"
      subtitulo="Aprende a registrar y consultar la asistencia de clases."
      carpetaImagenes="asistencia"
      pasos={pasos}
    />
  );
};
