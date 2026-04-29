import { TarjetasNormales } from "../../../componentes/TarjetasNormales/TarjetaNormali";
import { MovientoCaja } from "../../../componentes/MovimientoCaja/MovientoCaja";
import { PanelMetodoPago } from "../../../componentes/MetodoPago/PanelMetodoPago";
import { Boton } from "../../../componentes/Boton/Boton";
import { AperturaCaja } from "../../../componentes/AperturaCaja/AperturaCaja";
import { CompoVerificacion } from "../../../componentes/CompoVerificacion/CompoVerificacion";
import { CajaVaciaAnimation } from "../../../componentes/animacionDetalle/detalleVacio";
import { CierreCaja } from "../../../componentes/CierreCaja/cierreCaja";

import { CompoIngEgr } from "../../../componentes/CompoIngEgr/CompoIngEgr";

// logica -----
import { cajasCongif } from "../../../hookNegocios/caja.usuario";

// estilos -----
import { FcStatistics } from "react-icons/fc";
import "./caja.css";

export const CajaArqueo = () => {
  const {
    modalApertura,
    modalCierre,
    modalEgresoIngreso,
    enviando,
    estadoCaja,
    errorGenerico,
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
    movimientoExtraordinario,
    listadoExtraordinario,
    handleAbrirEgreso,
    handleAbrirIngreso,
    handleMemoChange,
    metricasTipoCuentas,
    listadoCuentasActivas,
    panelPrincial,
    aperturaDetalle,
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

  return (
    <div className="caja_arqueo_grid">
      {/* 1. MODALES (Se mantienen igual) */}
      {modalApertura && (
        <div className="formulario_overlay">
          <AperturaCaja
            listadoCuentasActivas={listadoCuentasActivas}
            aperturaDetalle={aperturaDetalle}
            onChangeMontoDinamico={cachearMontoIniciales}
            onAbrirCaja={handleAbrirCaja}
            onCancelar={handleAbrirCajaModalCerrar}
            enviado={enviando}
            errorGenerico={errorGenerico}
          />
        </div>
      )}

      {modalCierre && (
        <div className="formulario_overlay">
          <CierreCaja />
        </div>
      )}

      {modalEgresoIngreso && (
        <div className="formulario_overlay">
          <CompoIngEgr
            titulo={movimientoExtraordinario.tipo}
            categorias={
              listadoExtraordinario ? listadoExtraordinario : categoriasVacias
            }
            itemKey="id_categoria"
            itemLabel="nombre_categoria"
            name="id_categoria"
            onChangeSelector={handleMovimientoExtraordinarioChange}
            labelDefault="Seleccionar Categoría"
            tipos_pago={listadoCuentasActivas ?? cuentasVacias}
            itemLabelTipo="nombre_cuenta"
            itemKeyTipo="id_cuenta"
            nameTipoPago="id_cuenta"
            onChanceSelectorTipo={handleTipoPagoChange}
            onClickCancelar={handleCerrarModalEgrIng}
            onClickRegistrar={handRegistarMovimientoExtraordinario}
            montoValue={movimientoExtraordinario.monto.toString()}
            onChangeInput={handleMontoChange}
            onChangeTextArea={handleMemoChange}
            valueTextArea={movimientoExtraordinario.descripcion || ""}
            errorMensaje={errorGenerico}
          />
        </div>
      )}

      {/* 2. CABECERA */}
      <header className="caja_header">
        <div className="titulo_grupo">
          <h1>
            Gestión de Caja <FcStatistics />
          </h1>
          <span className={`status_pill ${estadoCaja}`}>
            {estadoCaja === "abierta" ? "Caja Activa" : "Caja Cerrada"}
          </span>
        </div>
        <div className="acciones_principales">
          <Boton
            clase={estadoCaja === "abierta" ? "cancelar" : "agregar"}
            texto={estadoCaja === "abierta" ? "Cerrar Caja" : "Abrir Caja"}
            onClick={handleEstadosCaja}
          />
        </div>
      </header>

      {/* 3. TARJETAS DE RESUMEN */}
      <section className="caja_resumen_cards">
        <TarjetasNormales
          titulo="Monto Inicial"
          monto={panelPrincial?.[0]?.monto_inicial ?? 0}
          claseColor="azul"
        />
        <TarjetasNormales
          titulo="Ingresos (+)"
          monto={panelPrincial?.[0]?.total_ingresos || 0}
          claseColor="verde"
        />
        <TarjetasNormales
          titulo="Egresos (-)"
          monto={panelPrincial?.[0]?.total_egresos || 0}
          claseColor="rojo"
        />
        <TarjetasNormales
          titulo="Flujo Sesión"
          monto={panelPrincial?.[0]?.flujo_dia || 0}
          claseColor="negro"
        />
        <TarjetasNormales
          titulo="Balance Neto"
          monto={panelPrincial?.[0]?.balance_neto || 0}
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

        <div className="scroll_movimientos">
          <MovientoCaja movimientos={movimientos} />
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
          <PanelMetodoPago cuentas={metricasTipoCuentas} />
        </aside>
      </main>
    </div>
  );
};
