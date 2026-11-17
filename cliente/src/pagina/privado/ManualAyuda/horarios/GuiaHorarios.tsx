import { GuiaSeccion } from "../GuiaSeccion";

/**
 * Guía paso a paso: Horarios.
 *
 * Explica cómo configurar los horarios de clase semanales.
 */
export const GuiaHorariosPage = () => {
  const pasos = [
    {
      numero: 1,
      titulo: "Acceder a la gestión de horarios",
      descripcion:
        'Desde el menú lateral, ve a "Mi Escuela" → "Horarios". Verás un calendario semanal que muestra las franjas horarias en filas y los días de la semana en columnas. Los horarios ya configurados aparecen como tarjetas de colores en las celdas.',
      imagen: "1",
      nota: "💡 Consejo: El calendario visual te permite ver de un vistazo cómo está organizado tu semana. Las tarjetas de colores representan cada horario configurado — hacé clic en ellas para ver o modificar los detalles.",
    },
    {
      numero: 2,
      titulo: "Abrir el formulario de nuevo horario",
      descripcion:
        'Para crear un horario, haz clic en una celda vacía del calendario (día y hora donde no haya clase). Se abrirá un modal con los campos del formulario: profesor, nivel, tipo, día y horas.',
      imagen: "2",
      nota: "⚠️ Importante: Antes de crear un horario, asegurate de que ya tengas dados de alta al profesor, el nivel y el tipo de clase en la sección de Ajustes. Si no los tenés, el select aparecerá vacío.",
    },
    {
      numero: 3,
      titulo: "Seleccionar profesor, nivel y tipo",
      descripcion:
        "Dentro del modal, selecciona el profesor, el nivel y el tipo de clase usando los tres selects. El día y las horas se rellenan automáticamente según la celda donde hiciste clic.",
      imagen: "3",
      nota: "💡 Consejo: El día y las horas se rellenan automáticamente según la celda que seleccionaste, pero podés modificarlos si necesitás. Por ejemplo, si querés que un horario sea de 18:00 a 19:30 en lugar de la hora predeterminada.",
    },
    {
      numero: 4,
      titulo: "Agregar el horario",
      descripcion:
        'Una vez completados los campos, presiona el botón "Agregar Horario" para guardar. El nuevo horario aparecerá como una tarjeta de color en la celda correspondiente del calendario.',
      imagen: "4",
      nota: "✅ Una vez agregado, el horario queda disponible para que los alumnos puedan inscribirse en clases de ese día y hora, y para que se pueda registrar asistencia.",
    },
    {
      numero: 5,
      titulo: "Modificar un horario existente",
      descripcion:
        "Haz clic en una tarjeta de horario existente en el calendario para abrir el modal de modificación. Podrás cambiar el profesor, nivel, tipo, día o las horas. Presiona 'Modificar Horario' para guardar los cambios.",
      imagen: "5",
      nota: "⚠️ Importante: Si cambiás el profesor de un horario, las asistencias ya registradas con el profesor anterior se mantienen sin cambios. Solo los nuevos registros usarán al profesor actualizado.",
    },
    {
      numero: 6,
      titulo: "Eliminar un horario",
      descripcion:
        "Al abrir un horario existente en modo modificación, verás el botón 'Eliminar Horario'. Presiónalo para quitar ese horario del calendario. Nota: Eliminar un horario no afecta las asistencias ya registradas.",
      imagen: "6",
      nota: "⚠️ Importante: Eliminar un horario no borra las asistencias ni inscripciones ya registradas. Solo deja de aparecer en el calendario para futuras clases. Si necesitás mantener el historial, podés darlo de baja en lugar de eliminarlo.",
    },
  ];

  return (
    <GuiaSeccion
      titulo="Horarios"
      subtitulo="Aprende a configurar los horarios de clase semanales."
      carpetaImagenes="horarios"
      pasos={pasos}
    />
  );
};
