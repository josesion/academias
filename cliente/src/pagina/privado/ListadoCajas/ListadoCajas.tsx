import { useState, useEffect } from "react";
import { setHistorialCajas } from "../../../hookNegocios/historialCajas";
import { useModalAccesible } from "../../../hooks/useModalAccesible";
import { coloresSobrios } from "../../../hooks/ListadoCajas/ListadoCajasBase";
import { BookOpen, User, UserCheck } from "lucide-react";
// Componentes
import { EstadoCaja } from "../../../componentes/ListadoCajas/EstadoCaja/EstadoCaja";
import { DetalleCajas } from "../../../componentes/ListadoCajas/Listado/DetalleCaja";
import { LibroDiarioGeneral } from "../../../componentes/ListadoCajas/LibroDiario/LibroDiario";
import { ArqueoDiferencia } from "../../../componentes/ListadoCajas/ArqueoDiferencia/ArqueoDiferencia";
import { EstadoCajaCerrada } from "../../../componentes/ListadoCajas/EstadoCerrado/EstadoCerrado";
import { GraficoMetodosPago } from "../../../componentes/ListadoCajas/Graficosmetodos/Graficos";
import { BuscadorLateral } from "../../../componentes/BuscadorLateral/BuscadorLateral";
import { Paginacion } from "../../../componentes/generales/Paginacion/Paginacion";
import { Boton } from "../../../componentes/generales/Boton/Boton";
import { SinDetallesCaja } from "../../../componentes/ListadoCajas/SinContenidos/SinDetalles/SinDetalles";
import { CompoError } from "../../../componentes/generales/Error/Error";

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
    error,
    filtrosBusqueda,
    usuariosEscuela,
    detalleCaja,
  } = stateListadoCaja;

  // Estado local para manejar la animación fluida de salida del modal
  const [estaCerrando, setEstaCerrando] = useState(false);

  // Estado para la vista: "listado" (grid 50/50) | "graficos" (solo gráficos ancho completo)
  const [vista, setVista] = useState<"listado" | "graficos">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("listadoCajasVista");
      if (saved === "listado" || saved === "graficos") return saved;
    }
    return "listado";
  });

  // Persistir preferencia en localStorage
  useEffect(() => {
    localStorage.setItem("listadoCajasVista", vista);
  }, [vista]);

  const manejarCierreConAnimacion = () => {
    setEstaCerrando(true);
    setTimeout(() => {
      cerrarLibroDiario();
      setEstaCerrando(false);
    }, 300); // Coincide con la duración de la animación CSS de salida
  };

  // Teclado del modal del libro diario (spec 014): Escape cierra (con la misma
  // animación de salida que el botón) y el foco entra, queda atrapado y vuelve
  const { refDialog: refLibroDiario } = useModalAccesible({
    abierto: stateListadoCaja.modal.libroDiario,
    onCerrar: manejarCierreConAnimacion,
  });

  /* Spec 042 · A4: el listado muestra **dos** gráficos apilados, derivados del
     **mismo** array de métodos (sin reordenar) para que un método conserve el
     mismo color en los dos:
       · "Saldo por método"                → `total` (saldo, incluye Saldo Inicial)
       · "Dinero que circuló por método"   → `flujo` (ingresos − egresos, sin Saldo Inicial) */
  const metodosDePago = historialCajas?.dataMetodo ?? [];

  const metodosSaldo: MetodoPagoData[] = metodosDePago.map((item, index) => ({
    metodo: item.metodo,
    total: Number(item.total) || 0,
    color: item.color ?? coloresSobrios[index % coloresSobrios.length],
  }));

  const metodosFlujo: MetodoPagoData[] = metodosDePago.map((item, index) => ({
    metodo: item.metodo,
    total: Number(item.flujo ?? 0) || 0,
    color: item.color ?? coloresSobrios[index % coloresSobrios.length],
  }));

  // Partimos los métodos de pago en bloques de 3 (los dos gráficos usan el mismo corte)
  const bloquesMetodosPago = dividirEnBloques(metodosSaldo, 3);
  const bloquesMetodosFlujo = dividirEnBloques(metodosFlujo, 3);

  /* Spec 042 · A2: el estado vacío del gráfico agregado del listado tiene dos
     textos distintos según haya cajas en el período o no. */
  const hayCajasEnElPeriodo = (historialCajas?.dataDetalle?.length ?? 0) > 0;

  const textoSinMetodosPago = hayCajasEnElPeriodo
    ? "Las cajas del período no tienen ingresos ni egresos registrados, por eso no hay métodos de pago para mostrar."
    : "No hay cajas en el período seleccionado, por eso no hay métodos de pago para mostrar.";

  const handleCambiarVista = () => {
    setVista((v) => (v === "listado" ? "graficos" : "listado"));
  };

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

      {/* Switch para alternar vista: Listado ↔ Gráficos */}
      <div className="vista_switch_wrapper" role="group" aria-label="Alternar vista del listado de cajas">
        <span className="vista_switch_label">Listado</span>
        <label className="vista_switch">
          <input
            type="checkbox"
            role="switch"
            aria-checked={vista === "graficos"}
            checked={vista === "graficos"}
            onChange={handleCambiarVista}
            aria-label="Alternar vista: listado de cajas o gráficos"
          />
          <span className="vista_switch_thumb" aria-hidden="true" />
        </label>
        <span className="vista_switch_label">Gráficos</span>
      </div>

      {/* 2. Sección Inferior: Detalle de Cajas al lado de los Gráficos */}
      <div className={`listado_cajas_grid_inferior ${vista === "graficos" ? "vista-graficos" : "vista-listado"}`}>
        <div className="listado_cajas_panel">
          {error.historial && <CompoError mensaje={error.historial} />}

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
            <>
              {/* Gráfico 1: saldo por método (incluye el Saldo Inicial) */}
              {bloquesMetodosPago.map((bloqueDatos, index) => (
                <div key={`saldo-${index}`} className="contenedor_grafico_bloque">
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
                    titulo="Saldo por método"
                  />
                </div>
              ))}

              {/* Gráfico 2: dinero que circuló por método (sin el Saldo Inicial) */}
              {bloquesMetodosFlujo.map((bloqueDatos, index) => (
                <div key={`flujo-${index}`} className="contenedor_grafico_bloque">
                  {bloquesMetodosFlujo.length > 1 && (
                    <div className="grafico_subtitulo">
                      <span>
                        Métodos de Pago (Bloque {index + 1} de{" "}
                        {bloquesMetodosFlujo.length})
                      </span>
                    </div>
                  )}
                  <GraficoMetodosPago
                    props={bloqueDatos}
                    carga={carga.historial}
                    titulo="Dinero que circuló por método"
                  />
                </div>
              ))}
            </>
          ) : (
            /* Un único mensaje compartido por los dos gráficos: los dos se
               alimentan del mismo array, así que si uno está vacío el otro también. */
            <div className="contenedor_grafico_bloque">
              <p className="text-slate-400 text-sm">
                {textoSinMetodosPago}
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
          ariaLabel="Paginación del listado de cajas"
        />
      </div>

      {/* 3. MODAL FLOTANTE DE FINANZAS */}
      {stateListadoCaja.modal.libroDiario && (
        <div
          className={`modal-overlay-finanzas ${estaCerrando ? "saliendo" : ""}`}
        >
          <div
            ref={refLibroDiario}
            className="modal-contenido-finanzas"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo_libro_diario"
          >
            <header className="modal_finanzas_header">
              <div className="libro_diario_titulo">
                <BookOpen size={20} />
                <div className="libro_diario_titulo_texto">
                  <h2 id="titulo_libro_diario">Libro diario</h2>
                  <span>Registro cronológico de caja</span>
                </div>
              </div>

              <Boton
                clase="editar"
                logo="Cancel"
                texto="Cerrar"
                disable={false}
                onClick={manejarCierreConAnimacion}
              />

              {/* Spec 042 · A3: quién abrió y quién cerró la caja.
                  Viene de `dataArqueo` y se muestra aunque la caja no
                  tenga arqueo (en ese caso sólo falta la sección de arqueo). */}
              {detalleCaja?.dataArqueo && (
                <div className="modal_finanzas_usuarios">
                  <div className="modal_finanzas_usuario">
                    <User size={14} aria-hidden="true" />
                    <div className="modal_finanzas_usuario_datos">
                      <span className="modal_finanzas_usuario_label">
                        Abrió
                      </span>
                      <span className="modal_finanzas_usuario_nombre">
                        {detalleCaja.dataArqueo.usuario_apertura?.trim() ||
                          "Sin usuario"}
                      </span>
                    </div>
                  </div>

                  <div className="modal_finanzas_usuario">
                    <UserCheck size={14} aria-hidden="true" />
                    <div className="modal_finanzas_usuario_datos">
                      <span className="modal_finanzas_usuario_label">
                        Cerró
                      </span>
                      <span className="modal_finanzas_usuario_nombre">
                        {detalleCaja.dataArqueo.usuario_cierre?.trim() ||
                          "Sin usuario"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
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

                {/* Spec 042: desglose de la diferencia por método de pago.
                    Va entre la tabla de movimientos y el panel del gráfico.
                    Si la caja no tiene arqueo, el componente no renderiza nada. */}
                <ArqueoDiferencia data={detalleCaja?.dataArqueo ?? null} />

                {detalleCaja?.dataMetodo && (
                  <aside className="modal_grafico_panel ocultar-en-impresion">
                    {/* Spec 042 · A4: el gráfico del libro diario ya muestra el
                        saldo por cuenta (coherente con `total` del listado). */}
                    <div className="modal_grafico_titulo">Saldo por método</div>
                    <GraficoMetodosPago
                      props={detalleCaja.dataMetodo}
                      titulo="Saldo por método"
                    />
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
