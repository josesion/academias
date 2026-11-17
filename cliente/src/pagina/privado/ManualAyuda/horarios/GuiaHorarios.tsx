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
      imagen: "horarios-calendario-vacio",
      nota: "Captura: Página de horarios con el calendario semanal y las tarjetas de horarios existentes.",
    },
    {
      numero: 2,
      titulo: "Abrir el formulario de nuevo horario",
      descripcion:
        'Para crear un horario, haz clic en una celda vacía del calendario (día y hora donde no haya clase). Se abrirá un modal con los campos del formulario: profesor, nivel, tipo, día y horas.',
      imagen: "horarios-clic-celda-vacia",
      nota: "Captura: Modal de nuevo horario abierto con los campos vacíos.",
    },
    {
      numero: 3,
      titulo: "Seleccionar profesor, nivel y tipo",
      descripcion:
        "Dentro del modal, selecciona el profesor, el nivel y el tipo de clase usando los tres selects. El día y las horas se rellenan automáticamente según la celda donde hiciste clic.",
      imagen: "horarios-selects-modal",
      nota: "Captura: Los tres selects (profesor, nivel, tipo) dentro del modal con opciones seleccionadas.",
    },
    {
      numero: 4,
      titulo: "Agregar el horario",
      descripcion:
        'Una vez completados los campos, presiona el botón "Agregar Horario" para guardar. El nuevo horario aparecerá como una tarjeta de color en la celda correspondiente del calendario.',
      imagen: "horarios-agregar-boton",
      nota: "Captura: Botón 'Agregar Horario' y el nuevo horario reflejado en el calendario.",
    },
    {
      numero: 5,
      titulo: "Modificar un horario existente",
      descripcion:
        "Haz clic en una tarjeta de horario existente en el calendario para abrir el modal de modificación. Podrás cambiar el profesor, nivel, tipo, día o las horas. Presiona 'Modificar Horario' para guardar los cambios.",
      imagen: "horarios-modificar-horario",
      nota: "Captura: Modal de modificación con los datos del horario pre-cargados.",
    },
    {
      numero: 6,
      titulo: "Eliminar un horario",
      descripcion:
        "Al abrir un horario existente en modo modificación, verás el botón 'Eliminar Horario'. Presiónalo para quitar ese horario del calendario. Nota: Eliminar un horario no afecta las asistencias ya registradas.",
      imagen: "horarios-eliminar-horario",
      nota: "Captura: Botón 'Eliminar Horario' dentro del modal de modificación.",
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
