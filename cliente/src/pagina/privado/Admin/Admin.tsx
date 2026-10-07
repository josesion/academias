import { setAbmSuspcripciones } from "../../../hookNegocios/suscripcion";
import { Paginacion } from "../../../componentes/generales/Paginacion/Paginacion";
import { ListadoSuscripciones } from "../../../componentes/Administrador/ListadoSusp/ListadoSusp";
import { Boton } from "../../../componentes/generales/Boton/Boton";
import { FormularioSuscripciones } from "../../../componentes/Administrador/formularioSuso/SuscripcionesFormulario";
import { EstadoSuscripcion } from "../../../componentes/Administrador/EstadoSusp/EstadoSuscripcion";
import { SelectorOpt } from "../../../componentes/generales/CompSelecObt/SelectorOpt";
import { TarjetaMetrica } from "../../../componentes/Metricas/TajetaMetricas/TarjetaMetrica";

import "./admin.css";

/** Opción del filtro de estado: `valor` es el que existe en la BD */
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
  } = setAbmSuspcripciones();

  const { pagina, contadorPagina } = state.paginacion;
  const errorListado = state.error.listado;

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

      {/* ==============================================================
          MODAL DEL FORMULARIO — abierto/cerrado por el reducer
          ============================================================== */}
      {state.modal.formulario && (
        <div className="admin_modal_fondo" onClick={cerrarFormulario}>
          <div
            className="admin_modal"
            role="dialog"
            aria-modal="true"
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
            className="admin_modal admin_modal--compacto"
            role="dialog"
            aria-modal="true"
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
