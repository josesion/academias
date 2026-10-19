import { Inputs } from "../../componentes/generales/Inputs/Inputs";
import { Boton } from "../../componentes/generales/Boton/Boton";
import "./formularioInfoUsuario.css";
import type { CampoFormularioKey } from "../../reducers/perfil.reducer";

/**
 * Props del formulario de información de usuario.
 * Recibe todo vía props (sin hooks ni contexto interno) para ser puro y testeable.
 */
interface FormularioInfoUsuarioProps {
  /** Rol del usuario: define type="email" (alumno) vs type="text" (usuario/admin) en campo usuario.
   *  Para "alumno" además se oculta el input "Correo" y se muestra la ayuda "Tu correo es tu usuario". */
  rol: "usuario" | "administrador" | "alumno";

  /** Estados de carga */
  carga: {
    guardar: boolean;
  };

  /** Errores: por campo + error global de guardado */
  error: {
    campo: Partial<Record<CampoFormularioKey, string>>;
    guardar: string | null;
  };

  /** Si se muestra alerta de éxito */
  exito: boolean;

  // Handlers (vienen del hook useAmbPerfilUsuario)
  /** onChange wrapper por campo: handleChange("campo") devuelve (e) => void */
  handleChange: (campo: CampoFormularioKey) => (e: React.ChangeEvent<HTMLInputElement>) => void;

  /** Dispara el PUT /api/usuario_perfil */
  guardarPerfil: () => void;

  /** Limpia la alerta de éxito */
  limpiarExito: () => void;

  /** Callback para botón Cancelar (página pasa navigate(-1)) */
  onCancelar: () => void;

  // Helpers de lectura
  /** Obtiene el valor actual de un campo */
  getValor: (campo: CampoFormularioKey) => string;

  /** True si el campo tiene error */
  tieneError: (campo: CampoFormularioKey) => boolean;

  /** Obtiene el mensaje de error de un campo */
  getError: (campo: CampoFormularioKey) => string | undefined;
}

/**
 * Componente `FormularioInfoUsuario` — Formulario de edición de perfil.
 *
 * Separa la UI del formulario de la lógica de página (`PerfilUsuarioPage`).
 * Usa componentes generales reutilizables: `Inputs`, `Boton`.
 *
 * @param _datos - Perfil completo del server (para valores iniciales y campos readonly)
 * @param rol - Rol del usuario: "alumno" → sin input "Correo" (se muestra la ayuda
 *   "Tu correo es tu usuario"), "usuario"/"administrador" → correo visible y editable
 * @param _formulario - Estado actual del formulario (valores editados)
 * @param carga - Estados de carga (guardar)
 * @param error - Errores por campo + global
 * @param exito - Muestra alerta de éxito
 * @param handleChange - Handler genérico por campo
 * @param guardarPerfil - Handler del submit (PUT)
 * @param limpiarExito - Cierra alerta de éxito
 * @param onCancelar - Vuelve a la página anterior
 * @param getValor - Helper: valor actual de campo
 * @param tieneError - Helper: campo tiene error
 * @param getError - Helper: mensaje de error de campo
 */
