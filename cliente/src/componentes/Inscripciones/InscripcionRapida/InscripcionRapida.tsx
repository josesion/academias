/**
 * Modal de inscripción rápida desde el panel principal.
 *
 * Abre el formulario de inscripción (`InscripcionForm`) sin navegar a otra
 * página. Al inscribir con éxito o cancelar, cierra el modal y refresca las
 * métricas del panel principal.
 *
 * Diferencia por rol:
 * - **Rol "basico"**: ve el formulario sin método de pago.
 * - **Rol "intermedio"**: ve el formulario completo con método de pago y notas.
 */

import { useModalAccesible } from "../../../hooks/useModalAccesible";
import { useInscripcionRapida } from "../../../hooks/Inscripciones/useInscripcionRapida";
import { InscripcionForm } from "../FormInscripcion/Inscripcion";
import { Boton } from "../../generales/Boton/Boton";

import "./InscripcionRapida.css";

interface Props {
  /** Si el modal está abierto. */
  abierto: boolean;
  /** Se llama para cerrar el modal. */
  onCerrar: () => void;
  /** Se llama después de una inscripción exitosa para refrescar métricas. */
  onInscripcionExitosa?: () => void;
}

export const InscripcionRapida = ({
  abierto,
  onCerrar,
  onInscripcionExitosa,
}: Props) => {
  const { refDialog } = useModalAccesible({ abierto, onCerrar });

  const {
    state,
    handleCachearPlan,
    handleCachearAlumno,
    handleCachearMetodoPago,
    handleTextAreaNotas,
    handleInscribir,
    handleCancelar,
  } = useInscripcionRapida({ onCerrar, onInscripcionExitosa });

  if (!abierto) return null;

  return (
    <div className="modal-overlay-finanzas" role="presentation">
      <div
        ref={refDialog}
        className="modal-contenido-finanzas inscripcion_rapida_modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inscripcion-rapida-titulo"
      >
        <header className="modal_finanzas_header">
          <div className="libro_diario_titulo">
            <div className="libro_diario_titulo_texto">
              <h2 id="inscripcion-rapida-titulo">Inscribir alumno</h2>
              <span>Contratación rápida de plan</span>
            </div>
          </div>
          <Boton
            clase="editar"
            logo="Cancel"
            texto="Cerrar"
            onClick={handleCancelar}
          />
        </header>

        <InscripcionForm
          errorGenerico={state.errorGenerico}
          plan={state.plan}
          alumno={state.alumno}
          notas={state.notas}
          enviando={state.enviando}
          listadoPlan={state.listadoPlan}
          listadoAlumno={state.listadoAlumno}
          listaMetodo={state.listadoMetodoPago}
          metodoPagoSeleccionado={state.cuenta}
          handleCachearPlan={handleCachearPlan}
          handleCachearAlumno={handleCachearAlumno}
          handleCachearMetodoPago={handleCachearMetodoPago}
          handleTextAreaNotas={handleTextAreaNotas}
          inscribir={handleInscribir}
          cancelar={handleCancelar}
        />
      </div>
    </div>
  );
};
