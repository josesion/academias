import "./informes.css";

import { Boton } from "../Boton/Boton";

import {
  FcDownLeft,
  FcUpRight,
  FcClock,
  FcCalendar,
  FcManager,
  FcCurrencyExchange,
  FcInfo,
  FcElectricity,
  FcContacts, // Nuevo icono para el alumno
} from "react-icons/fc";

export const InformeDetalleCaja = ({
  id_movimiento,
  tipo,
  monto,
  usuario,
  fecha,
  hora,
  metodo_pago,
  observaciones,
  metodo,
  nombre_alumno_vinculado,
  onCerrarModal,
  // Recibimos la nueva prop
}: any) => {
  const esIngreso = tipo === "ingreso";

  return (
    <div className={`cyber_ticket ${tipo.toLowerCase()}`}>
      <div className="scanline"></div>

      <header className="ticket_top">
        <div className="ticket_id">
          <FcElectricity />
          <span className="label">TX_ID: {id_movimiento}</span>
        </div>

        <div
          className={`monto_principal ${esIngreso ? "glitch_green" : "glitch_red"}`}
        >
          {esIngreso ? <FcDownLeft size={40} /> : <FcUpRight size={40} />}
          <span className="currency">$</span>
          {Number(monto).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
        </div>
      </header>

      <div className="glass_body">
        <section className="main_info">
          <div className="data_group">
            <label>FLUJO</label>
            <div className="tipo_badge">{tipo.toUpperCase()}</div>
          </div>
          <div className="data_group">
            <label>CANAL</label>
            <div className="metodo_badge">
              {metodo === "virtual" ? "🌐 VIRTUAL" : "💵 FÍSICO"}
            </div>
          </div>
        </section>

        {/* --- NUEVA SECCIÓN: NOMBRE DEL ALUMNO --- */}
        {nombre_alumno_vinculado && (
          <div className="vinculo_alumno_box">
            <div className="terminal_prefix">
              <FcContacts /> <span>Inscripcion de :</span>
            </div>
            <div className="alumno_nombre_text">
              {nombre_alumno_vinculado.toUpperCase()}
            </div>
          </div>
        )}

        <div className="destino_terminal">
          <div className="terminal_prefix">
            <FcCurrencyExchange /> <span>DESTINO_CUENTA:</span>
          </div>
          <div className="terminal_text">{metodo_pago.toUpperCase()}</div>
        </div>

        <footer className="metadata_grid">
          <div className="meta_item">
            <FcManager /> <strong>USR:</strong> <span>{usuario}</span>
          </div>
          <div className="meta_item">
            <FcCalendar /> <strong>FECHA:</strong> <span>{fecha}</span>
          </div>
          <div className="meta_item">
            <FcClock /> <strong>HORA:</strong> <span>{hora}</span>
          </div>
        </footer>

        {observaciones && (
          <div className="obs_box">
            <div className="obs_header">
              <FcInfo /> OBSERVACIONES_LOG
            </div>
            <p>"{observaciones}"</p>
          </div>
        )}
      </div>

      <div className="boton_cerrar">
        <Boton
          clase="cancelar"
          focus={true}
          logo="Cancel"
          texto="Cerrar resumen"
          onClick={onCerrarModal}
        />
      </div>
    </div>
  );
};
