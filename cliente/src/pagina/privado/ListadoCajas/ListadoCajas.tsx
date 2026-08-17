import { useState } from "react";
import { setHistorialCajas } from "../../../hookNegocios/historialCajas";

// Componentes
import { EstadoCaja } from "../../../componentes/ListadoCajas/EstadoCaja/EstadoCaja";
import { DetalleCajas } from "../../../componentes/ListadoCajas/Listado/DetalleCaja";
import { LibroDiarioGeneral } from "../../../componentes/ListadoCajas/LibroDiario/LibroDiario";
import { EstadoCajaCerrada } from "../../../componentes/ListadoCajas/EstadoCerrado/EstadoCerrado";
import { GraficoMetodosPago } from "../../../componentes/ListadoCajas/Graficosmetodos/Graficos";
import { BuscadorLateral } from "../../../componentes/BuscadorLateral/BuscadorLateral";

import "./listadocajas.css";
export interface MovimientoLibroDiario {
  id_movimiento: number;
  usuario: string;
  id_caja: number;
  fecha: string;
  hora: string;
  descripcion: string;
  tipo: "ingreso" | "egreso";
  cuenta: string;
  monto: number;
}

export interface MetodoPagoData {
  metodo: string;
  total: number;
  color: string;
}

const mockLibroDiario: MovimientoLibroDiario[] = [
  {
    id_movimiento: 1,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "09:15:00",
    descripcion: "Inscripción alumna nueva - María Gomez",
    tipo: "ingreso",
    cuenta: "Efectivo",
    monto: 10000.0,
  },
  {
    id_movimiento: 2,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "10:30:00",
    descripcion: "Pago de cuota mensual - Carlos Ruiz",
    tipo: "ingreso",
    cuenta: "Mercado Pago",
    monto: 12000.0,
  },
  {
    id_movimiento: 3,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "12:00:00",
    descripcion: "Compra de insumos de limpieza y librería",
    tipo: "egreso",
    cuenta: "Efectivo",
    monto: 4500.0,
  },
  {
    id_movimiento: 4,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "15:45:00",
    descripcion: "Pago de cuota mensual - Lucía Benítez",
    tipo: "ingreso",
    cuenta: "Efectivo",
    monto: 12000.0,
  },
  {
    id_movimiento: 5,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "18:20:00",
    descripcion: "Reparación menor de parlante de estudio",
    tipo: "egreso",
    cuenta: "Efectivo",
    monto: 8000.0,
  },
  {
    id_movimiento: 5,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "18:20:00",
    descripcion: "Reparación menor de parlante de estudio",
    tipo: "egreso",
    cuenta: "Efectivo",
    monto: 8000.0,
  },
  {
    id_movimiento: 5,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "18:20:00",
    descripcion: "Reparación menor de parlante de estudio",
    tipo: "egreso",
    cuenta: "Efectivo",
    monto: 8000.0,
  },
  {
    id_movimiento: 5,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "18:20:00",
    descripcion: "Reparación menor de parlante de estudio",
    tipo: "egreso",
    cuenta: "Efectivo",
    monto: 8000.0,
  },
  {
    id_movimiento: 5,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "18:20:00",
    descripcion: "Reparación menor de parlante de estudio",
    tipo: "egreso",
    cuenta: "Efectivo",
    monto: 8000.0,
  },
  {
    id_movimiento: 5,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "18:20:00",
    descripcion: "Reparación menor de parlante de estudio",
    tipo: "egreso",
    cuenta: "Efectivo",
    monto: 8000.0,
  },
  {
    id_movimiento: 5,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "18:20:00",
    descripcion: "Reparación menor de parlante de estudio",
    tipo: "egreso",
    cuenta: "Efectivo",
    monto: 8000.0,
  },
  {
    id_movimiento: 5,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "18:20:00",
    descripcion: "Reparación menor de parlante de estudio",
    tipo: "egreso",
    cuenta: "Efectivo",
    monto: 8000.0,
  },
  {
    id_movimiento: 5,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "18:20:00",
    descripcion: "Reparación menor de parlante de estudio",
    tipo: "egreso",
    cuenta: "Efectivo",
    monto: 8000.0,
  },
  {
    id_movimiento: 5,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "18:20:00",
    descripcion: "Reparación menor de parlante de estudio",
    tipo: "egreso",
    cuenta: "Efectivo",
    monto: 8000.0,
  },
  {
    id_movimiento: 5,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "18:20:00",
    descripcion: "Reparación menor de parlante de estudio",
    tipo: "egreso",
    cuenta: "Efectivo",
    monto: 8000.0,
  },
  {
    id_movimiento: 5,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "18:20:00",
    descripcion: "Reparación menor de parlante de estudio",
    tipo: "egreso",
    cuenta: "Efectivo",
    monto: 8000.0,
  },
  {
    id_movimiento: 5,
    usuario: "Juan Pérez",
    id_caja: 14,
    fecha: "2026-08-09",
    hora: "18:20:00",
    descripcion: "Reparación menor de parlante de estudio",
    tipo: "egreso",
    cuenta: "Efectivo",
    monto: 8000.0,
  },
];

const mockResumenMetodosPago: MetodoPagoData[] = [
  { metodo: "efectivo", total: 180000.0, color: "#10B981" }, // Verde esmeralda
  { metodo: "mercado pago", total: 62000.0, color: "#3B82F6" }, // Azul moderno
  { metodo: "transferencia", total: 35000.0, color: "#8B5CF6" }, // Violeta / Índigo
  { metodo: "tarjeta", total: 18500.0, color: "#8c7856" },
];

// Función auxiliar correctamente tipada con genéricos
const dividirEnBloques = <T,>(array: T[], tamanoBloque: number): T[][] => {
  const bloques: T[][] = [];
  for (let i = 0; i < array.length; i += tamanoBloque) {
    bloques.push(array.slice(i, i + tamanoBloque));
  }
  return bloques;
};

interface UsuarioOption {
  id_usuario: number;
  username: string;
}

// 2. Simulás o traés tu lista de usuarios desde la API
const listaUsuarios: UsuarioOption[] = [
  { id_usuario: 1, username: "jose_dev" },
  { id_usuario: 2, username: "ana_admin" },
  { id_usuario: 3, username: "carlos_caja" },
];

export const ListadoCajas = () => {
  const {
    stateListadoCaja,
    abrirLibroDiario,
    cerrarLibroDiario,
    cachearUsuario,
    cachearEstado,
    cachearFechaD,
    cachearFechaH,
  } = setHistorialCajas();

  const { estadoCaja, historialCajas, carga, filtrosBusqueda } =
    stateListadoCaja;

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
  const bloquesMetodosPago = dividirEnBloques(
    historialCajas?.dataMetodo || [],
    3,
  );

  return (
    <div className="listado_cajas_pagina">
      {/* 1. Caja Activa */}

      <BuscadorLateral
        filtros={filtrosBusqueda}
        usuario={listaUsuarios}
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
