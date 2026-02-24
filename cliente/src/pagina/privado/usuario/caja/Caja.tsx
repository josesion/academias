import { TarjetasNormales } from "../../../../componentes/TarjetasNormales/TarjetaNormali";
import { MovientoCaja } from "../../../../componentes/MovimientoCaja/MovientoCaja";
import { PanelMetodoPAgo } from "../../../../componentes/MetodoPago/PanelMetodoPago";
import { Boton } from "../../../../componentes/Boton/Boton";
import { AperturaCaja } from "../../../../componentes/AperturaCaja/AperturaCaja";
import { CompoVerificacion } from "../../../../componentes/CompoVerificacion/CompoVerificacion";

import { CompoIngEgr } from "../../../../componentes/CompoIngEgr/CompoIngEgr";

// logica -----
import { cajasCongif } from "../../../../hookNegocios/caja.usuario";

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
    handleMovimientoExtraordinarioChange,
    handRegistarMovimientoExtraordinario,
    handleCerrarModalEgrIng,
    handleMontoChange,
    movimientoExtraordinario,
    handleAbrirEgreso,
    handleAbrirIngreso,
    handleMemoChange,
  } = cajasCongif();

  interface Categoria {
    id_categoria: number;
    nombre_categoria: string;
    tipo_movimiento: string;
  }

  // Solo Ingresos
  const categoriasIngresos: Categoria[] = [
    {
      id_categoria: 8,
      nombre_categoria: "Inscripciones",
      tipo_movimiento: "ingreso",
    },
    {
      id_categoria: 12,
      nombre_categoria: "Venta Uniformes",
      tipo_movimiento: "ingreso",
    },
  ];

  // Solo Egresos
  const categoriasEgresos: Categoria[] = [
    {
      id_categoria: 10,
      nombre_categoria: "luz",
      tipo_movimiento: "egreso",
    },
    {
      id_categoria: 9,
      nombre_categoria: "Limpieza",
      tipo_movimiento: "egreso",
    },
    {
      id_categoria: 11,
      nombre_categoria: "Alquiler",
      tipo_movimiento: "egreso",
    },
  ];

  return (
    <div className="caja_arqueo_contenedor">
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
            titulo={movimientoExtraordinario.estado}
            categorias={
              movimientoExtraordinario.estado === "ingreso"
                ? categoriasIngresos
                : categoriasEgresos
            }
            itemKey="id_categoria"
            itemLabel="nombre_categoria"
            name="id_categoria"
            onChangeSelector={handleMovimientoExtraordinarioChange}
            labelDefault="Seleccionar Categoría"
            onClickCancelar={handleCerrarModalEgrIng}
            onClickRegistrar={handRegistarMovimientoExtraordinario}
            montoValue={movimientoExtraordinario.monto.toString()}
            onChangeInput={handleMontoChange}
            onChangeTextArea={handleMemoChange}
            valueTextArea={movimientoExtraordinario.descripcion || ""}
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
