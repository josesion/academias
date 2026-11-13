import { useEffect, useRef, useState } from "react";

import { Boton } from "../generales/Boton/Boton";
import { Inputs } from "../generales/Inputs/Inputs";
import { useAmbLogoEscuela } from "../../hookNegocios/abmLogoEscuela";
import "./logoEscuelaPerfil.css";

/* ==========================================================================
   SECCIÓN "LOGO DE MI ESCUELA" — Perfil del usuario

   Va FUERA del <form> del perfil (se monta como hermana de
   <FormularioInfoUsuario>) y todos los botones son `type="button"`: guardar
   el logo nunca dispara el PUT del perfil ni navega (R16/R17).

   Por rol (D1/D14):
   - `usuario`     → edita (input de archivo + botones).
   - `alumno`      → modo lectura (sin input ni botones).
   - `administrador` → no ve la sección (usa el ABM de Escuelas).
   ========================================================================== */

/** Formatos que acepta el servidor (el `accept` solo filtra el diálogo). */
const FORMATOS_LOGO = "image/jpeg,image/png,image/webp";

/** Id del `<h2>`: la sección es única en la página. */
const ID_TITULO = "logo_escuela_titulo";

type RolPerfil = "usuario" | "administrador" | "alumno";

interface PropsLogoEscuelaPerfil {
  /** Rol del usuario logueado: define si edita, solo mira o no ve la sección. */
  rol: RolPerfil;
}

/**
 * Sección "Logo de mi escuela" del perfil.
 *
 * El `administrador` sale sin montar el contenido: así tampoco se dispara el
 * `GET` de la escuela (no tiene escuela propia que mostrar).
 *
 * @param props - `rol` del usuario logueado
 * @returns La sección, o `null` para `administrador`
 */
export const LogoEscuelaPerfil = ({ rol }: PropsLogoEscuelaPerfil) => {
  if (rol === "administrador") return null;

  return <SeccionLogoEscuela rol={rol} />;
};

/**
 * Contenido real de la sección. Vive en un componente aparte para que el
 * `administrador` no monte los hooks (ni la carga inicial) de la sección.
 *
 * @param props - `rol` del usuario logueado (`usuario` o `alumno`)
 */
