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
      imagen: "alumnos-listado",
      nota: "Captura: Listado de alumnos con barra de búsqueda y filtros.",
    },
    {
      numero: 2,
      titulo: "Dar de alta un nuevo alumno",
      descripcion:
        'Presiona el botón "Agregar" o "+" para abrir el formulario modal. Completa los campos: DNI, nombre, apellido, teléfono, email, dirección, estado civil, etc. Luego confirma para guardar.',
      imagen: "alumnos-formulario-alta",
      nota: "Captura: Modal de alta de alumno con todos los campos visibles.",
    },
    {
      numero: 3,
      titulo: "Modificar datos de un alumno",
      descripcion:
        "En el listado, haz clic en el botón de editar del alumno que deseas modificar. Se abrirá el formulario con los datos actuales. Nota: DNI y email son de solo lectura y no se pueden modificar.",
      imagen: "alumnos-formulario-modificar",
      nota: "Captura: Modal de modificación con DNI y email deshabilitados.",
    },
    {
      numero: 4,
      titulo: "Activar o desactivar un alumno",
      descripcion:
        "En el listado, usa el botón de cambiar estado (activar/desactivar) para cambiar el estado del alumno sin eliminarlo. Un alumno desactivado no aparecerá en las búsquedas de inscripción.",
      imagen: "alumnos-cambiar-estado",
      nota: "Captura: Botón de activar/desactivar en el listado.",
    },
    {
      numero: 5,
      titulo: "Gestionar profesores",
      descripcion:
        'El proceso para profesores es idéntico al de alumnos. Ve a "Mi Escuela" → "Profesores" y repite los mismos pasos: alta, modificación, eliminación y cambio de estado.',
      imagen: "profesores-listado",
      nota: "Captura: Listado de profesores con las mismas opciones que alumnos.",
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
