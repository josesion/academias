import "./paginaescuelas.css";

import { setAmbEscuelas } from "../../../../hookNegocios/abmEscuelas";

import { FormularioEscuelas } from "../../../../componentes/Administrador/Escuelas/EscuelasFormulario";
import { ListadoEscuelas } from "../../../../componentes/Administrador/ListadoEscuelas/ListadoEscuela";
import { Boton } from "../../../../componentes/generales/Boton/Boton";
import { EliminarVentana } from "../../../../componentes/generales/EliminarModal/EliminarModal";

export const PaginaEscuela = () => {
  const {
    state,
    handleCambioImagen,
    handleCerrarFormulario,
    hanldeAbrirPostFormulario,
    handleCerrarModalEstado,
    handleAbirModalEstado,
    handlePostEscuelas,
    handlePutEscuelas,
    handleEstadoEscuelas,
    cachearFormulario,
    cachearFiltros,
    cacharFormularioPut,
  } = setAmbEscuelas();

  // console.log(state.formulario);

  return (
    <section className="pagina_escuelas">
      <header className="pagina_escuelas_encabezado">
        <div className="pagina_escuelas_titulos">
          <span className="pagina_escuelas_etiqueta">Administración</span>

          <h1>Escuelas</h1>

          <p>Gestiona las academias registradas en la plataforma.</p>
        </div>

        <div className="pagina_escuelas_acciones">
          <Boton
            clase="agregar"
            logo="Add"
            texto="Agregar Escuela"
            type="button"
            onClick={hanldeAbrirPostFormulario}
          />
        </div>
      </header>

      {state.modalAbierto && (
        <div
          className="pagina_escuelas_modal_fondo"
          onClick={handleCerrarFormulario}
        >
          <div
            className="pagina_escuelas_modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <FormularioEscuelas
              error={state.error}
              carga={state.carga}
              formulario={state.formulario}
              imagen={state.imagen}
              metodo={state.metodo}
              onCerrar={handleCerrarFormulario}
              postEscuelas={handlePostEscuelas}
              putEscuelas={handlePutEscuelas}
              cambioImagen={handleCambioImagen}
              cachearFormulario={cachearFormulario}
            />
          </div>
        </div>
      )}

      {state.modalEstado && (
        <div
          className="pagina_escuelas_modal_fondo"
          onClick={handleCerrarModalEstado}
        >
          <div
            className="pagina_escuelas_modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <EliminarVentana
              data={{}}
              mensaje={state.errorEstado}
              accion={
                state.estadoListado === "activos"
                  ? "Dar de baja la escuela"
                  : "Dar de alta la escuela"
              }
              onSi={() => handleEstadoEscuelas()}
              onCancelar={() => handleCerrarModalEstado()}
              cargando={state.carga}
            />
          </div>
        </div>
      )}

      <div className="pagina_escuelas_contenido">
        {state.listadoEscuelas != null ? (
          <ListadoEscuelas
            escuelas={state.listadoEscuelas}
            onSelectEscuela={cacharFormularioPut}
            onEstadoEscuela={handleEstadoEscuelas}
            onAbrirModal={handleAbirModalEstado}
            carga={state.carga}
          />
        ) : null}
      </div>
    </section>
  );
};
