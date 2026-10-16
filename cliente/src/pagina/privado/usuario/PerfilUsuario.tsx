import { useNavigate } from "react-router-dom";
import { useAmbPerfilUsuario } from "../../../hookNegocios/abmPerfilUsuario";
import { FormularioInfoUsuario } from "../../../componentes/formularioInfoUsuario/FormularioInfoUsuario";
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

  const navigate = useNavigate();

  const {
    carga,
    error,
    exito,
    datos,
  } = state;

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

      {/* Formulario delegado a componente reutilizable */}
      <FormularioInfoUsuario
        rol={(datos?.rol as "usuario" | "administrador" | "alumno") ?? "usuario"}
        carga={carga}
        error={error}
        exito={exito}
        handleChange={handleChange}
        guardarPerfil={guardarPerfil}
        limpiarExito={limpiarExito}
        onCancelar={() => navigate(-1)}
        getValor={getValor}
        tieneError={tieneError}
        getError={getError}
      />
    </div>
  );
};