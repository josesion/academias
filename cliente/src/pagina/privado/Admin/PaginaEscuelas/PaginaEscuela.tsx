import "./paginaescuelas.css";

import { setAmbEscuelas } from "../../../../hookNegocios/abmEscuelas";
import { useModalAccesible } from "../../../../hooks/useModalAccesible";

import { FormularioEscuelas } from "../../../../componentes/Administrador/Escuelas/EscuelasFormulario";
import { ListadoEscuelas } from "../../../../componentes/Administrador/ListadoEscuelas/ListadoEscuela";
import { Boton } from "../../../../componentes/generales/Boton/Boton";
import { EliminarVentana } from "../../../../componentes/generales/EliminarModal/EliminarModal";
import { FiltroEscuelas } from "../../../../componentes/Administrador/BuscadorEscuelas/BuscadorEscuelas";
import { Paginacion } from "../../../../componentes/generales/Paginacion/Paginacion";

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
    cachearPagina,
    cacharFormularioPut,
  } = setAmbEscuelas();

  // Teclado de los 2 modales (spec 014): Escape cierra, el foco entra, queda
  // atrapado dentro y vuelve al botón que los abrió
  const { refDialog: refFormulario } = useModalAccesible({
    abierto: state.modalAbierto,
    onCerrar: handleCerrarFormulario,
  });

  const { refDialog: refEstado } = useModalAccesible({
    abierto: state.modalEstado,
    onCerrar: handleCerrarModalEstado,
  });

  // NO va `<main>` ni `role="main"`: el layout ya aporta el unico landmark
  // `main` de la pagina. Un segundo `main` anidado es invalido.
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
            clase="editar"
            logo="Add"
            texto="Agregar Escuela"
            type="button"
            onClick={hanldeAbrirPostFormulario}
          />
        </div>
      </header>

      <section aria-labelledby="escuelas-filtros-titulo" className="pagina_escuelas_filtros">
        <h2 id="escuelas-filtros-titulo" className="visually-hidden">
          Filtros de escuelas
        </h2>
        <FiltroEscuelas
          apellido={state.filtros.apellido}
          razon_social={state.filtros.razon_social}
          estado={state.filtros.estado}
          cachearFiltros={cachearFiltros}
        />
      </section>

      {state.modalAbierto && (
        <div
          className="pagina_escuelas_modal_fondo"
          onClick={handleCerrarFormulario}
        >
          <div
            ref={refFormulario}
            className="pagina_escuelas_modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form_escuela_titulo"
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
            ref={refEstado}
            className="pagina_escuelas_modal"
            role="dialog"
            aria-modal="true"
            aria-label="Confirmar cambio de estado de la escuela"
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

      <section aria-labelledby="escuelas-listado-titulo" className="pagina_escuelas_contenido">
        <h2 id="escuelas-listado-titulo" className="visually-hidden">
          Listado de escuelas
        </h2>
        {state.listadoEscuelas != null ? (
          <ListadoEscuelas
            escuelas={state.listadoEscuelas}
            onSelectEscuela={cacharFormularioPut}
            onEstadoEscuela={handleEstadoEscuelas}
            onAbrirModal={handleAbirModalEstado}
            carga={state.carga}
          />
        ) : null}
      </section>

      <nav aria-label="Paginación de escuelas">
        <Paginacion
          paginaActual={state.paginacion.pagina}
          contadorPagina={state.paginacion.contadorPagina}
          onPaginaCambiada={cachearPagina}
        />
      </nav>
    </section>
  );
};
