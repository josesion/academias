import { setAbmSuspcripciones } from "../../../hookNegocios/suscripcion";
import { useModalAccesible } from "../../../hooks/useModalAccesible";
import { Paginacion } from "../../../componentes/generales/Paginacion/Paginacion";
import { ListadoSuscripciones } from "../../../componentes/Administrador/ListadoSusp/ListadoSusp";
import { ListadoLogs } from "../../../componentes/Administrador/ListadoLogs/ListadoLogs";
import { Boton } from "../../../componentes/generales/Boton/Boton";
import { FormularioSuscripciones } from "../../../componentes/Administrador/formularioSuso/SuscripcionesFormulario";
import { EstadoSuscripcion } from "../../../componentes/Administrador/EstadoSusp/EstadoSuscripcion";
import { SelectorOpt } from "../../../componentes/generales/CompSelecObt/SelectorOpt";
import { TarjetaMetrica } from "../../../componentes/Metricas/TajetaMetricas/TarjetaMetrica";

import "./admin.css";

/** Opción de un filtro del panel: `valor` es el que viaja al server */
interface OpcionEstado {
  valor: string;
  etiqueta: string;
}

// "Todos" no está acá: lo aporta SelectorOpt como labelDefault (value="")
const ESTADOS_SUSCRIPCION: OpcionEstado[] = [
  { valor: "activo", etiqueta: "Activos" },
  { valor: "vencido", etiqueta: "Vencidos" },
  { valor: "anulado", etiqueta: "Anulados" },
];

// Niveles de `logs_eventos` (enum del schema del server). "" = "Todos"
const NIVELES_LOG: OpcionEstado[] = [
  { valor: "error", etiqueta: "Error" },
  { valor: "warn", etiqueta: "Advertencia" },
  { valor: "info", etiqueta: "Info" },
];

// Origenes de `logs_eventos` (enum del schema del server). "" = "Todos"
const ORIGENES_LOG: OpcionEstado[] = [
  { valor: "peticion", etiqueta: "Petición" },
  { valor: "correo", etiqueta: "Correo" },
  { valor: "cron", etiqueta: "Cron" },
  { valor: "arranque", etiqueta: "Arranque" },
  { valor: "servidor", etiqueta: "Servidor" },
];

// `resuelto` viaja como número: "" = "Todos" (el hook lo pasa a undefined)
const ESTADO_REVISADO_LOG: OpcionEstado[] = [
  { valor: "0", etiqueta: "Pendientes" },
  { valor: "1", etiqueta: "Revisados" },
];

