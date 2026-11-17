import { GuiaSeccion } from "../GuiaSeccion";

/**
 * Guía paso a paso: Planes de Pago.
 *
 * Explica cómo crear y gestionar los planes de suscripción que ofrece la academia.
 */
export const GuiaPlanesPage = () => {
  const pasos = [
    {
      numero: 1,
      titulo: "Acceder al listado de planes",
      descripcion:
        'Desde el menú lateral, ve a "Mi Escuela" → "Planes de Pago". Verás el listado completo de todos los planes de suscripción que has creado para tu academia.',
      imagen: "planes-listado",
      nota: "Captura: Listado de planes de pago con búsqueda y filtros.",
    },
    {
      numero: 2,
      titulo: "Crear un nuevo plan",
      descripcion:
        'Presiona el botón "Agregar" o "+" para abrir el formulario modal. Completa los campos: nombre del plan, precio, cantidad de clases incluidas, duración en meses, etc. Luego confirma para guardar.',
      imagen: "planes-formulario-alta",
      nota: "Captura: Modal de alta de plan con todos los campos visibles.",
    },
    {
      numero: 3,
      titulo: "Modificar un plan existente",
      descripcion:
        "En el listado, haz clic en el botón de editar del plan que deseas modificar. Se abrirá el formulario con los datos actuales. Nota: El ID del plan es de solo lectura y no se puede modificar.",
      imagen: "planes-formulario-modificar",
      nota: "Captura: Modal de modificación con ID deshabilitado.",
    },
    {
      numero: 4,
      titulo: "Dar de alta o dar de baja un plan",
      descripcion:
        "Puedes dar de alta un plan nuevo presionando el botón 'Agregar' o '+' para abrir el formulario modal. También puedes dar de baja un plan existente haciendo clic en el botón de eliminar; se abrirá un modal de confirmación. Confirmar la baja no borra el plan del sistema, solo lo marca como inactivo.",
      imagen: "planes-alta-y-baja",
      nota: "Captura: Botón de agregar plan y modal de confirmación de baja.",
    },
    {
      numero: 5,
      titulo: "Usar los planes en las inscripciones",
      descripcion:
        "Los planes que creas aquí estarán disponibles al inscribir un alumno. Ve a 'Diario' → 'Inscripciones' y al crear una nueva inscripción verás los planes en el select correspondiente.",
      imagen: "planes-en-inscripcion",
      nota: "Captura: Select de planes en el formulario de inscripción.",
    },
  ];

  return (
    <GuiaSeccion
      titulo="Planes de Pago"
      subtitulo="Aprende a crear y gestionar los planes de suscripción de tu academia."
      carpetaImagenes="planes"
      pasos={pasos}
    />
  );
};
