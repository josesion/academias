import { useEffect } from "react";

import { TarjetasNormales } from "../../../componentes/TarjetasNormales/TarjetaNormali";
import { MovientoCaja } from "../../../componentes/MovimientoCaja/MovientoCaja";
import { PanelMetodoPago } from "../../../componentes/MetodoPago/PanelMetodoPago";
import { Boton } from "../../../componentes/Boton/Boton";
import { AperturaCaja } from "../../../componentes/AperturaCaja/AperturaCaja";
import { AnimacionAperturaExitosa } from "../../../componentes/animacionAperturaCaja/AnimacionApertura";
import { AnimacionCierreExitoso } from "../../../componentes/animacionCierreCaja/CierreAnimacionCaja";
import { CajaVaciaAnimation } from "../../../componentes/animacionDetalle/detalleVacio";
import { CierreCaja } from "../../../componentes/CierreCaja/cierreCaja";
import { InformeDetalleCaja } from "../../../componentes/Informes/DetallesCaja";

import { CompoIngEgr } from "../../../componentes/CompoIngEgr/CompoIngEgr";

// logica -----
import { cajasCongif } from "../../../hookNegocios/caja.usuario";

// estilos -----
import { FcStatistics } from "react-icons/fc";
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

  return (
    <div className="caja_arqueo_grid">
      {/* 1. MODALES (Se mantienen igual) */}

      {state.modalAnimacionesApertura && (
        <div className="formulario_overlay">
          <AnimacionAperturaExitosa />
        </div>
      )}

      {state.modalAnimaciones && (
        <div className="formulario_overlay">
          <AnimacionCierreExitoso />
        </div>
      )}

      {state.modalesCaja.apertura && (
        <div className="formulario_overlay">
          <AperturaCaja
            listadoCuentasActivas={state.listadoCuentasActivas}
            aperturaDetalle={state.aperturaDetalle}
            onChangeMontoDinamico={cachearMontoIniciales}
            onAbrirCaja={handleAbrirCaja}
            onCancelar={handleAbrirCajaModalCerrar}
            enviado={state.enviando}
            errorGenerico={state.errorGenerico}
          />
        </div>
      )}

      {state.modalesCaja.cierre && (
        <div className="formulario_overlay">
          <CierreCaja
            metricasPanel={state.panelPrincipal}
            metricas={state.metricasCuentasCierre}
            montoRealFinal={state.montoRealFinal}
            onCambioMontos={handleCierreMontos}
            onCancelar={handleCerrarCaja}
            onCerrar={handleCerrarModalCerrar}
            onCambioObservaciones={hanldeObsevacionesCierre}
          />
        </div>
      )}

      {state.modalesEgresoIngreso && (
        <div className="formulario_overlay">
          <CompoIngEgr
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
            tipos_pago={state.listadoCuentasActivas ?? cuentasVacias}
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

      {/* 2. CABECERA */}
      <header className="caja_header">
        <div className="titulo_grupo">
          <h1>
            Gestión de Caja <FcStatistics />
          </h1>
          <span className={`status_pill ${state.estadoCaja}`}>
            {state.estadoCaja === "abierta" ? "Caja Activa" : "Caja Cerrada"}
          </span>
        </div>
        <div className="acciones_principales">
          <Boton
            clase={state.estadoCaja === "abierta" ? "cancelar" : "agregar"}
            texto={
              state.estadoCaja === "abierta" ? "Cerrar Caja" : "Abrir Caja"
            }
            onClick={handleEstadosCaja}
          />
        </div>
      </header>

      {/* 3. TARJETAS DE RESUMEN */}
      <section className="caja_resumen_cards">
        <TarjetasNormales
          titulo="Monto Inicial"
          monto={state.panelPrincipal?.[0]?.monto_inicial ?? 0}
          claseColor="azul"
        />
        <TarjetasNormales
          titulo="Ingresos (+)"
          monto={state.panelPrincipal?.[0]?.total_ingresos || 0}
          claseColor="verde"
        />
        <TarjetasNormales
          titulo="Egresos (-)"
          monto={state.panelPrincipal?.[0]?.total_egresos || 0}
          claseColor="rojo"
        />
        <TarjetasNormales
          titulo="Flujo Sesión"
          monto={state.panelPrincipal?.[0]?.flujo_dia || 0}
          claseColor="negro"
        />
        <TarjetasNormales
          titulo="Balance Neto"
          monto={state.panelPrincipal?.[0]?.balance_neto || 0}
          claseColor="negro"
        />
      </section>
      {/* 4. SIDEBAR: METODOS DE PAGO */}

      {/* 5. HISTORIAL DE MOVIMIENTOS */}
      <main className="caja_historial">
        <div className="historial_header">
          <h3>Movimientos del Turno</h3>
          <div className="btn_operativos">
            <Boton
              clase="agregar"
              texto="+ Ingreso"
              onClick={handleAbrirIngreso}
            />
            <Boton
              clase="eliminar"
              texto="- Egreso"
              onClick={handleAbrirEgreso}
            />
          </div>
        </div>

        {state.modalInformeDetalle && (
          <div className="formulario_overlay">
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
              // Nueva prop sumada:
              nombre_alumno_vinculado={
                state.informeDetalle.nombre_alumno_vinculado
              }
              onCerrarModal={hanldeCerrarInforme}
            />
          </div>
        )}

        <div className="scroll_movimientos">
          <MovientoCaja
            movimientos={movimientos}
            infoDetalle={handleCachearDetalle}
          />
          {movimientos.length > 0 && (
            <div ref={lastElementRef} className="scroll_sensor">
              {scrollState?.loading && <p>Cargando...</p>}
              {!scrollState?.hasMore}
            </div>
          )}
          {movimientos.length === 0 && !scrollState?.loading && (
            <CajaVaciaAnimation />
          )}
        </div>

        <aside className="caja_sidebar_pagos">
          <PanelMetodoPago cuentas={state.metricasTipoCuentas} />
        </aside>
      </main>
    </div>
  );
};
