import { LuX } from "react-icons/lu";

import { ListadoEmpresas } from "../../../../componentes/Administrador/Empresas/ListadoEmpresas";
import { FormularioEmpresa } from "../../../../componentes/Administrador/Empresas/FormularioEmpresa";
import { PanelAnunciosEmpresa } from "../../../../componentes/Administrador/Empresas/PanelAnunciosEmpresa";
import { Inputs } from "../../../../componentes/generales/Inputs/Inputs";
import { SelectorOpt } from "../../../../componentes/generales/CompSelecObt/SelectorOpt";
import { Boton } from "../../../../componentes/generales/Boton/Boton";
import { EliminarVentana } from "../../../../componentes/generales/EliminarModal/EliminarModal";
import { useAmbEmpresas } from "../../../../hookNegocios/abmEmpresas";
import { useModalAccesible } from "../../../../hooks/useModalAccesible";

import type { FilaEmpresa } from "../../../../servicio/empresas.fetch";
import "./paginaempresas.css";

/** Opciones del filtro de estado. SIN la opción de valor "": el `SelectorOpt`
 *  ya pinta la primera como `<option value="">labelDefault</option>`, así que si se
 *  agrega acá sale duplicada ("Todas" dos veces). Para "Todas" se manda `estado`
 *  sin definir, que es lo que hace que el server traiga solo las activas. */
const OPCIONES_ESTADO = [
    { valor: "activos", etiqueta: "Activas" },
    { valor: "inactivos", etiqueta: "Inactivas" },
];

/**
 * Página Admin de Empresas: encabezado (con el botón de alta) + buscador y
 * filtro de estado + el listado + los 3 modales (formulario, confirmación de
 * baja y panel con los anuncios de la empresa clickeada).
 *
 * Las empresas son las dueñas de los anuncios: sin empresas cargadas, el
 * formulario de anuncios no tiene a quién asignarles (spec 017).
 */