const SeccionLogoEscuela = ({ rol }: PropsLogoEscuelaPerfil) => {
  const {
    state,
    elegirArchivo,
    guardar,
    confirmarQuitar,
    cancelarQuitar,
    quitar,
  } = useAmbLogoEscuela();

  /** URL que falló al cargar (cubre la `urlImagen` legacy rota de la escuela 4). */
  const [srcRota, setSrcRota] = useState<string | null>(null);

  const refEstado = useRef<HTMLParagraphElement>(null);
  const refContenedorQuitar = useRef<HTMLDivElement>(null);

  const esAlumno = rol === "alumno";
  const razonSocial = state.datos?.razon_social || "Mi escuela";
  const urlPrevia = state.previewUrl ?? state.datos?.urlImagen ?? null;
  const hayLogoGuardado = Boolean(state.datos?.urlImagen);
  const mostrarImagen = Boolean(urlPrevia) && srcRota !== urlPrevia;
  const ocupado = state.carga.inicial || state.carga.guardar || state.carga.quitar;

  // Después de un guardado o quitado exitoso el foco va a la región de estado
  // para que el lector de pantalla anuncie el cambio (CA-23/CA-24).
  useEffect(() => {
    if (state.exito) refEstado.current?.focus();
  }, [state.exito]);

  // Escape cancela la confirmación en línea y devuelve el foco a "Quitar logo"
  // (CA-30). Se escucha en `document` porque el foco puede estar en cualquier
  // botón de la confirmación. Con el DELETE en vuelo no se cancela nada.
  useEffect(() => {
    if (!state.confirmandoQuitar || state.carga.quitar) return;

    const alTeclado = (evento: KeyboardEvent) => {
      if (evento.key !== "Escape") return;

      evento.preventDefault();
      cancelarQuitar();
      refContenedorQuitar.current
        ?.querySelector<HTMLButtonElement>("button")
        ?.focus();
    };

    document.addEventListener("keydown", alTeclado);
    return () => document.removeEventListener("keydown", alTeclado);
  }, [state.confirmandoQuitar, state.carga.quitar, cancelarQuitar]);

  /** Cancela la confirmación desde el botón y devuelve el foco a "Quitar logo". */
  const cancelarConfirmacion = () => {
    cancelarQuitar();
    refContenedorQuitar.current
      ?.querySelector<HTMLButtonElement>("button")
      ?.focus();
  };

  return (
    <section className="logo_escuela_seccion" aria-labelledby={ID_TITULO}>
      <h2 className="logo_escuela_titulo" id={ID_TITULO}>
        Logo de mi escuela
      </h2>
      <p className="logo_escuela_contexto">
        Este logo identifica a {razonSocial}.
      </p>

      {state.error.inicial && (
        <p className="logo_escuela_alerta" role="alert" aria-live="assertive">
          {state.error.inicial}
        </p>
      )}

      <div className="logo_escuela_panel" aria-busy={ocupado}>
        {state.carga.inicial ? (
          <p className="logo_escuela_cargando">Cargando el logo de tu escuela…</p>
        ) : (
          <>
            {/* ---------- Vista previa cuadrada ---------- */}
            <div className="logo_escuela_previa">
              <div className="logo_escuela_marco">
                {mostrarImagen ? (
                  <img
                    className="logo_escuela_imagen"
                    src={urlPrevia ?? ""}
                    alt={`Logo actual de ${razonSocial}`}
                    onError={() => setSrcRota(urlPrevia)}
                  />
                ) : (
                  <span className="logo_escuela_vacio" aria-hidden="true">
                    Sin logo
                  </span>
                )}
              </div>

              {state.previewUrl && (
                <p className="logo_escuela_leyenda">Vista previa sin guardar</p>
              )}
            </div>

            {/* ---------- Controles (solo el dueño de la escuela) ---------- */}
            {!esAlumno && (
              <div className="logo_escuela_controles">
                <Inputs
                  type="file"
                  label="Elegir logo"
                  name="logo_escuela"
                  readonly={false}
                  accept={FORMATOS_LOGO}
                  onChange={elegirArchivo}
                  error={state.error.campo}
                  disabled={state.carga.guardar || state.carga.quitar}
                />

                <span className="logo_escuela_ayuda">
                  JPG, PNG o WEBP. Máximo 2 MB.
                </span>

                <div className="logo_escuela_acciones">
                  <Boton
                    texto="Guardar logo"
                    logo="Check"
                    clase="aceptar"
                    type="button"
                    disable={
                      !state.archivo ||
                      state.carga.guardar ||
                      state.carga.quitar
                    }
                    cargando={state.carga.guardar}
                    onClick={guardar}
                  />

                  {hayLogoGuardado && (
                    <div className="logo_escuela_quitar" ref={refContenedorQuitar}>
                      <Boton
                        texto="Quitar logo"
                        logo="Delete"
                        clase="eliminar"
                        type="button"
                        disable={state.carga.guardar || state.carga.quitar}
                        cargando={state.carga.quitar}
                        onClick={confirmarQuitar}
                      />
                    </div>
                  )}
                </div>

                {/* ---------- Confirmación en línea (no window.confirm) ---------- */}
                {state.confirmandoQuitar && (
                  <div
                    className="logo_escuela_confirmacion"
                    role="group"
                    aria-label="Confirmar quitar el logo"
                  >
                    <p className="logo_escuela_confirmacion_texto">
                      ¿Quitar el logo de esta escuela?
                    </p>

                    <div className="logo_escuela_confirmacion_acciones">
                      <Boton
                        texto="Sí, quitar"
                        logo="Delete"
                        clase="eliminar"
                        type="button"
                        disable={state.carga.quitar}
                        cargando={state.carga.quitar}
                        onClick={quitar}
                      />
                      <Boton
                        texto="Cancelar"
                        logo="Cancel"
                        clase="cancelar"
                        type="button"
                        disable={state.carga.quitar}
                        onClick={cancelarConfirmacion}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {!esAlumno && state.error.guardar && (
        <p className="logo_escuela_alerta" role="alert" aria-live="assertive">
          {state.error.guardar}
        </p>
      )}

      {!esAlumno && state.error.quitar && (
        <p className="logo_escuela_alerta" role="alert" aria-live="assertive">
          {state.error.quitar}
        </p>
      )}

      {/* Región de estado SIEMPRE renderizada (aunque esté vacía) */}
      <p
        className="logo_escuela_estado"
        ref={refEstado}
        role="status"
        aria-live="polite"
        tabIndex={-1}
      >
        {state.exito ?? ""}
      </p>
    </section>
  );
};