export const FormularioInfoUsuario = ({
  rol,
  carga,
  error,
  exito,
  handleChange,
  guardarPerfil,
  limpiarExito,
  onCancelar,
  getValor,
  tieneError,
  getError,
}: FormularioInfoUsuarioProps) => {
  // El campo "usuario" es email para alumno, text para usuario/admin
  const esAlumno = rol === "alumno";
  const tipoUsuario = esAlumno ? "email" : "text";
  const autoCompleteUsuario = esAlumno ? "email" : "username";

  return (
    <form onSubmit={(e) => e.preventDefault()} className="perfil_formulario" noValidate>
      {/* =======================
          DATOS PERSONALES
      ======================== */}
      <section className="perfil_seccion">
        <h2 className="section-title">
          Datos Personales
        </h2>

        {/* USUARIO — type condicional según rol */}
        <div className="perfil_grupo">
          <Inputs
            label="Usuario"
            type={tipoUsuario}
            name="usuario"
            value={getValor("usuario")}
            onChange={handleChange("usuario")}
            autoComplete={autoCompleteUsuario}
            required
            readonly={false}
            error={tieneError("usuario") ? getError("usuario") : null}
            disabled={carga.guardar}
          />
        </div>

        {/* NOMBRE — readonly */}
        <div className="perfil_grupo">
          <Inputs
            label="Nombre"
            type="text"
            name="nombre"
            value={getValor("nombre")}
            onChange={handleChange("nombre")}
            autoComplete="given-name"
            readonly={true}
            disabled={true}
            error={null}
          />
        </div>

        {/* APELLIDO — readonly */}
        <div className="perfil_grupo">
          <Inputs
            label="Apellido"
            type="text"
            name="apellido"
            value={getValor("apellido")}
            onChange={handleChange("apellido")}
            autoComplete="family-name"
            readonly={true}
            disabled={true}
            error={null}
          />
        </div>

        {/* CORREO — oculto para alumno (su usuario ya es el email):
            en su lugar se muestra la línea de ayuda */}
        {!esAlumno ? (
          <div className="perfil_grupo">
            <Inputs
              label="Correo"
              type="email"
              name="correo"
              value={getValor("correo")}
              onChange={handleChange("correo")}
              autoComplete="email"
              required
              readonly={false}
              error={tieneError("correo") ? getError("correo") : null}
              disabled={carga.guardar}
            />
          </div>
        ) : (
          <div className="perfil_grupo">
            <span className="perfil_ayuda">
              Tu correo es tu usuario
            </span>
          </div>
        )}

        {/* CELULAR — opcional */}
        <div className="perfil_grupo">
          <Inputs
            label="Celular"
            type="tel"
            name="celular"
            value={getValor("celular")}
            onChange={handleChange("celular")}
            autoComplete="tel"
            placeholder="Opcional"
            readonly={false}
            error={tieneError("celular") ? getError("celular") : null}
            disabled={carga.guardar}
          />
          {!tieneError("celular") && (
            <span className="perfil_ayuda">
              Opcional
            </span>
          )}
        </div>
      </section>

      {/* =======================
          SEGURIDAD
      ======================== */}
      <section className="perfil_seccion">
        <h2 className="section-title">
          Seguridad
        </h2>

        {/* CONTRASEÑA ACTUAL — obligatoria */}
        <div className="perfil_grupo">
          <Inputs
            label="Contraseña actual"
            type="password"
            name="contrasena_actual"
            value={getValor("contrasena_actual")}
            onChange={handleChange("contrasena_actual")}
            autoComplete="current-password"
            required
            readonly={false}
            error={tieneError("contrasena_actual") ? getError("contrasena_actual") : null}
            disabled={carga.guardar}
            showPasswordToggle
          />
        </div>

        {/* NUEVA CONTRASEÑA — opcional */}
        <div className="perfil_grupo">
          <Inputs
            label="Nueva contraseña"
            type="password"
            name="nueva_contrasena"
            value={getValor("nueva_contrasena")}
            onChange={handleChange("nueva_contrasena")}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres (opcional)"
            readonly={false}
            error={tieneError("nueva_contrasena") ? getError("nueva_contrasena") : null}
            disabled={carga.guardar}
            showPasswordToggle
          />
        </div>

        {/* CONFIRMAR NUEVA CONTRASEÑA */}
        <div className="perfil_grupo">
          <Inputs
            label="Confirmar nueva contraseña"
            type="password"
            name="confirmar_contrasena"
            value={getValor("confirmar_contrasena")}
            onChange={handleChange("confirmar_contrasena")}
            autoComplete="new-password"
            placeholder="Repite la nueva contraseña"
            readonly={false}
            error={tieneError("confirmar_contrasena") ? getError("confirmar_contrasena") : null}
            disabled={carga.guardar}
            showPasswordToggle
          />
        </div>
      </section>

      {/* =======================
          ACCIONES
      ======================== */}
      <div className="perfil_acciones">
        <Boton
          texto="Cancelar"
          logo="Cancel"
          size={25}
          clase="cancelar"
          onClick={onCancelar}
          disable={carga.guardar}
          type="button"
        />
        <Boton
          texto={carga.guardar ? "Guardando..." : "Guardar cambios"}
          logo="Check"
          size={25}
          clase="aceptar"
          onClick={guardarPerfil}
          disable={carga.guardar}
          type="button"
        />
      </div>

      {/* Alerta de éxito — debajo de los botones Cancelar/Guardar (decisión #9) */}
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

      {/* Alerta de error general (guardado) — debajo de los botones */}
      {error.guardar && !exito && (
        <div
          className="perfil_alerta perfil_alerta--error"
          role="alert"
          aria-live="assertive"
        >
          {error.guardar}
        </div>
      )}
    </form>
  );
};