import { GuiaSeccion } from "../GuiaSeccion";

/**
 * Guía paso a paso: Alumnos y Profesores.
 *
 * Explica cómo dar de alta, modificar y gestionar alumnos y profesores.
 */
export const GuiaAlumnosPage = () => {
  const pasos = [
    {
      numero: 1,
      titulo: "Acceder al listado de alumnos",
      descripcion:
        'Desde el menú lateral, ve a "Mi Escuela" → "Alumnos Inscriptos". Verás el listado completo de todos los alumnos registrados con búsqueda y filtros por estado.',
      imagen: "1",
      nota: "💡 Consejo: Usá la barra de búsqueda para encontrar alumnos por nombre, apellido o DNI. Los filtros de estado te permiten ver solo los alumnos activos o desactivados.",
    },
    {
      numero: 2,
      titulo: "Dar de alta un nuevo alumno",
      descripcion:
        'Presiona el botón "Agregar" o "+" para abrir el formulario modal. Completa los campos: DNI, nombre, apellido, teléfono, email, dirección, estado civil, etc. Luego confirma para guardar.',
      imagen: "2",
      nota: "⚠️ Importante: El DNI y el email deben ser únicos — no podés registrar dos alumnos con el mismo DNI ni con el mismo email. Si el sistema te indica que ya existe, verificá los datos antes de continuar.",
    },
    {
      numero: 3,
      titulo: "Modificar datos de un alumno",
      descripcion:
        "En el listado, haz clic en el botón de editar del alumno que deseas modificar. Se abrirá el formulario con los datos actuales. Nota: DNI y email son de solo lectura y no se pueden modificar.",
      imagen: "3",
      nota: "⚠️ Importante: El DNI y el email son de solo lectura y no se pueden modificar. Si necesitás cambiar estos datos, contactá al administrador del sistema.",
    },
    {
      numero: 4,
      titulo: "Activar o desactivar un alumno",
      descripcion:
        "En el listado, usa el botón de cambiar estado (activar/desactivar) para cambiar el estado del alumno sin eliminarlo. Un alumno desactivado no aparecerá en las búsquedas de inscripción.",
      imagen: "4",
      nota: "💡 Consejo: Desactivar un alumno no lo elimina del sistema — sus inscripciones y asistencias se mantienen registradas. Usá esta opción cuando un alumno deja la academia temporalmente y podés reactivarlo cuando regrese.",
    },
    {
      numero: 5,
      titulo: "Gestionar profesores",
      descripcion:
        'El proceso para profesores es idéntico al de alumnos. Ve a "Mi Escuela" → "Profesores" y repite los mismos pasos: alta, modificación, eliminación y cambio de estado.',
      imagen: "5",
      nota: "💡 Consejo: Los profesores se gestionan igual que los alumnos, pero además se asignan a los horarios de clase. Asegurate de dar de alta a un profesor antes de crear un horario que lo requiera.",
    },
  ];

  return (
    <GuiaSeccion
      titulo="Alumnos y Profesores"
      subtitulo="Aprende a dar de alta, modificar y gestionar alumnos y profesores."
      carpetaImagenes="alumnos"
      pasos={pasos}
    />
  );
};
