import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";
import { Boton } from "../../generales/Boton/Boton";
import { type SuscripcionEscuelaDto } from "../../../servicio/suspcripciones.fetch";
import "./listadosuscripciones.css";

interface SuscripcionItemProps {
  suscripcion: SuscripcionEscuelaDto;
  /** Recibe la fila entera: es la que cachea `abrirFormularioAnular` */
  onEstado: (suscripcion: SuscripcionEscuelaDto) => void;
}

const claseEstado = (estado: string) => {
  const e = estado.toLowerCase();
  if (e === "activa" || e === "activo") return "suscripcion_estado--activa";
  if (e === "vencida" || e === "vencido") return "suscripcion_estado--vencida";
  return "suscripcion_estado--otro";
};

export const SuscripcionItem = ({
  suscripcion,
  onEstado,
}: SuscripcionItemProps) => {
  return (
    <article className="suscripcion_row">
      <div className="suscripcion_principal">
        <h3 className="suscripcion_escuela">{suscripcion.razon_social}</h3>
        <p className="suscripcion_plan_desc">{suscripcion.descripcion_plan}</p>
      </div>

      <div className="suscripcion_dato">
        <span className="suscripcion_label">Plan</span>
        <span className="suscripcion_plan_tipo">{suscripcion.tipo_plan}</span>
      </div>

      <div className="suscripcion_dato">
        <span className="suscripcion_label">Inscripción</span>
        <span className="suscripcion_valor">
          {suscripcion.fecha_inscripcion}
        </span>
      </div>

      <div className="suscripcion_dato">
        <span className="suscripcion_label">Vencimiento</span>
        <span className="suscripcion_valor">
          {suscripcion.fecha_vencimiento}
        </span>
      </div>

      <span
        className={`suscripcion_estado ${claseEstado(suscripcion.estado_suscripcion)}`}
      >
        {suscripcion.estado_suscripcion}
      </span>
      <div className="botonera_suscrip">
        <Boton
          clase="editar"
          logo="Edit"
          texto="Estado Suspcripcion"
          type="button"
          onClick={() => onEstado(suscripcion)}
        />
      </div>
    </article>
  );
};

interface ListadoSuscripcionesProps {
  suscripciones: SuscripcionEscuelaDto[];
  carga: boolean;
  onEstado: (suscripcion: SuscripcionEscuelaDto) => void;
}

export const ListadoSuscripciones = ({
  suscripciones,
  carga,
  onEstado,
}: ListadoSuscripcionesProps) => {
  return (
    <section className="listado_suscripciones">
      <h2 className="listado_suscripciones_titulo">Suscripciones</h2>

      {carga ? (
        <SpinnerTarjeta />
      ) : suscripciones.length === 0 ? (
        <p className="listado_suscripciones_vacio">
          No hay suscripciones para mostrar.
        </p>
      ) : (
        <div className="listado_suscripciones_lista">
          {suscripciones.map((s) => (
            <SuscripcionItem
              key={s.id_suscripcion}
              suscripcion={s}
              onEstado={onEstado}
            />
          ))}
        </div>
      )}
    </section>
  );
};
