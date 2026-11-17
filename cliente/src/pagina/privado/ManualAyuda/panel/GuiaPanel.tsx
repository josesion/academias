import { Fragment, useContext, useState } from "react";
import { GuiaSeccion } from "../GuiaSeccion";
import { RutasProtegidasContext } from "../../../../contexto/protectRutas";

/**
 * Guía paso a paso: Panel Principal.
 *
 * Explica las secciones del dashboard principal y cómo interpretar las métricas.
 */

export const GuiaPanelPage = () => {
  const { rol } = useContext(RutasProtegidasContext);
  const esIntermedio = rol?.tipo === "intermedio";

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
      descripcion: (
        <Fragment>
          <p>
            En el encabezado del panel encontrarás botones que te permiten actuar sin salir de la página principal.
            Presioná "Asistencia rápida" para abrir un modal con varias opciones:
          </p>
          <SubSeccionExpandible
            titulo="Registrar un alumno individual"
            icono="👤"
            imagen="panel-asistencia-modo-alumno"
            nota="Captura: Modal de asistencia rápida en modo alumno, buscando por nombre o DNI."
          >
            <p>
              En la pestaña <strong>"Alumno"</strong>, buscá al alumno por nombre o DNI, seleccioná la clase del día y presioná <strong>"Registrar asistencia"</strong>.
            </p>
            <p>
              Ideal para registrar la presencia de un solo alumno de forma rápida.
            </p>
          </SubSeccionExpandible>
          <SubSeccionExpandible
            titulo="Registrar asistencia grupal con plantilla"
            icono="📋"
            imagen="panel-asistencia-modo-plantilla"
            nota="Captura: Modal de asistencia rápida en modo plantilla, con la lista de alumnos y checkboxes."
          >
            <p>
              En la pestaña <strong>"Plantilla"</strong>, seleccioná una plantilla predefinida (por ejemplo, "Grupo lunes Salsa") y la clase del día.
            </p>
            <p>
              Se mostrará una tabla con todos los alumnos del grupo; marcá con un checkbox a los que asistieron y presioná <strong>"Registrar grupo"</strong>.
            </p>
            <p>
              Ideal para tomar asistencia de varios alumnos a la vez en segundos.
            </p>
          </SubSeccionExpandible>
          <SubSeccionExpandible
            titulo="Crear una nueva plantilla"
            icono="➕"
            imagen="panel-asistencia-crear-plantilla"
            nota="Captura: Pestaña 'Plantillas' del modal, mostrando el formulario para crear una nueva plantilla con nombre y búsqueda de alumnos."
          >
            <p>
              Ve a la pestaña <strong>"Plantillas"</strong> del mismo modal de asistencia rápida.
            </p>
            <p>
              Ponéle un nombre al grupo (por ejemplo, "Martes Tango Principiante"), buscá y agregá los alumnos que pertenecen a ese grupo, y confirmá.
            </p>
            <p>
              Después podés usar esa plantilla cada vez que necesites tomar asistencia grupal sin tener que buscar alumno por alumno.
            </p>
          </SubSeccionExpandible>
          {esIntermedio && (
            <div className="guia-desc-columna" style={{ marginTop: "0.75rem" }}>
              <p className="guia-desc-columna-titulo">
                📝 Inscribir
              </p>
              <p>
                Encontrarás el botón "Inscribir" para inscribir un alumno rápidamente sin salir del panel.
              </p>
              <p>
                Funciona igual que la inscripción normal: seleccionás el alumno, el plan de pago y el método de pago.
              </p>
              <p className="guia-desc-nota">
                💡 Requiere que la caja esté abierta. Si la caja está cerrada, no podrás usar este botón.
              </p>
            </div>
          )}
        </Fragment>
      ),
      imagen: "panel-botones-accion",
      nota: esIntermedio
        ? "Captura: Botones 'Asistencia rápida' y 'Inscribir' en el encabezado del panel."
        : "Captura: Botón 'Asistencia rápida' en el encabezado del panel.",
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
        "Si tu suscripción del sistema está por vencer (7 días o menos), aparecerá una alerta flotante recordándote renovar. No la ignores para no perder acceso al sistema.",
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

/**
 * Sub-sección expandible dentro de un paso del manual.
 *
 * Permite colapsar y expandir contenido detallado con imagen opcional.
 */
function SubSeccionExpandible({
  titulo,
  icono,
  imagen,
  nota,
  children,
}: {
  titulo: string;
  icono: string;
  imagen?: string;
  nota?: string;
  children: React.ReactNode;
}) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="guia-subseccion">
      <button
        className="guia-subseccion-header"
        onClick={() => setExpandido(!expandido)}
        aria-expanded={expandido}
      >
        <span className="guia-subseccion-icono">{icono}</span>
        <span className="guia-subseccion-titulo">{titulo}</span>
        <span className={`guia-subseccion-flecha ${expandido ? "abierto" : ""}`}>▼</span>
      </button>
      {expandido && (
        <div className="guia-subseccion-contenido">
          {children}
          {imagen && (
            <div className="guia-subseccion-imagen-wrapper">
              <img
                src={`/imagenesayuda/panel/${imagen}.png`}
                alt={titulo}
                className="guia-seccion-paso-imagen"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = "none";
                  const placeholder = img.nextElementSibling;
                  if (placeholder) (placeholder as HTMLElement).style.display = "flex";
                }}
              />
              <div
                className="guia-seccion-paso-imagen-placeholder"
                style={{ display: "none" }}
              >
                <span className="guia-seccion-paso-imagen-placeholder-icono">🖼️</span>
                <span className="guia-seccion-paso-imagen-placeholder-texto">{imagen}.png</span>
              </div>
              {nota && <p className="guia-seccion-paso-nota">{nota}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
