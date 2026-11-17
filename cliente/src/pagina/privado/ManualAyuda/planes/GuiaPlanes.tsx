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
      imagen: "1",
      nota: "💡 Consejo: Creá al menos un plan antes de comenzar a inscribir alumnos. Un plan bien definido incluye un nombre claro, un precio competitivo y una cantidad de clases que se ajuste a la demanda de tu academia.",
    },
    {
      numero: 2,
      titulo: "Crear un nuevo plan",
      descripcion:
        'Presiona el botón "Agregar" o "+" para abrir el formulario modal. Completa los campos: nombre del plan, precio, cantidad de clases incluidas, duración en meses, etc. Luego confirma para guardar.',
      imagen: "2",
      nota: "💡 Consejo: Definí planes con diferentes duraciones y cantidades de clases para ofrecer opciones a distintos tipos de alumnos. Por ejemplo, un plan mensual con 8 clases y otro trimestral con 24 clases.",
    },
    {
      numero: 3,
      titulo: "Modificar un plan existente",
      descripcion:
        "En el listado, haz clic en el botón de editar del plan que deseas modificar. Se abrirá el formulario con los datos actuales. Nota: El ID del plan es de solo lectura y no se puede modificar.",
      imagen: "3",
      nota: "⚠️ Importante: Si modificás el precio de un plan, solo afecta a las nuevas inscripciones — las inscripciones ya realizadas mantienen el precio y condiciones del plan al momento de inscribirse.",
    },
    {
      numero: 4,
      titulo: "Dar de alta o dar de baja un plan",
      descripcion:
        "Puedes dar de alta un plan nuevo presionando el botón 'Agregar' o '+' para abrir el formulario modal. También puedes dar de baja un plan existente haciendo clic en el botón de eliminar; se abrirá un modal de confirmación. Confirmar la baja no borra el plan del sistema, solo lo marca como inactivo.",
      imagen: "4",
      nota: "⚠️ Importante: Dar de baja un plan no afecta a los alumnos ya inscriptos con ese plan — sus inscripciones siguen vigentes. Solo deja de aparecer como opción al crear nuevas inscripciones.",
    },
    {
      numero: 5,
      titulo: "Usar los planes en las inscripciones",
      descripcion:
        "Los planes que creas aquí estarán disponibles al inscribir un alumno. Ve a 'Diario' → 'Inscripciones' y al crear una nueva inscripción verás los planes en el select correspondiente.",
      imagen: "5",
      nota: "💡 Consejo: Si necesitás cambiar un plan que ya usás, es mejor modificarlo en lugar de darlo de baja y crear uno nuevo. Así mantenés el historial de inscripciones organizado.",
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
