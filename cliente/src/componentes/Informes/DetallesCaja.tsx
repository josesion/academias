import "./informes.css";

import { Boton } from "../Boton/Boton";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Calendar,
  User,
  Landmark,
  Wallet,
  Info,
  Hash,
  UserRound,
} from "lucide-react";

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
}: any) => {
  const esIngreso = tipo === "ingreso";

  return (
    <div className={`recibo_ticket ${tipo.toLowerCase()}`}>
      <header className="recibo_header">
        <div className="recibo_marca">
          <Hash size={14} />
          <span>MOV {id_movimiento}</span>
        </div>

        <div
          className={`recibo_stamp ${esIngreso ? "stamp_verde" : "stamp_rojo"}`}
        >
          {tipo.toUpperCase()}
        </div>
      </header>

      <div className="recibo_total">
        <span className="recibo_total_label">
          Total {esIngreso ? "recibido" : "pagado"}
        </span>

        <div
          className={`recibo_monto ${esIngreso ? "monto_verde" : "monto_rojo"}`}
        >
          {esIngreso ? <ArrowDownLeft size={26} /> : <ArrowUpRight size={26} />}
          <span>
            $
            {Number(monto).toLocaleString("es-AR", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      <div className="recibo_perforado" />

      <div className="recibo_body">
        <div className="recibo_fila">
          <span className="recibo_fila_label">
            <Landmark size={14} /> Canal
          </span>
          <span className="recibo_fila_valor">
            {metodo === "virtual" ? "Virtual" : "Físico"}
          </span>
        </div>

        <div className="recibo_fila">
          <span className="recibo_fila_label">
            <Wallet size={14} /> Destino
          </span>
          <span className="recibo_fila_valor">{metodo_pago.toUpperCase()}</span>
        </div>

        {nombre_alumno_vinculado && (
          <div className="recibo_fila">
            <span className="recibo_fila_label">
              <UserRound size={14} /> Alumno
            </span>
            <span className="recibo_fila_valor">
              {nombre_alumno_vinculado.toUpperCase()}
            </span>
          </div>
        )}

        <div className="recibo_linea_punteada" />

        <div className="recibo_meta">
          <span>
            <User size={12} /> {usuario}
          </span>
          <span>
            <Calendar size={12} /> {fecha}
          </span>
          <span>
            <Clock size={12} /> {hora}
          </span>
        </div>

        {observaciones && (
          <div className="recibo_obs">
            <span className="recibo_obs_label">
              <Info size={12} /> Nota
            </span>
            <p>"{observaciones}"</p>
          </div>
        )}
      </div>

      <div className="recibo_barcode" aria-hidden="true">
        <div className="recibo_barcode_bars" />
        <span className="recibo_barcode_id">{id_movimiento}</span>
      </div>

      <div className="recibo_footer">
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
