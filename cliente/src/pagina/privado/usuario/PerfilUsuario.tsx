import { useId } from "react";
import { useAmbPerfilUsuario } from "../../../hookNegocios/abmPerfilUsuario";
import "./perfilusuario.css";

export const PerfilUsuarioPage = () => {
  const {
    state,
    limpiarExito,
    getValor,
    getError,
    tieneError,
    handleChange,
    guardarPerfil,
  } = useAmbPerfilUsuario();

  const {
    carga,
    error,
    exito,
    datos,
  } = state;

  const usuarioId = useId();
  const nombreId = useId();
  const apellidoId = useId();
  const correoId = useId();
  const celularId = useId();
  const passActualId = useId();
  const passNuevaId = useId();
  const passConfirmId = useId();

  // Carga global inicial (GET)
  if (carga.inicial) {
    return (
      <div className="perfil_contenedor" role="status" aria-live="polite" aria-busy="true">
        <div className="carga-global">
          <div className="spinner" aria-hidden="true" />
          <span className="visually-hidden">Cargando tu perfil...</span>
        </div>
      </div>
    );
  }

  // Error en carga inicial
  if (error.inicial && !datos) {
    return (
      <div className="perfil_contenedor">
        <header className="perfil_encabezado">
          <div className="perfil_encabezado_titulos">
            <span className="perfil_encabezado_etiqueta">Configuración</span>
            <h1>Mi Perfil</h1>
          </div>
        </header>
        <div className="perfil_alerta perfil_alerta--error" role="alert" aria-live="assertive">
          {error.inicial}
          <button type="button" className="btn-secundario" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="perfil_contenedor">
      {/* Encabezado */}
      <header className="perfil_encabezado">
        <div className="perfil_encabezado_titulos">
          <span className="perfil_encabezado_etiqueta">Configuración</span>
          <h1>Mi Perfil</h1>
          <p>Actualiza tus datos personales y credenciales de acceso.</p>
        </div>
      </header>

      {/* Alerta de éxito */}
      {exito && (
        <div
          className="perfil_alerta perfil_alerta--exito"
          role="alert"
          aria-live="polite"
        >
          <span>Perfil actualizado correctamente</span>
          <button
            type="button"
            className="perfil_alerta_cerrar"
            onClick={limpiarExito}
            aria-label="Cerrar mensaje de éxito"
          >
            ×
          </button>
        </div>
      )}

      {/* Alerta de error general (guardado) */}
      {error.guardar && !exito && (
        <div
          className="perfil_alerta perfil_alerta--error"
          role="alert"
          aria-live="assertive"
        >
          {error.guardar}
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="perfil_formulario" noValidate>
        {/* =======================
            DATOS PERSONALES
        ======================== */}
        <section aria-labelledby={usuarioId} className="perfil_seccion">
          <h2 id={usuarioId} className="section-title">
            Datos Personales
          </h2>

          <div className="perfil_grupo">
            <label htmlFor={`usuario-${usuarioId}`} className="perfil_label">
              Usuario <span className="perfil_requerido" aria-hidden="true">*</span>
            </label>
            <input
              type="text"
              id={`usuario-${usuarioId}`}
              name="usuario"
              className={`perfil_input ${tieneError("usuario") ? "perfil_input--error" : ""}`}
              value={getValor("usuario")}
              onChange={handleChange("usuario")}
              autoComplete="username"
              required
              aria-describedby={tieneError("usuario") ? `usuario-error-${usuarioId}` : undefined}
              aria-invalid={tieneError("usuario") ? "true" : "false"}
              disabled={carga.guardar}
            />
            {tieneError("usuario") && (
              <span id={`usuario-error-${usuarioId}`} className="perfil_error" role="alert">
                {getError("usuario")}
              </span>
            )}
          </div>

          <div className="perfil_grupo">
            <label htmlFor={`nombre-${nombreId}`} className="perfil_label">
              Nombre
            </label>
            <input
              type="text"
              id={`nombre-${nombreId}`}
              name="nombre"
              className="perfil_input"
              value={getValor("nombre")}
              readOnly
              disabled
              autoComplete="given-name"
              aria-describedby={`nombre-desc-${nombreId}`}
            />
            <span id={`nombre-desc-${nombreId}`} className="perfil_ayuda">
              No editable
            </span>
          </div>

          <div className="perfil_grupo">
            <label htmlFor={`apellido-${apellidoId}`} className="perfil_label">
              Apellido
            </label>
            <input
              type="text"
              id={`apellido-${apellidoId}`}
              name="apellido"
              className="perfil_input"
              value={getValor("apellido")}
              readOnly
              disabled
              autoComplete="family-name"
              aria-describedby={`apellido-desc-${apellidoId}`}
            />
            <span id={`apellido-desc-${apellidoId}`} className="perfil_ayuda">
              No editable
            </span>
          </div>

          <div className="perfil_grupo">
            <label htmlFor={`correo-${correoId}`} className="perfil_label">
              Correo <span className="perfil_requerido" aria-hidden="true">*</span>
            </label>
            <input
              type="email"
              id={`correo-${correoId}`}
              name="correo"
              className={`perfil_input ${tieneError("correo") ? "perfil_input--error" : ""}`}
              value={getValor("correo")}
              onChange={handleChange("correo")}
              autoComplete="email"
              required
              aria-describedby={tieneError("correo") ? `correo-error-${correoId}` : undefined}
              aria-invalid={tieneError("correo") ? "true" : "false"}
              disabled={carga.guardar}
            />
            {tieneError("correo") && (
              <span id={`correo-error-${correoId}`} className="perfil_error" role="alert">
                {getError("correo")}
              </span>
            )}
          </div>

          <div className="perfil_grupo">
            <label htmlFor={`celular-${celularId}`} className="perfil_label">
              Celular
            </label>
            <input
              type="tel"
              id={`celular-${celularId}`}
              name="celular"
              className={`perfil_input ${tieneError("celular") ? "perfil_input--error" : ""}`}
              value={getValor("celular")}
              onChange={handleChange("celular")}
              autoComplete="tel"
              placeholder="Opcional"
              aria-describedby={tieneError("celular") ? `celular-error-${celularId}` : `celular-desc-${celularId}`}
              aria-invalid={tieneError("celular") ? "true" : "false"}
              disabled={carga.guardar}
            />
            {tieneError("celular") && (
              <span id={`celular-error-${celularId}`} className="perfil_error" role="alert">
                {getError("celular")}
              </span>
            )}
            {!tieneError("celular") && (
              <span id={`celular-desc-${celularId}`} className="perfil_ayuda">
                Opcional
              </span>
            )}
          </div>
        </section>

        {/* =======================
            SEGURIDAD
        ======================== */}
        <section aria-labelledby={`seguridad-${passActualId}`} className="perfil_seccion">
          <h2 id={`seguridad-${passActualId}`} className="section-title">
            Seguridad
          </h2>

          <div className="perfil_grupo">
            <label htmlFor={`pass-actual-${passActualId}`} className="perfil_label">
              Contraseña actual <span className="perfil_requerido" aria-hidden="true">*</span>
            </label>
            <input
              type="password"
              id={`pass-actual-${passActualId}`}
              name="contrasena_actual"
              className={`perfil_input ${tieneError("contrasena_actual") ? "perfil_input--error" : ""}`}
              value={getValor("contrasena_actual")}
              onChange={handleChange("contrasena_actual")}
              autoComplete="current-password"
              required
              aria-describedby={tieneError("contrasena_actual") ? `pass-actual-error-${passActualId}` : undefined}
              aria-invalid={tieneError("contrasena_actual") ? "true" : "false"}
              disabled={carga.guardar}
            />
            {tieneError("contrasena_actual") && (
              <span id={`pass-actual-error-${passActualId}`} className="perfil_error" role="alert">
                {getError("contrasena_actual")}
              </span>
            )}
          </div>

          <div className="perfil_grupo">
            <label htmlFor={`pass-nueva-${passNuevaId}`} className="perfil_label">
              Nueva contraseña
            </label>
            <input
              type="password"
              id={`pass-nueva-${passNuevaId}`}
              name="nueva_contrasena"
              className={`perfil_input ${tieneError("nueva_contrasena") ? "perfil_input--error" : ""}`}
              value={getValor("nueva_contrasena")}
              onChange={handleChange("nueva_contrasena")}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres (opcional)"
              aria-describedby={tieneError("nueva_contrasena") ? `pass-nueva-error-${passNuevaId}` : `pass-nueva-desc-${passNuevaId}`}
              aria-invalid={tieneError("nueva_contrasena") ? "true" : "false"}
              disabled={carga.guardar}
            />
            {tieneError("nueva_contrasena") && (
              <span id={`pass-nueva-error-${passNuevaId}`} className="perfil_error" role="alert">
                {getError("nueva_contrasena")}
              </span>
            )}
            {!tieneError("nueva_contrasena") && (
              <span id={`pass-nueva-desc-${passNuevaId}`} className="perfil_ayuda">
                Déjalo vacío para no cambiarla
              </span>
            )}
          </div>

          <div className="perfil_grupo">
            <label htmlFor={`pass-confirm-${passConfirmId}`} className="perfil_label">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              id={`pass-confirm-${passConfirmId}`}
              name="confirmar_contrasena"
              className={`perfil_input ${tieneError("confirmar_contrasena") ? "perfil_input--error" : ""}`}
              value={getValor("confirmar_contrasena")}
              onChange={handleChange("confirmar_contrasena")}
              autoComplete="new-password"
              placeholder="Repite la nueva contraseña"
              aria-describedby={tieneError("confirmar_contrasena") ? `pass-confirm-error-${passConfirmId}` : undefined}
              aria-invalid={tieneError("confirmar_contrasena") ? "true" : "false"}
              disabled={carga.guardar}
            />
            {tieneError("confirmar_contrasena") && (
              <span id={`pass-confirm-error-${passConfirmId}`} className="perfil_error" role="alert">
                {getError("confirmar_contrasena")}
              </span>
            )}
          </div>
        </section>

        {/* =======================
            ACCIONES
        ======================== */}
        <div className="perfil_acciones">
          <button
            type="button"
            className="btn-secundario"
            onClick={() => window.history.back()}
            disabled={carga.guardar}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-principal"
            disabled={carga.guardar}
            onClick={guardarPerfil}
          >
            {carga.guardar ? (
              <>
                <span className="btn_spinner" aria-hidden="true" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};