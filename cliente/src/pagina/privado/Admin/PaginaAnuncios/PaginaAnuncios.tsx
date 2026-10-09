import { LuX } from "react-icons/lu";

import { ListadoAnuncios } from "../../../../componentes/Administrador/Anuncios/ListadoAnuncios";
import { FormularioAnuncio } from "../../../../componentes/Administrador/Anuncios/FormularioAnuncio";
import { Inputs } from "../../../../componentes/generales/Inputs/Inputs";
import { SelectorOpt } from "../../../../componentes/generales/CompSelecObt/SelectorOpt";
import { FiltroFechas } from "../../../../componentes/generales/FiltrosFechas/FiltrosFechas";
import { Boton } from "../../../../componentes/generales/Boton/Boton";
import { EliminarVentana } from "../../../../componentes/generales/EliminarModal/EliminarModal";
import { useAmbAnuncios } from "../../../../hookNegocios/abmAnuncios";
import { useModalAccesible } from "../../../../hooks/useModalAccesible";

import type { FilaAnuncio } from "../../../../servicio/anuncios.fetch";
import "./paginaanuncios.css";

/** Filtro de tipo de media.
 *  SIN la opción de valor "": el `SelectorOpt` ya pinta la primera como
 *  `<option value="">labelDefault</option>`, así que si se agrega acá sale
 *  duplicada ("Todos" dos veces). Para "Todos" se manda `tipo_media` sin
 *  definir, que el server trata como "sin filtro". */
const OPCIONES_MEDIA = [
    { valor: "imagen", etiqueta: "Imágenes" },
    { valor: "video", etiqueta: "Videos" },
];

/** Filtro de tipo de contacto. Mismo criterio que el de media. */
const OPCIONES_CONTACTO = [
    { valor: "whatsapp", etiqueta: "WhatsApp" },
    { valor: "facebook", etiqueta: "Facebook" },
    { valor: "instagram", etiqueta: "Instagram" },
];

/**
 * Página Admin de Anuncios: encabezado (con el botón de alta) + los 5 filtros
 * + el listado + los 2 modales (formulario y confirmación de baja).
 *
 * Los anuncios son los avisos de las empresas: el formulario elige a qué
 * empresa pertenece cada uno (el selector se llena con `empresa_lista`).
 */
