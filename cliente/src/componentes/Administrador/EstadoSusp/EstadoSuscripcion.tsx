import "./estadosuscripcion.css";

import { Boton } from "../../generales/Boton/Boton";
import { CompoError } from "../../generales/Error/Error";

/* ==========================================================================
   MODAL DE ANULACIÓN DE SUSCRIPCIÓN (bloque 2. CAMBIO DE ESTADO)

   Presentacional: recibe todo por props, no toca el estado.
   Muestra qué se va a anular (academia — plan) y ofrece confirmar o cerrar.
   ========================================================================== */

interface PropsEstadoSuscripcion {
  /** Razón social de la academia de la suscripción a anular */
  razonSocial: string;
  /** Descripción del plan de esa suscripción */
  descripcionPlan: string;
  /** Carga del pedido: deja el botón Anular en "Procesando..." */
  carga: boolean;
  /** Aviso de `error.estado`; null mientras no haya error */
  error: string | null;
  /** Confirma la anulación (PUT /api/anular_susp/:id) */
  anularSuscripcion: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
  /** Cierra el modal sin anular nada */
  onCerrar: () => void;
}

/**
 * Diálogo de confirmación de anulación de una suscripción.
 *
 * @param props - Datos de la fila seleccionada y handlers del hook.
 * @returns JSX.Element con la leyenda, los dos botones y el aviso de error.
 */
export const EstadoSuscripcion = (props: PropsEstadoSuscripcion) => {
  const { razonSocial, descripcionPlan, carga, error, anularSuscripcion, onCerrar } = props;

  return (
    <div className="estado-susp">
      <header className="estado-susp__encabezado">
        <h2 className="estado-susp__titulo" id="estado_susp_titulo">
          Anular suscripción
        </h2>

        <p className="estado-susp__texto">
          <strong className="estado-susp__destacado">
            {razonSocial} — {descripcionPlan}.
          </strong>{" "}
          ¿Estás seguro de anular esta suscripción?
        </p>
      </header>

      <div className="estado-susp__acciones">
        <Boton
          clase="eliminar"
          logo="Delete"
          type="button"
          texto="Anular"
          disable={carga}
          onClick={anularSuscripcion}
        />

        <Boton
          clase="cancelar"
          logo="Cancel"
          type="button"
          texto="Cerrar"
          onClick={onCerrar}
        />
      </div>

      {error && <CompoError mensaje={error} />}
    </div>
  );
};
