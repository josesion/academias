import { useEffect, useId } from "react";

import { TarjetasNormales } from "../../../componentes/generales/TarjetasNormales/TarjetaNormali";
import { MovientoCaja } from "../../../componentes/Caja/MovimientoCaja/MovientoCaja";
import { PanelMetodoPago } from "../../../componentes/Caja/MetodoPago/PanelMetodoPago";
import { Boton } from "../../../componentes/generales/Boton/Boton";
import { AperturaCaja } from "../../../componentes/Caja/AperturaCaja/AperturaCaja";
import { AnimacionAperturaExitosa } from "../../../componentes/Caja/animacionAperturaCaja/AnimacionApertura";
import { AnimacionCierreExitoso } from "../../../componentes/Caja/animacionCierreCaja/CierreAnimacionCaja";
import { CajaVaciaAnimation } from "../../../componentes/Caja/animacionDetalle/detalleVacio";
import { CierreCaja } from "../../../componentes/Caja/CierreCaja/cierreCaja";
import { InformeDetalleCaja } from "../../../componentes/Informes/DetallesCaja";

import { CompoIngEgr } from "../../../componentes/Caja/CompoIngEgr/CompoIngEgr";

// logica -----
import { cajasCongif } from "../../../hookNegocios/caja.usuario";

// estilos -----
import { ChartColumn } from "lucide-react";
import "./caja.css";

