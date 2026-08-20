import { useState } from "react";
import { setHistorialCajas } from "../../../hookNegocios/historialCajas";
import { BookOpen } from "lucide-react";
// Componentes
import { EstadoCaja } from "../../../componentes/ListadoCajas/EstadoCaja/EstadoCaja";
import { DetalleCajas } from "../../../componentes/ListadoCajas/Listado/DetalleCaja";
import { LibroDiarioGeneral } from "../../../componentes/ListadoCajas/LibroDiario/LibroDiario";
import { EstadoCajaCerrada } from "../../../componentes/ListadoCajas/EstadoCerrado/EstadoCerrado";
import { GraficoMetodosPago } from "../../../componentes/ListadoCajas/Graficosmetodos/Graficos";
import { BuscadorLateral } from "../../../componentes/BuscadorLateral/BuscadorLateral";
import { Paginacion } from "../../../componentes/generales/Paginacion/Paginacion";
import { Boton } from "../../../componentes/generales/Boton/Boton";
import { SinDetallesCaja } from "../../../componentes/ListadoCajas/SinContenidos/SinDetalles/SinDetalles";

import "./listadocajas.css";

export interface MovimientoLibroDiario {
  id_movimiento: number;
  usuario: string;
  id_caja: number;
  fecha: string;
  hora: string;
  categoria: string;
  descripcion: string | null;
  tipo: "ingreso" | "egreso";
  cuenta: string;
  monto: number;
}

export interface MetodoPagoData {
  metodo: string;
  total: number;
  color: string;
}

// Función auxiliar correctamente tipada con genéricos
const dividirEnBloques = <T,>(array: T[], tamanoBloque: number): T[][] => {
  const bloques: T[][] = [];
  for (let i = 0; i < array.length; i += tamanoBloque) {
    bloques.push(array.slice(i, i + tamanoBloque));
  }
  return bloques;
};

export const ListadoCajas = () => {
  const {
    stateListadoCaja,
    abrirLibroDiario,
    cerrarLibroDiario,
    cachearUsuario,
    cachearEstado,
    cachearFechaD,
    cachearFechaH,
    handlePaginaCambiada,
  } = setHistorialCajas();

  const {
    estadoCaja,
    historialCajas,
    carga,
    filtrosBusqueda,
    usuariosEscuela,
    detalleCaja,
  } = stateListadoCaja;

  // Estado local para manejar la animación fluida de salida del modal
  const [estaCerrando, setEstaCerrando] = useState(false);

  const manejarCierreConAnimacion = () => {
    setEstaCerrando(true);
    setTimeout(() => {
      cerrarLibroDiario();
      setEstaCerrando(false);
    }, 300); // Coincide con la duración de la animación CSS de salida
  };

  // Partimos los métodos de pago en bloques de 3
  const bloquesMetodosPago = dividirEnBloques(
    historialCajas?.dataMetodo || [],
    3,
  );

  return (
    <div className="listado_cajas_pagina">
      {/* 1. Caja Activa / Buscador */}
      <BuscadorLateral
        filtros={filtrosBusqueda}
        usuario={usuariosEscuela}
        cachearUsuario={cachearUsuario}
        cachearEstado={cachearEstado}
        cachearFechaD={cachearFechaD}
        cachearFechaH={cachearFechaH}
      />

      {estadoCaja ? (
        <EstadoCaja
          carga={carga.encabezado}
          id_caja={estadoCaja ? estadoCaja.id_caja : 0}
          usuario={estadoCaja ? estadoCaja.cajero : "Sin Cajero"}
          fecha_apertura={estadoCaja ? estadoCaja.fecha_apertura : ""}
          hora_apertura={estadoCaja ? estadoCaja.fecha_apertura : ""}
          estado={
            estadoCaja
              ? estadoCaja.estado
              : ("cerrada" as "abierta" | "cerrada")
          }
          total={estadoCaja ? estadoCaja.total : 0}
          totales={
            estadoCaja ? estadoCaja.totales : { efectivo: 0, virtual: 0 }
          }
        />
      ) : (
        <EstadoCajaCerrada />
      )}

      {/* 2. Sección Inferior: Detalle de Cajas al lado de los Gráficos */}
      <div className="listado_cajas_grid_inferior">
        <div className="listado_cajas_panel">
          {historialCajas ? (
            <DetalleCajas
              carga={carga.historial}
              props={
                historialCajas.dataDetalle ? historialCajas.dataDetalle : []
              }
              onAbrirLibroDiario={abrirLibroDiario}
            />
          ) : (
            "Sin cajas"
          )}
        </div>

        {/* Contenedor de los gráficos divididos */}
        <div className="listado_cajas_graficos_columna">
          {bloquesMetodosPago.length > 0 ? (
            bloquesMetodosPago.map((bloqueDatos, index) => (
              <div key={index} className="contenedor_grafico_bloque">
                {bloquesMetodosPago.length > 1 && (
                  <div className="grafico_subtitulo">
                    <span>
                      Métodos de Pago (Bloque {index + 1} de{" "}
                      {bloquesMetodosPago.length})
                    </span>
                  </div>
                )}
                <GraficoMetodosPago
                  props={bloqueDatos}
                  carga={carga.historial}
                />
              </div>
            ))
          ) : (
            <div className="contenedor_grafico_bloque">
              <p className="text-slate-400 text-sm">
                No hay métodos de pago registrados.
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <Paginacion
          contadorPagina={stateListadoCaja.paginacion.contadorPagina}
          paginaActual={stateListadoCaja.paginacion.pagina}
          onPaginaCambiada={handlePaginaCambiada}
        />
      </div>

      {/* 3. MODAL FLOTANTE DE FINANZAS */}
      {stateListadoCaja.modal.libroDiario && (
        <div
          className={`modal-overlay-finanzas ${estaCerrando ? "saliendo" : ""}`}
        >
          <div className="modal-contenido-finanzas">
            <header className="modal_finanzas_header">
              <div>
                <header className="libro_diario_encabezado">
                  <div className="libro_diario_titulo_grupo">
                    <div className="libro_diario_icono_wrapper">
                      <BookOpen size={18} />
                    </div>
                    <div className="libro_diario_titulo_texto">
                      <h2>Libro diario</h2>
                      <span>Registro cronológico de caja</span>
                    </div>
                  </div>
                </header>
              </div>

              <Boton
                clase="editar"
                logo="Cancel"
                texto="Cerrar Libro Diario"
                disable={false}
                onClick={manejarCierreConAnimacion}
              />
            </header>

            <div className="area-impresion-modal">
              <div className="modal_finanzas_contenido">
                <div className="modal_libro_panel">
                  {detalleCaja?.dataDetalle ? (
                    <LibroDiarioGeneral movimientos={detalleCaja.dataDetalle} />
                  ) : (
                    <SinDetallesCaja />
                  )}
                </div>

                {detalleCaja?.dataMetodo && (
                  <aside className="modal_grafico_panel ocultar-en-impresion">
                    <div className="modal_grafico_titulo">
                      Distribución por método de pago
                    </div>
                    <GraficoMetodosPago props={detalleCaja.dataMetodo} />
                  </aside>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
