import { useState } from "react";
import { ListaCajaBase } from "../../../hooks/ListadoCajas/ListadoCajasBase";

// Componentes
import { EstadoCaja } from "../../../componentes/ListadoCajas/EstadoCaja/EstadoCaja";
import { DetalleCajas } from "../../../componentes/ListadoCajas/Listado/DetalleCaja";
import { LibroDiarioGeneral } from "../../../componentes/ListadoCajas/LibroDiario/LibroDiario";

import {
  GraficoMetodosPago,
  type MetodoPagoData,
} from "../../../componentes/ListadoCajas/Graficosmetodos/Graficos";

import "./listadocajas.css";

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
    mockLibroDiario,
    mockResumenMetodosPago,
    mockCajaActiva,
    mockHistorialCajasCerradas,
    stateListadoCaja,
    abrirLibroDiario,
    cerrarLibroDiario,
  } = ListaCajaBase();

  // Estado local para manejar la animación fluida de salida del modal
  const [estaCerrando, setEstaCerrando] = useState(false);

  const manejarCierreConAnimacion = () => {
    setEstaCerrando(true);
    setTimeout(() => {
      cerrarLibroDiario();
      setEstaCerrando(false);
    }, 300); // Coincide con la duración de la animación CSS de salida
  };

  // Partimos los métodos de pago en bloques de 5
  const bloquesMetodosPago: MetodoPagoData[][] = dividirEnBloques(
    mockResumenMetodosPago,
    3,
  );

  return (
    <div className="listado_cajas_pagina">
      {/* 1. Caja Activa */}
      <EstadoCaja
        id_caja={mockCajaActiva.id_caja}
        usuario={mockCajaActiva.cajero}
        fecha_apertura={mockCajaActiva.fecha_apertura}
        hora_apertura={mockCajaActiva.hora_apertura}
        estado={mockCajaActiva.estado as "abierta" | "cerrada"}
        total={mockCajaActiva.total}
        totales={mockCajaActiva.totales}
      />

      {/* 2. Sección Inferior: Detalle de Cajas al lado de los Gráficos */}
      <div className="listado_cajas_grid_inferior">
        <div className="listado_cajas_panel">
          <DetalleCajas
            props={mockHistorialCajasCerradas}
            onAbrirLibroDiario={abrirLibroDiario}
          />
        </div>

        {/* Contenedor de los gráficos divididos de 5 en 5 */}
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
                <GraficoMetodosPago props={bloqueDatos} />
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
        <p>paginacion</p>
      </div>

      {/* 3. MODAL FLOTANTE DE FINANZAS (Fuera del flujo principal, cubriendo todo) */}
      {stateListadoCaja.modal.libroDiario && (
        <div
          className={`modal-overlay-finanzas ${estaCerrando ? "saliendo" : ""}`}
        >
          <div className="modal-contenido-finanzas">
            <div className="area-impresion-modal">
              <LibroDiarioGeneral
                movimientos={mockLibroDiario}
                onCerrarLbroDiario={manejarCierreConAnimacion}
              />
              <div className="ocultar-en-impresion">
                <GraficoMetodosPago props={mockResumenMetodosPago} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
