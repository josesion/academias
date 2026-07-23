import "./historial.metreicas.css";
import type { ResultHistorial } from "../../servicio/historial.fetch";

interface PropsMetricasHistorial {
  historial: ResultHistorial[] | null;
}

const ESTILO_ACCION: Record<
  ResultHistorial["accion"],
  { color: "verde" | "rojo" | "azul" | "violeta" | "gris"; etiqueta: string }
> = {
  CREAR: { color: "verde", etiqueta: "Creó" },
  MODIFICAR: { color: "azul", etiqueta: "Modificó" },
  ELIMINAR: { color: "rojo", etiqueta: "Eliminó" },
  RESTAURAR: { color: "violeta", etiqueta: "Restauró" },
  ABRIR: { color: "verde", etiqueta: "Abrió" },
  CERRAR: { color: "rojo", etiqueta: "Cerró" },
  INGRESO: { color: "verde", etiqueta: "Ingreso" },
  EGRESO: { color: "rojo", etiqueta: "Egreso" },
  ANULACION: { color: "rojo", etiqueta: "Anulacion" },
  LOGIN: { color: "azul", etiqueta: "Inició sesión" },
  LOGOUT: { color: "gris", etiqueta: "Cerró sesión" },
};

const capitalizarModulo = (modulo: string) =>
  modulo.charAt(0) + modulo.slice(1).toLowerCase();

const formatearHora = (fecha: Date) =>
  new Date(fecha).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

const formatearFecha = (fecha: Date) =>
  new Date(fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

// Agrupa el historial en bloques por día, para poner un separador
// de fecha cada vez que cambia el día dentro de la línea de tiempo.
const agruparPorDia = (historial: ResultHistorial[]) => {
  const grupos: { fecha: string; items: ResultHistorial[] }[] = [];

  historial.forEach((item) => {
    const claveFecha = formatearFecha(item.fecha);
    const ultimoGrupo = grupos[grupos.length - 1];

    if (ultimoGrupo && ultimoGrupo.fecha === claveFecha) {
      ultimoGrupo.items.push(item);
    } else {
      grupos.push({ fecha: claveFecha, items: [item] });
    }
  });

  return grupos;
};

export const MetricasHistorial = ({ historial }: PropsMetricasHistorial) => {
  if (!historial || historial.length === 0) {
    return (
      <div className="metrica_historial_contenedor">
        <div className="historial_vacio">
          <p>Aún no hay actividad registrada.</p>
        </div>
      </div>
    );
  }

  const grupos = agruparPorDia(historial);

  return (
    <div className="metrica_historial_contenedor">
      {grupos.map((grupo) => (
        <div className="historial_grupo_dia" key={grupo.fecha}>
          <div className="historial_separador_dia">
            <span>{grupo.fecha}</span>
          </div>

          <ol className="historial_linea_tiempo">
            {grupo.items.map((item) => {
              const estilo = ESTILO_ACCION[item.accion];

              return (
                <li className="historial_item" key={item.id_historial}>
                  <div className={`historial_punto punto_${estilo.color}`} />

                  <div className="historial_tarjeta">
                    <div className="historial_tarjeta_encabezado">
                      <span className={`historial_pill pill_${estilo.color}`}>
                        {estilo.etiqueta}
                      </span>
                      <span className="historial_modulo">
                        {capitalizarModulo(item.modulo)}
                      </span>
                      <time className="historial_hora">
                        {formatearHora(item.fecha)}
                      </time>
                    </div>

                    <p className="historial_descripcion">{item.descripcion}</p>

                    <p className="historial_autor">
                      {item.nombre} {item.apellido}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </div>
  );
};
