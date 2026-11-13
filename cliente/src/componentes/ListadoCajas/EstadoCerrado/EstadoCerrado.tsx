import { LockKeyhole, WalletCards } from "lucide-react";

import "./estadocerrado.css";

export const EstadoCajaCerrada = () => {
  return (
    <section className="estado_caja_cerrada">
      {/* =====================================================
                          ICONO
      ===================================================== */}

      <div className="caja_cerrada_visual">
        <div className="caja_cerrada_anillo"></div>

        <div className="caja_cerrada_icono">
          <WalletCards size={26} />
          <div className="caja_cerrada_candado">
            <LockKeyhole size={13} />
          </div>
        </div>
      </div>

      {/* =====================================================
                         INFORMACIÓN
      ===================================================== */}

      <div className="caja_cerrada_contenido">
        <div className="caja_cerrada_encabezado">
          <span className="caja_cerrada_label">Estado de caja</span>

          <span className="caja_cerrada_badge">
            <span></span>
            CERRADA
          </span>
        </div>

        <h2>No hay una caja abierta</h2>

        <p>
          La caja se encuentra cerrada actualmente. Los movimientos permanecerán
          disponibles en el historial.
        </p>
      </div>

      {/* =====================================================
                       ESTADO VISUAL
      ===================================================== */}

      <div className="caja_cerrada_linea">
        <span></span>
      </div>
    </section>
  );
};
