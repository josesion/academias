import { GuiaSeccion } from "../GuiaSeccion";

/**
 * Guía paso a paso: Panel Principal.
 *
 * Explica las secciones del dashboard principal y cómo interpretar las métricas.
 */
export const GuiaPanelPage = () => {
  const pasos = [
    {
      numero: 1,
      titulo: "Conocer el panel principal",
      descripcion:
        "Al ingresar al sistema, verás el panel principal con un saludo personalizado que incluye tu nombre, el nombre de tu escuela y la fecha actual. Este es tu centro de control.",
      imagen: "panel-vista-general",
      nota: "Captura: Panel principal completo con todas las secciones visibles.",
    },
    {
      numero: 2,
      titulo: "Revisar las métricas superiores",
      descripcion:
        "En la parte superior verás tarjetas con métricas clave: Alumnos (con planes activos), Alumnos Nuevos (inscripciones del mes), Próximos vencimientos (que vencen en 7 días), Vencidos (este mes) y Total caja (si tienes plan Intermedio).",
      imagen: "panel-metricas",
      nota: "Captura: Tarjetas de métricas superiores del dashboard.",
    },
    {
      numero: 3,
      titulo: "Usar los botones de acción rápida",
      descripcion:
        'En el encabezado encontrarás el botón "Asistencia rápida" para tomar asistencia sin salir del panel. Si tienes el plan Intermedio, verás además el botón "Inscribir" para inscribir un alumno rápidamente (requiere caja abierta).',
      imagen: "panel-botones-accion",
      nota: "Captura: Botones 'Asistencia rápida' y 'Inscribir' en el encabezado.",
    },
    {
      numero: 4,
      titulo: "Consultar inscripciones recientes",
      descripcion:
        "El listado de inscripciones muestra las más recientes con indicadores de color: 🔴 Rojo (7 días o menos para vencer), 🟡 Amarillo (14 días o menos), 🟢 Verde (más de 14 días). Puedes filtrar por 'Todas', 'Por vencer' o 'Últimas'.",
      imagen: "panel-inscripciones",
      nota: "Captura: Listado de inscripciones con los filtros e indicadores de color.",
    },
    {
      numero: 5,
      titulo: "Ver clases y asistencia del día",
      descripcion:
        "La sección de clases muestra los horarios del día con el estado de cada clase (en curso / sin curso) y las asistencias registradas hasta el momento.",
      imagen: "panel-clases-dia",
      nota: "Captura: Sección de clases del día con estados y asistencias.",
    },
    {
      numero: 6,
      titulo: "Revisar el historial de movimientos",
      descripcion:
        "En la parte inferior verás un carrusel horizontal con el historial reciente de movimientos financieros agrupados por día. Desliza horizontalmente para ver más días.",
      imagen: "panel-historial",
      nota: "Captura: Carrusel horizontal del historial de movimientos.",
    },
    {
      numero: 7,
      titulo: "Atender alertas de vencimiento",
      descripcion:
        "Si tu suscripción del sistema está por vencer (≤7 días), aparecerá una alerta flotante recordándote renovar. No la ignores para no perder acceso al sistema.",
      imagen: "panel-alerta-vencimiento",
      nota: "Captura: Alerta flotante de vencimiento de suscripción.",
    },
  ];

  return (
    <GuiaSeccion
      titulo="Panel Principal"
      subtitulo="Conoce las secciones y métricas del dashboard principal."
      carpetaImagenes="panel"
      pasos={pasos}
    />
  );
};
