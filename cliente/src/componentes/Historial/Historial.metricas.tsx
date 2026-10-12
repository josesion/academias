import "./historial.metreicas.css";
import type { ResultHistorial } from "../../servicio/historial.fetch";
import {
  PlusCircle,
  Edit3,
  Trash2,
  RotateCcw,
  Unlock,
  Lock,
  ArrowUpCircle,
  ArrowDownCircle,
  XCircle,
  LogIn,
  LogOut,
  Users,
  Building,
  BookOpen,
  User,
  Settings,
  type LucideIcon,
} from "lucide-react";

const capitalizarModulo = (modulo: string) =>
  modulo.charAt(0) + modulo.slice(1).toLowerCase();

const ICONO_MODULO: Record<string, LucideIcon> = {
  usuario: Users,
  escuela: Building,
  alumno: Users,
  profesor: User,
  plan: BookOpen,
  caja: Users,
  inscripcion: BookOpen,
  horario: BookOpen,
  configuracion: Settings,
  default: Settings,
};

const ESTILO_ACCION: Record<
  ResultHistorial["accion"],
  {
    color: "verde" | "rojo" | "azul" | "violeta" | "gris";
    etiqueta: string;
    icono: LucideIcon;
  }
> = {
  CREAR: { color: "verde", etiqueta: "Creó", icono: PlusCircle },
  MODIFICAR: { color: "azul", etiqueta: "Modificó", icono: Edit3 },
  ELIMINAR: { color: "rojo", etiqueta: "Eliminó", icono: Trash2 },
  RESTAURAR: { color: "violeta", etiqueta: "Restauró", icono: RotateCcw },
  ABRIR: { color: "verde", etiqueta: "Abrió", icono: Unlock },
  CERRAR: { color: "rojo", etiqueta: "Cerró", icono: Lock },
  INGRESO: { color: "verde", etiqueta: "Ingreso", icono: ArrowUpCircle },
  EGRESO: { color: "rojo", etiqueta: "Egreso", icono: ArrowDownCircle },
  ANULACION: { color: "rojo", etiqueta: "Anulacion", icono: XCircle },
  LOGIN: { color: "azul", etiqueta: "Inició sesión", icono: LogIn },
  LOGOUT: { color: "gris", etiqueta: "Cerró sesión", icono: LogOut },
};

const formatearFechaRelativa = (fecha: Date): string => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const f = new Date(fecha);
  f.setHours(0, 0, 0, 0);
  const diff = Math.round((f.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hoy";
  if (diff === -1) return "Ayer";
  if (diff === 1) return "Mañana";
  return new Date(fecha).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

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

// Agrupa el historial en bloques por dia
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

// Componente para renderizar el icono del modulo dinamico
const IconoModulo = ({ modulo, size }: { modulo: string; size: number }) => {
  const Icono = ICONO_MODULO[modulo] || ICONO_MODULO.default;
  return <Icono size={size} />;
};

interface PropsMetricasHistorial {
  historial: ResultHistorial[] | null;
}

export const MetricasHistorial = ({ historial }: PropsMetricasHistorial) => {
  const items = historial ?? [];

  if (items.length === 0) {
    return (
      <div className="metrica_historial_contenedor" role="status" aria-live="polite" aria-label="Aún no hay actividad registrada">
        <div className="historial_vacio">
          <p>Aún no hay actividad registrada.</p>
        </div>
      </div>
    );
  }

  const grupos = agruparPorDia(items);

  return (
    <div className="metrica_historial_contenedor" role="list" aria-label="Historial de movimientos">
      {grupos.map((grupo) => (
        <div className="historial_grupo_dia" key={grupo.fecha}>
          <div className="historial_separador_dia">
            <span>{formatearFechaRelativa(new Date(grupo.items[0].fecha))}</span>
          </div>

          <ol className="historial_linea_tiempo">
            {grupo.items.map((item) => {
              const estilo = ESTILO_ACCION[item.accion];
              const IconoComponente = estilo.icono;

              return (
                <li className="historial_item" key={item.id_historial} role="listitem" aria-label={`${estilo.etiqueta} en ${capitalizarModulo(item.modulo)} a las ${formatearHora(item.fecha)}`}>
                  <div className={`historial_punto punto_${estilo.color}`} aria-hidden="true">
                    <IconoComponente
                      size={12}
                      className="historial_punto_icono"
                    />
                  </div>

                  <div className="historial_tarjeta">
                    <div className="historial_tarjeta_encabezado">
                      <span className={`historial_pill pill_${estilo.color}`}>
                        <IconoComponente size={13} aria-hidden="true" />
                        {estilo.etiqueta}
                      </span>
                      <span className="historial_modulo">
                        <IconoModulo modulo={item.modulo} size={12} aria-hidden="true" />
                        {capitalizarModulo(item.modulo)}
                      </span>
                      <time className="historial_hora">
                        {formatearHora(item.fecha)}
                      </time>
                    </div>

                    <p className="historial_descripcion">{item.descripcion}</p>

                    <p className="historial_autor">
                      -- {item.nombre} {item.apellido} --
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