export const CajaArqueo = () => {
  const {
    cachearMontoIniciales,
    handleCerrarCaja,
    handleCerrarModalCerrar,
    handleEstadosCaja,
    handleAbrirCajaModalCerrar,
    handleAbrirCaja,
    lastElementRef,
    movimientos,
    scrollState,
    handleMovimientoExtraordinarioChange,
    handleTipoPagoChange,
    handRegistarMovimientoExtraordinario,
    handleCerrarModalEgrIng,
    handleMontoChange,

    handleAbrirEgreso,
    handleAbrirIngreso,
    handleMemoChange,
    hanldeObsevacionesCierre,
    handleCierreMontos,
    handleCachearDetalle,
    hanldeCerrarInforme,
    sincronizarEstadoCaja,
    state,
  } = cajasCongif();

  interface Categoria {
    id_categoria: number;
    nombre_categoria: string;
    tipo_movimiento: string;
  }
  const categoriasVacias: Categoria[] = [
    {
      id_categoria: 0,
      nombre_categoria: "Sin Cargar",
      tipo_movimiento: "ingreso",
    },
  ];
  const cuentasVacias = [
    { id_cuenta: 0, nombre_cuenta: "Sin Cuentas", tipo_cuenta: "fisico" },
  ];
  // para sincronizar la caja ya que al navegar por la barra este no renderizaba bien el estado de caja
  useEffect(() => {
    sincronizarEstadoCaja();
  }, []);

  // IDs para ARIA
  const resumenId = useId();
  const historialId = useId();
  const metodosId = useId();

  // Carga global SOLO en primera carga (id_caja null) y datos críticos pendientes
  const cargandoGlobal = !state.dataCaja.id_caja && (
    state.carga.movimientos
    || state.carga.metricasTipoCuentas
    || state.carga.panelPrincipal
    || state.carga.cuentasActivas
  );

  return (
    // NO va `<main>` ni `role="main"`: el layout ya aporta el unico landmark
    // `main` de la pagina. Un segundo `main` anidado es invalido.
    <div className="caja_arqueo_grid">
      {/* Carga global inicial */}
      {cargandoGlobal && (
        <div className="carga-global" aria-live="polite" aria-busy="true">
          <div className="spinner" aria-hidden="true" />
          <span className="visually-hidden">Cargando gestión de caja...</span>
        </div>
      )}

      {/* 1. MODALES (Se mantienen igual) */}

      {state.modalAnimacionesApertura && (
        <div className="formulario_overlay" role="dialog" aria-modal="true" aria-label="Animación de apertura exitosa">
          <AnimacionAperturaExitosa aria-hidden="true" />
        </div>
      )}

      {state.modalAnimaciones && (
        <div className="formulario_overlay" role="dialog" aria-modal="true" aria-label="Animación de cierre exitoso">
          <AnimacionCierreExitoso aria-hidden="true" />
        </div>
      )}

      {state.modalesCaja.apertura && (
        <div className="formulario_overlay" role="dialog" aria-modal="true" aria-label="Apertura de caja">
          <AperturaCaja
            listadoCuentasActivas={state.listadoCuentasActivas}
            aperturaDetalle={state.aperturaDetalle}
            onChangeMontoDinamico={cachearMontoIniciales}
            onAbrirCaja={handleAbrirCaja}
            onCancelar={handleAbrirCajaModalCerrar}
            enviado={state.carga.aperturaCaja}
            errorGenerico={state.errorGenerico}
          />
        </div>
      )}

      {state.modalesCaja.cierre && (
        <div className="formulario_overlay" role="dialog" aria-modal="true" aria-label="Cierre de caja">
          <CierreCaja
            carga={state.carga.cierreCaja}
            metricasPanel={state.panelPrincipal}
            metricas={state.metricasCuentasCierre}
            montoRealFinal={state.montoRealFinal}
            onCambioMontos={handleCierreMontos}
            onCancelar={handleCerrarModalCerrar}
            onCerrar={handleCerrarCaja}
            onCambioObservaciones={hanldeObsevacionesCierre}
          />
        </div>
      )}

      {state.modalesEgresoIngreso && (
        <div className="formulario_overlay" role="dialog" aria-modal="true" aria-label="Registrar ingreso o egreso">
          <CompoIngEgr
            carga={state.carga.movimientosExtas}
            titulo={state.movimientoExtraordinario.tipo}
            categorias={
              state.listadoExtraordinario
                ? state.listadoExtraordinario
                : categoriasVacias
            }
            itemKey="id_categoria"
            itemLabel="nombre_categoria"
            name="id_categoria"
            onChangeSelector={handleMovimientoExtraordinarioChange}
            labelDefault="Seleccionar Categoría"
            tipos_pago={state.listadoCuentasSesion ?? cuentasVacias}
            itemLabelTipo="nombre_cuenta"
            itemKeyTipo="id_cuenta"
            nameTipoPago="id_cuenta"
            onChanceSelectorTipo={handleTipoPagoChange}
            onClickCancelar={handleCerrarModalEgrIng}
            onClickRegistrar={handRegistarMovimientoExtraordinario}
            montoValue={state.movimientoExtraordinario.monto.toString()}
            onChangeInput={handleMontoChange}
            onChangeTextArea={handleMemoChange}
            valueTextArea={state.movimientoExtraordinario.descripcion || ""}
            errorMensaje={state.errorGenerico}
          />
        </div>
      )}

      {state.modalInformeDetalle && (
        <div className="formulario_overlay" role="dialog" aria-modal="true" aria-label="Detalle de movimiento">
          <InformeDetalleCaja
            id_movimiento={state.informeDetalle.id_movimiento}
            tipo={state.informeDetalle.tipo}
            monto={state.informeDetalle.monto}
            usuario={state.informeDetalle.usuario}
            fecha={state.informeDetalle.fecha}
            hora={state.informeDetalle.hora}
            metodo_pago={state.informeDetalle.metodo_pago}
            observaciones={state.informeDetalle.observaciones}
            metodo={state.informeDetalle.metodo}
            nombre_alumno_vinculado={
              state.informeDetalle.nombre_alumno_vinculado
            }
            onCerrarModal={hanldeCerrarInforme}
          />
        </div>
      )}

      {/* 2. CABECERA */}
      <header className="caja_header">
        <div className="titulo_grupo">
          <h1>
            Gestión de Caja <ChartColumn size={26} aria-hidden="true" />
          </h1>
          <span className={`status_pill ${state.estadoCaja}`} role="status" aria-live="polite">
            {state.estadoCaja === "abierta" ? "Caja Activa" : "Caja Cerrada"}
          </span>
        </div>
        <div className="acciones_principales">
          <Boton
            clase={state.estadoCaja === "abierta" ? "cancelar" : "agregar"}
            logo={state.estadoCaja === "abierta" ? "Edit" : "Add"}
            texto={
              state.estadoCaja === "abierta" ? "Cerrar Caja" : "Abrir Caja"
            }
            onClick={handleEstadosCaja}
          />
        </div>
      </header>

      {/* 3. TARJETAS DE RESUMEN
          El `role="list"` va DIRECTO en el section (que es el grid): si se
          envuelve en un <div> intermedio, ese div pasa a ser el unico hijo del
          grid y las 5 tarjetas se apilan adentro, sin importar las media
          queries. */}
      <section
        aria-labelledby={resumenId}
        className="caja_resumen_cards"
        role="list"
        aria-label="Resumen de caja"
      >
        <TarjetasNormales
          titulo="Monto Inicial"
          monto={state.panelPrincipal?.[0]?.monto_inicial ?? 0}
          claseColor="azul"
        />
        <TarjetasNormales
          titulo="Ingresos (+)"
          monto={state.panelPrincipal?.[0]?.total_ingresos ?? 0}
          claseColor="verde"
        />
        <TarjetasNormales
          titulo="Egresos (-)"
          monto={state.panelPrincipal?.[0]?.total_egresos ?? 0}
          claseColor="rojo"
        />
        <TarjetasNormales
          titulo="Flujo Sesión"
          monto={state.panelPrincipal?.[0]?.flujo_dia ?? 0}
          claseColor="negro"
        />
        <TarjetasNormales
          titulo="Balance Neto"
          monto={state.panelPrincipal?.[0]?.balance_neto ?? 0}
          claseColor="negro"
        />
      </section>

      {/* 4 y 5. HISTORIAL DE MOVIMIENTOS + SIDEBAR DE MÉTODOS DE PAGO, en un mismo grid */}
      <section aria-labelledby={historialId} className="caja_historial_wrapper">
        <div className="historial_header">
          <h2 id={historialId}>Movimientos del Turno</h2>
          <div className="btn_operativos">
            <Boton
              clase="agregar"
              texto="+ Ingreso"
              onClick={handleAbrirIngreso}
              logo={"Add"}
            />
            <Boton
              clase="eliminar"
              texto="- Egreso"
              onClick={handleAbrirEgreso}
              logo={"Delete"}
            />
          </div>
        </div>

        <div className="historial_contenido" role="region" aria-label="Lista de movimientos">
          <div className="scroll_movimientos">
            <MovientoCaja
              movimientos={movimientos ?? []}
              infoDetalle={handleCachearDetalle}
            />
            {movimientos.length > 0 && (
              <div ref={lastElementRef} className="scroll_sensor" aria-hidden="true">
                {scrollState?.loading && <p role="status" aria-live="polite">Cargando...</p>}
                {!scrollState?.hasMore && <p role="status">Fin de la lista</p>}
              </div>
            )}
            {movimientos.length === 0 && !scrollState?.loading && (
              <CajaVaciaAnimation aria-hidden="true" />
            )}
          </div>
        </div>

        <aside className="caja_sidebar_pagos" aria-labelledby={metodosId}>
          <h3 id={metodosId} className="visually-hidden">Métodos de pago</h3>
          <PanelMetodoPago cuentas={state.metricasTipoCuentas ?? []} />
        </aside>
      </section>
    </div>
  );
};