export const PaginaAnuncios = () => {
  const {
    state,
    cachearPagina,
    cambiarRazonSocial,
    cambiarTipoMedia,
    cambiarTipoContacto,
    cambiarFecha,
    limpiarFiltros,
    abrirFormulario,
    abrirModificacion,
    cerrarFormulario,
    cachearFormulario,
    cambiarMedia,
    quitarMedia,
    postAnuncio,
    putAnuncio,
    abrirEliminar,
    cerrarEliminar,
    deleteAnuncio,
  } = useAmbAnuncios();

  // Teclado de los modales (spec 014): Escape cierra y el foco entra, queda
  // atrapado y vuelve al botón que lo abrió
  const { refDialog: refFormulario } = useModalAccesible({
    abierto: state.modal.formulario,
    onCerrar: cerrarFormulario,
  });

  const { refDialog: refEliminar } = useModalAccesible({
    abierto: state.modal.eliminar,
    onCerrar: cerrarEliminar,
  });

  // Los 4 filtros de texto/select: si todos vacíos, no tiene sentido el botón
  const hayFiltros = Boolean(
    state.filtros.razon_social ||
    state.filtros.tipo_media ||
    state.filtros.tipo_contacto ||
    state.filtros.fecha_desde ||
    state.filtros.fecha_hasta
  );

  return (
    <section className="pagina_anuncios">
      <header className="pagina_anuncios_encabezado">
        <div className="pagina_anuncios_titulos">
          <span className="pagina_anuncios_etiqueta">Administración</span>

          <h1>Anuncios</h1>

          <p>
            Gestioná los anuncios de las empresas: imágenes y videos con su
            contacto.
          </p>
        </div>

        <div className="pagina_anuncios_acciones">
          <Boton
            clase="agregar"
            logo="Add"
            texto="Nuevo anuncio"
            type="button"
            onClick={abrirFormulario}
          />
        </div>
      </header>

      {/* ---------- Los 5 filtros del listado ---------- */}
      <div className="pagina_anuncios_filtros">
        <div className="pagina_anuncios_buscador">
          <Inputs
            type="text"
            label="Buscar por empresa"
            placeholder="Escribí parte de la razón social…"
            readonly={false}
            name="razon_social"
            value={state.filtros.razon_social ?? ""}
            onChange={cambiarRazonSocial}
          />
        </div>

        {/* El `SelectorOpt` no trae label: el texto va en un `<span>` aparte */}
        <div className="pagina_anuncios_select">
          <span className="pagina_anuncios_select_label">Tipo de media</span>

          <SelectorOpt
            categorias={OPCIONES_MEDIA}
            itemKey="valor"
            itemLabel="etiqueta"
            name="tipo_media"
            value={state.filtros.tipo_media ?? ""}
            labelDefault="Todos"
            onChangeSelector={cambiarTipoMedia}
          />
        </div>

        <div className="pagina_anuncios_select">
          <span className="pagina_anuncios_select_label">Contacto</span>

          <SelectorOpt
            categorias={OPCIONES_CONTACTO}
            itemKey="valor"
            itemLabel="etiqueta"
            name="tipo_contacto"
            value={state.filtros.tipo_contacto ?? ""}
            labelDefault="Todos"
            onChangeSelector={cambiarTipoContacto}
          />
        </div>

        {/* El componente de fechas ya existe (spec 016 le arregló los rótulos) */}
        <div className="pagina_anuncios_fechas">
          <FiltroFechas
            fechaDesde={state.filtros.fecha_desde ?? ""}
            fechaHasta={state.filtros.fecha_hasta ?? ""}
            onDesdeChange={(e) => cambiarFecha("fecha_desde", e)}
            onHastaChange={(e) => cambiarFecha("fecha_hasta", e)}
          />
        </div>

        {hayFiltros && (
          <button
            type="button"
            className="pagina_anuncios_limpiar"
            onClick={limpiarFiltros}
          >
            <LuX size={14} />
            Limpiar filtros
          </button>
        )}
      </div>

      <ListadoAnuncios
        filas={state.listado}
        filtros={state.filtros}
        carga={state.carga.listado}
        contadorPagina={state.paginacion.contadorPagina}
        error={state.error.listado}
        onCambioPagina={cachearPagina}
        onModificar={abrirModificacion}
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
            aria-labelledby="form_anuncio_titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <FormularioAnuncio
              formulario={state.formulario}
              media={state.media}
              anuncioEnEdicion={state.anuncioEnEdicion}
              empresas={state.empresas}
              error={state.error.formulario}
              carga={state.carga.formulario}
              metodo={state.metodo}
              cachearFormulario={cachearFormulario}
              cambiarMedia={cambiarMedia}
              quitarMedia={quitarMedia}
              postAnuncio={postAnuncio}
              putAnuncio={putAnuncio}
              onCerrar={cerrarFormulario}
            />
          </div>
        </div>
      )}

      {/* ==============================================================
          CONFIRMACIÓN DE BAJA — es FÍSICA: borra el archivo de R2
          ============================================================== */}
      {state.modal.eliminar && state.anuncioAEliminar && (
        <div className="admin_modal_fondo" onClick={cerrarEliminar}>
          <div
            ref={refEliminar}
            className="admin_modal admin_modal--compacto"
            role="alertdialog"
            aria-modal="true"
            aria-label="Eliminar anuncio"
            onClick={(e) => e.stopPropagation()}
          >
            <EliminarVentana<FilaAnuncio>
              data={state.anuncioAEliminar}
              accion={`Eliminar el anuncio "${state.anuncioAEliminar.titulo}"`}
              // Acá sí es real: se borra el archivo de R2
              nota="Se borra el anuncio y su archivo de imagen o video. No se puede deshacer."
              mensaje={state.error.eliminar}
              cargando={state.carga.eliminar}
              onSi={deleteAnuncio}
              onCancelar={cerrarEliminar}
            />
          </div>
        </div>
      )}
    </section>
  );
};