export const PaginaEmpresas = () => {
  const {
    state,
    cachearPagina,
    cambiarRazonSocial,
    cambiarEstado,
    limpiarFiltros,
    abrirFormulario,
    abrirModificacion,
    cerrarFormulario,
    cachearFormulario,
    cambiarLogo,
    quitarLogo,
    postEmpresa,
    putEmpresa,
    reactivarEmpresa,
    abrirEliminar,
    cerrarEliminar,
    deleteEmpresa,
    verAnuncios,
    cerrarPanelAnuncios,
  } = useAmbEmpresas();

  // Teclado de los modales (spec 014): Escape cierra y el foco entra, queda
  // atrapado y vuelve al botón que lo abrió
  const { refDialog: refFormulario } = useModalAccesible({
    abierto: state.modal.formulario,
    onCerrar: cerrarFormulario,
  });

  const { refDialog: refAnuncios } = useModalAccesible({
    abierto: state.modal.anuncios,
    onCerrar: cerrarPanelAnuncios,
  });

  const { refDialog: refEliminar } = useModalAccesible({
    abierto: state.modal.eliminar,
    onCerrar: cerrarEliminar,
  });

  return (
    <section className="pagina_empresas">
      <header className="pagina_empresas_encabezado">
        <div className="pagina_empresas_titulos">
          <span className="pagina_empresas_etiqueta">Administración</span>

          <h1>Empresas</h1>

          <p>
            Gestioná las empresas de la plataforma y sus anuncios. Hacé clic en
            el nombre de una empresa para ver qué avisos tiene.
          </p>
        </div>

        <div className="pagina_empresas_acciones">
          <Boton
            clase="agregar"
            logo="Add"
            texto="Nueva empresa"
            type="button"
            onClick={abrirFormulario}
          />
        </div>
      </header>

      {/* ---------- Filtros: búsqueda + estado ---------- */}
      <div className="pagina_empresas_filtros">
        <div className="pagina_empresas_buscador">
          <Inputs
            type="text"
            label="Buscar por razón social"
            placeholder="Escribí parte del nombre…"
            readonly={false}
            name="razon_social"
            value={state.filtros.razon_social ?? ""}
            onChange={cambiarRazonSocial}
          />
        </div>

        <div className="pagina_empresas_estado">
          <span className="pagina_empresas_estado_label">Estado</span>

          <SelectorOpt
            categorias={OPCIONES_ESTADO}
            itemKey="valor"
            itemLabel="etiqueta"
            name="estado"
            value={state.filtros.estado ?? ""}
            labelDefault="Todas"
            onChangeSelector={cambiarEstado}
          />
        </div>

        {/* Solo tiene sentido si hay algo filtrado */}
        {(state.filtros.razon_social || state.filtros.estado) && (
          <button
            type="button"
            className="pagina_empresas_limpiar"
            onClick={limpiarFiltros}
          >
            <LuX size={14} />
            Limpiar filtros
          </button>
        )}
      </div>

      <ListadoEmpresas
        filas={state.listado}
        filtros={state.filtros}
        carga={state.carga.listado}
        contadorPagina={state.paginacion.contadorPagina}
        error={state.error.listado}
        onCambioPagina={cachearPagina}
        onVerAnuncios={verAnuncios}
        onModificar={abrirModificacion}
        onReactivar={reactivarEmpresa}
        onEliminar={abrirEliminar}
      />

      {/* ==============================================================
          MODAL DEL FORMULARIO — alta o modificación
          ============================================================== */}
      {state.modal.formulario && (
        <div className="admin_modal_fondo" onClick={cerrarFormulario}>
          <div
            ref={refFormulario}
            className="admin_modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form_empresa_titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <FormularioEmpresa
              formulario={state.formulario}
              logo={state.logo}
              empresaEnEdicion={state.empresaEnEdicion}
              error={state.error.formulario}
              carga={state.carga.formulario}
              metodo={state.metodo}
              cachearFormulario={cachearFormulario}
              cambiarLogo={cambiarLogo}
              quitarLogo={quitarLogo}
              postEmpresa={postEmpresa}
              putEmpresa={putEmpresa}
              onCerrar={cerrarFormulario}
            />
          </div>
        </div>
      )}

      {/* ==============================================================
          PANEL DE ANUNCIOS DE LA EMPRESA — click en el nombre de la fila.
          Es de solo lectura: los anuncios se editan en /admin/anuncios.
          ============================================================== */}
      {state.modal.anuncios && state.empresaSeleccionada && (
        <div className="admin_modal_fondo" onClick={cerrarPanelAnuncios}>
          <div
            ref={refAnuncios}
            className="admin_modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel_anuncios_titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <PanelAnunciosEmpresa
              empresa={state.empresaSeleccionada}
              filas={state.listadoAnuncios}
              carga={state.carga.anuncios}
              error={state.error.anuncios}
              onCerrar={cerrarPanelAnuncios}
            />
          </div>
        </div>
      )}

      {/* ==============================================================
          CONFIRMACIÓN DE BAJA (lógica: la empresa queda "inactivos")
          ============================================================== */}
      {state.modal.eliminar && state.empresaAEliminar && (
        <div className="admin_modal_fondo" onClick={cerrarEliminar}>
          <div
            ref={refEliminar}
            className="admin_modal admin_modal--compacto"
            role="alertdialog"
            aria-modal="true"
            aria-label="Eliminar empresa"
            onClick={(e) => e.stopPropagation()}
          >
            <EliminarVentana<FilaEmpresa>
              data={state.empresaAEliminar}
              accion={`Dar de baja la empresa ${state.empresaAEliminar.razon_social}`}
              // La baja es lógica: sí se puede deshacer reactivándola
              nota="La empresa no se borra: queda inactiva y podés reactivarla cuando quieras."
              mensaje={state.error.eliminar}
              cargando={state.carga.eliminar}
              onSi={deleteEmpresa}
              onCancelar={cerrarEliminar}
            />
          </div>
        </div>
      )}
    </section>
  );
};