export const DashboardAdministrador = () => {
  const {
    state,
    cachearPagina,
    cambiarFiltroEstado,
    abrirFormulario,
    abrirFormularioAnular,
    cerrarFormulario,
    cerrarFormularioAnular,
    cachearFormulario,
    postSuscripcion,
    anularSuscripcion,
    putSuscripcion,
    cambiarFiltroLogs,
    cachearPaginaLogs,
    marcarLog,
  } = setAbmSuspcripciones();

  const { pagina, contadorPagina } = state.paginacion;
  const errorListado = state.error.listado;

  // Teclado de los 2 modales de esta página (spec 014): Escape cierra y el
  // foco entra, queda atrapado y vuelve al botón que los abrió
  const { refDialog: refFormulario } = useModalAccesible({
    abierto: state.modal.formulario,
    onCerrar: cerrarFormulario,
  });

  const { refDialog: refAnulacion } = useModalAccesible({
    abierto: state.modal.estado,
    onCerrar: cerrarFormularioAnular,
  });

  return (
    <section className="admin_pagina">
      <header className="admin_cabecera">
        <div className="admin_cabecera_titulos">
          <span className="admin_etiqueta">Administración</span>

          <h1 className="admin_titulo">Suscripciones</h1>

          <p className="admin_descripcion">
            Plan contratado, fechas de vigencia y estado de cada academia.
          </p>
        </div>

        <div className="admin_cabecera_acciones">
          {/* Filtro de estado del listado: controlado por filtroSuscripciones.estado.
              "Todos" (value="") se manda como estado= vacío → server lo lee como sin filtro */}
          <SelectorOpt
            categorias={ESTADOS_SUSCRIPCION}
            itemKey="valor"
            itemLabel="etiqueta"
            onChangeSelector={cambiarFiltroEstado}
            name="estado"
            value={state.filtroSuscripciones.estado}
            labelDefault="Todos"
          />

          <Boton
            clase="editar"
            logo="Add"
            texto="Agregar suscripción"
            type="button"
            onClick={abrirFormulario}
          />
        </div>
      </header>

      {/* ==============================================================
          MÉTRICAS — bloque 5 del reducer (GET /api/metricas_simples)
          Se refrescan solas: el alta y la anulación mandan ACTUALIZAR
          ============================================================== */}
      <section className="admin_metricas" aria-label="Métricas de suscripciones">
        <TarjetaMetrica
          carga={state.carga.metricas}
          tipo="activos"
          titulo="Suscripciones vigentes"
          valor={state.metricas?.suscripciones_vigentes ?? 0}
        />

        <TarjetaMetrica
          carga={state.carga.metricas}
          tipo="por_vencer"
          titulo="Por vencer"
          valor={state.metricas?.suscripciones_por_vencer ?? 0}
          leyenda="Próximos 7 días"
        />

        <TarjetaMetrica
          carga={state.carga.metricas}
          tipo="vencidos"
          titulo="Vencidas"
          valor={state.metricas?.suscripciones_vencidas ?? 0}
        />

        <TarjetaMetrica
          carga={state.carga.metricas}
          tipo="caja"
          titulo="Total del mes"
          valor={state.metricas?.total_mes ?? 0}
          leyenda="Planes inscritos"
        />
      </section>

      {state.error.metricas && (
        <p className="admin_error" role="alert">
          {state.error.metricas}
        </p>
      )}

      {errorListado && (
        <p className="admin_error" role="alert">
          {errorListado}
        </p>
      )}

      {/* ==============================================================
          LOS DOS PANELES — suscripciones (izq.) y bitácora (der.)

          Cada `.admin_panel` es un contenedor de container queries: sus filas
          se rearman según el ANCHO DEL PANEL, no el de la pantalla. Con
          espacio van al lado; si no, `.admin_paneles` pasa a una columna y
          la bitácora queda abajo.
          ============================================================== */}
      <div className="admin_paneles">
        {/* ---------- Panel 1: suscripciones ---------- */}
        <div className="admin_panel">
          <div className="admin_listado">
            <ListadoSuscripciones
              suscripciones={state.listadoSuspcripcop ?? []}
              carga={state.carga.listado}
              onEstado={abrirFormularioAnular}
            />
          </div>

          <div className="admin_pie">
            <Paginacion
              paginaActual={pagina}
              contadorPagina={contadorPagina}
              onPaginaCambiada={cachearPagina}
            />
          </div>
        </div>

        {/* ---------- Panel 2: bitácora del sistema ---------- */}
        <div className="admin_panel">
          <div className="admin_listado">
            {/* Filtros de la bitácora: 3 select + fecha + ruta. "Todos" viaja
                como valor vacío y el hook lo traduce a "sin filtro" */}
            <div className="admin_filtros_logs">
              <SelectorOpt
                categorias={NIVELES_LOG}
                itemKey="valor"
                itemLabel="etiqueta"
                onChangeSelector={cambiarFiltroLogs}
                name="nivel"
                value={state.filtroLogs.nivel}
                labelDefault="Todos"
              />

              <SelectorOpt
                categorias={ORIGENES_LOG}
                itemKey="valor"
                itemLabel="etiqueta"
                onChangeSelector={cambiarFiltroLogs}
                name="origen"
                value={state.filtroLogs.origen}
                labelDefault="Todos"
              />

              <SelectorOpt
                categorias={ESTADO_REVISADO_LOG}
                itemKey="valor"
                itemLabel="etiqueta"
                onChangeSelector={cambiarFiltroLogs}
                name="resuelto"
                value={state.filtroLogs.resuelto ?? ""}
                labelDefault="Todos"
              />

              {/* El server exige el formato AAAA-MM-DD: lo da input[type=date] */}
              <input
                className="input_caja admin_input_fecha"
                type="date"
                name="fecha_desde"
                value={state.filtroLogs.fecha_desde ?? ""}
                onChange={cambiarFiltroLogs}
                aria-label="Eventos desde la fecha"
              />

              {/* La ruta se busca con LIKE: es una búsqueda parcial */}
              <input
                className="input_caja admin_input_ruta"
                type="text"
                name="ruta"
                value={state.filtroLogs.ruta ?? ""}
                onChange={cambiarFiltroLogs}
                placeholder="Buscar por ruta"
                aria-label="Buscar por ruta"
              />
            </div>

            <ListadoLogs
              eventos={state.listadoLogs ?? []}
              carga={state.carga.logs}
              error={state.error.logs}
              onMarcar={marcarLog}
            />
          </div>

          <div className="admin_pie">
            <Paginacion
              paginaActual={state.paginacionLogs.pagina}
              contadorPagina={state.paginacionLogs.contadorPagina}
              onPaginaCambiada={cachearPaginaLogs}
            />
          </div>
        </div>
      </div>

      {/* ==============================================================
          MODAL DEL FORMULARIO — abierto/cerrado por el reducer.
          Escape, foco inicial, foco devuelto y trampa de foco los
          aporta `useModalAccesible` (spec 014)
          ============================================================== */}
      {state.modal.formulario && (
        <div className="admin_modal_fondo" onClick={cerrarFormulario}>
          <div
            ref={refFormulario}
            className="admin_modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form_susp_titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <FormularioSuscripciones
              metodo={state.metodo}
              formulario={state.formulario}
              // si falla la carga de las opciones, el aviso se ve igual
              error={state.error.formulario ?? state.error.opciones}
              carga={state.carga.formulario}
              escuelas={state.opciones?.escuelas ?? []}
              planes={state.opciones?.planes_saas ?? []}
              cachearFormulario={cachearFormulario}
              postSuscripcion={postSuscripcion}
              putSuscripcion={putSuscripcion}
              onCerrar={cerrarFormulario}
            />
          </div>
        </div>
      )}

      {/* ==============================================================
          MODAL DE ANULACIÓN — abierto/cerrado por reducer (modal.estado)
          ============================================================== */}
      {state.modal.estado && (
        <div className="admin_modal_fondo" onClick={cerrarFormularioAnular}>
          <div
            ref={refAnulacion}
            className="admin_modal admin_modal--compacto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="estado_susp_titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <EstadoSuscripcion
              razonSocial={state.seleccionada?.razon_social ?? ""}
              descripcionPlan={state.seleccionada?.descripcion_plan ?? ""}
              carga={state.carga.estado}
              error={state.error.estado}
              anularSuscripcion={anularSuscripcion}
              onCerrar={cerrarFormularioAnular}
            />
          </div>
        </div>
      )}
    </section>
  );
};
