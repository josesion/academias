import { TarjetasNormales } from "../../../componentes/TarjetasNormales/TarjetaNormali";
import { MovientoCaja } from "../../../componentes/MovimientoCaja/MovientoCaja";
import { PanelMetodoPAgo } from "../../../componentes/MetodoPago/PanelMetodoPago";
import { Boton } from "../../../componentes/Boton/Boton";
import { AperturaCaja } from "../../../componentes/AperturaCaja/AperturaCaja";
import { CompoVerificacion } from "../../../componentes/CompoVerificacion/CompoVerificacion";

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
    montoInicial,
    totalIngresos,
    totalEgresos,
    flujoDelDia,
    totalEfectivo,
    totalTransferencia,
    totalDebito,
    totalCredito,
    enviando,
    estadoCaja,
    errorGenerico,
    cachearMontoInicial,
    apertura,
    handleCerrarCaja,
    handleCerrarModalCerrar,
    handleEstadosCaja,
    handleAbrirCajaModalCerrar,
    handleAbrirCaja,
    lastElementRef,
    movimientos,
    scrollState,
    tipo_pago,
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
  } = cajasCongif();

  interface Categoria {
    id_categoria: number;
    nombre_categoria: string;
    tipo_movimiento: string;
  }

  // Categoria para cargar si es q no llega nada
  const categoriasVacias: Categoria[] = [
    {
      id_categoria: 0,
      nombre_categoria: "Sin Cargar",
      tipo_movimiento: "ingreso",
    },
  ];

  return (
    <div className="caja_arqueo_contenedor">
      <div style={{ height: "var(--alto-menu-superior)", width: "100%" }}></div>
      {modalApertura && (
        <div className="formulario_overlay">
          <AperturaCaja
            onCancelar={handleAbrirCajaModalCerrar}
            onChangeMontoInicial={cachearMontoInicial}
            onAbrirCaja={handleAbrirCaja}
            monto_inicial={apertura.monto_inicial}
            enviado={enviando}
            errorGenerico={errorGenerico}
          />
        </div>
      )}

      {modalCierre && (
        <div className="formulario_overlay">
          <CompoVerificacion
            texto="cerrar caja"
            onConfirmar={handleCerrarCaja}
            onCancelar={handleCerrarModalCerrar}
            enviando={enviando}
          />
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
            tipos_pago={tipo_pago}
            itemLabelTipo="nombre_tipo_pago"
            itemKeyTipo="nombre_tipo_pago"
            nameTipoPago="metodo_pago"
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

      <div className="caja_arqueo_cabecera">
        <p className="caja_arqueo_titulo">
          Gestion de Caja <FcStatistics />
          <p>({estadoCaja === "abierta" ? "Abierta" : "Cerrada"})</p>
        </p>

        <div className="caja_arqueo_cabecera_botones">
          <Boton
            clase={estadoCaja === "abierta" ? "cancelar" : "agregar"}
            logo={estadoCaja === "abierta" ? "Cancel" : "Edit"}
            texto={estadoCaja === "abierta" ? "Cerrar Caja" : "Abrir Caja"}
            onClick={handleEstadosCaja}
          />
          <Boton
            clase="agregar"
            texto=" + Ingreso / Extras"
            onClick={handleAbrirIngreso}
          />
          <Boton
            clase="eliminar"
            texto=" - Egresos / Gastos"
            onClick={handleAbrirEgreso}
          />
        </div>
      </div>

      <div className="caja_arqueo_info_contenedor">
        <TarjetasNormales
          titulo="Monto Inicial"
          monto={montoInicial}
          claseColor="azul"
        />
        <TarjetasNormales
          titulo="Ingresos"
          monto={totalIngresos}
          claseColor="verde"
        />
        <TarjetasNormales
          titulo="Egresos"
          monto={totalEgresos}
          claseColor="rojo"
        />
        <TarjetasNormales
          titulo="Flujo del Dia"
          monto={flujoDelDia}
          claseColor="negro"
        />
      </div>

      <div className="caja_arqueo_metricas">
        <div className="caja_arqueo_metricas_detalles">
          <p>Movimientos del Dia</p>

          <MovientoCaja movimientos={movimientos} />

          {/* Solo mostramos el sensor y los mensajes si hay al menos un movimiento */}
          {movimientos.length > 0 && (
            <div
              ref={lastElementRef}
              style={{ height: "40px", textAlign: "center", marginTop: "10px" }}
            >
              {scrollState?.loading && <p>Cargando más movimientos...</p>}

              {scrollState?.hasMore === false && (
                <p style={{ color: "gray" }}>— Fin del historial —</p>
              )}
            </div>
          )}

          {/*  Un mensaje si la caja está realmente vacía */}
          {movimientos.length === 0 && !scrollState?.loading && (
            <p
              style={{ textAlign: "center", color: "gray", marginTop: "20px" }}
            >
              No hay movimientos registrados hoy.
            </p>
          )}
        </div>
        <div className="caja_arqueo_metricas_metodo_pago">
          <p>Resumens Metodo Pago</p>
          <PanelMetodoPAgo
            totales={{
              efectivo: totalEfectivo,
              transferencia: totalTransferencia,
              credito: totalCredito,
              debito: totalDebito,
            }}
          />
        </div>
      </div>
    </div>
  );
};
