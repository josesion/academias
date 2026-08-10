import { Boton } from "../../generales/Boton/Boton";
import { EstadoCajaCerrada } from "../EstadoCerrado/EstadoCerrado";

import { Clock3, UserRound, Wallet } from "lucide-react";

import "./estadocaja.css";

interface EstadoCajaData {
  id_caja: number;
  usuario: string;
  fecha_apertura: string;
  hora_apertura: string;
  estado: "abierta" | "cerrada";
  total: number;
  totales: {
    efectivo: number;
    virtual: number;
  };
}

export const EstadoCaja = (props: EstadoCajaData) => {
  return (
    <section className="estado_caja_contenedor">
      {props.estado === "cerrada" ? (
        <EstadoCajaCerrada />
      ) : (
        <div>
          {/* =====================================================
                          ENCABEZADO
      ===================================================== */}

          <div className="estado_caja_header">
            <div className="estado_caja_titulo">
              <div className="estado_caja_icono">
                <Wallet size={20} />
              </div>

              <div>
                <span className="estado_caja_label">Estado de caja</span>

                <h2>Caja actual</h2>
              </div>
            </div>

            <div className="estado_caja_badge">
              <span className="estado_caja_punto"></span>
              Abierta
            </div>
          </div>

          {/* =====================================================
                          INFORMACIÓN
      ===================================================== */}

          <div className="cuerpo_estado">
            <div className="estado_caja_info">
              <div className="estado_caja_dato">
                <UserRound size={17} />

                <div>
                  <span>Cajero</span>
                  <strong>{props.usuario}</strong>
                </div>
              </div>

              <div className="estado_caja_dato">
                <Clock3 size={17} />

                <div>
                  <span>Apertura</span>
                  <strong>
                    {props.fecha_apertura} · {props.hora_apertura} hs
                  </strong>
                </div>
              </div>
            </div>

            {/* =================================================
                         MONTOS
        ================================================= */}

            <div className="cuerpo_estado_montos">
              <div className="estado_caja_monto">
                <span>Efectivo en caja</span>

                <strong>${props.totales.efectivo}</strong>
              </div>

              <div className="estado_caja_monto">
                <span>Virtual</span>

                <strong>${props.totales.virtual}</strong>
              </div>

              <div className="estado_caja_monto total">
                <span>Total actual</span>

                <strong>${props.total}</strong>
              </div>
            </div>

            {/* =================================================
                          ACCIÓN
        ================================================= */}

            <div className="cuerpo_estado_botones">
              <Boton
                logo="List"
                clase="listar"
                texto="Ver Movimientos en Vivo"
                disable={false}
                onClick={() => {
                  console.log("ir a caja");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
