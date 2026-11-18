import { useState } from "react";
import { setHistorialCajas } from "../../../hookNegocios/historialCajas";
import { useModalAccesible } from "../../../hooks/useModalAccesible";
import { BookOpen, User, UserCheck, Download, Printer } from "lucide-react";
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

/**
 * Genera y descarga un archivo CSV con el detalle completo del libro diario
de una caja individual. Incluye dos secciones: movimientos cronológicos y
arqueo por método de pago.
 *
 * @param detalleCaja - Los datos del resumen de la caja (movimientos, arqueo, métodos).
 * @param idCaja - Identificador de la caja para el nombre del archivo.
 */
const exportarLibroDiarioCSV = (
  detalleCaja: {
    dataDetalle?: MovimientoLibroDiario[] | null;
    dataArqueo?: {
      detalle: Array<{ id_cuenta: number; nombre_cuenta: string; sistema: number; real: number }>;
      diferencia_total: number;
      monto_sistema: number;
      monto_final_real: number;
      usuario_apertura: string;
      usuario_cierre: string;
    } | null;
    dataMetodo?: Array<{ id_cuenta: number; metodo: string; total: number }> | null;
  },
  idCaja: number
) => {
  const formatearMonto = (valor: number) =>
    Number(valor || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const filas: string[] = [];

  // Encabezado general
  filas.push(`Libro Diario - Caja #${idCaja}`);
  filas.push("");

  // Seccion 1: Movimientos cronologicos
  filas.push("MOVIMIENTOS CRONOLÓGICOS");
  if (detalleCaja.dataDetalle && detalleCaja.dataDetalle.length > 0) {
    const movimientos = detalleCaja.dataDetalle;
    filas.push("Cód.,Fecha,Hora,Categoría,Descripción,Cuenta,Tipo,Monto");
    movimientos.forEach((mov) => {
      filas.push([
        String(mov.id_movimiento).padStart(4, "0"),
        mov.fecha,
        mov.hora,
        mov.categoria,
        `"${(mov.descripcion ?? "").replace(/"/g, '""')}"`,
        mov.cuenta,
        mov.tipo,
        formatearMonto(mov.monto),
      ].join(","));
    });

    // Totales
    const debe = movimientos
      .filter((m) => m.tipo === "ingreso")
      .reduce((acc, m) => acc + Number(m.monto), 0);
    const haber = movimientos
      .filter((m) => m.tipo === "egreso")
      .reduce((acc, m) => acc + Number(m.monto), 0);
    filas.push("");
    filas.push(`Totales,Debe: $${formatearMonto(debe)},Haber: $${formatearMonto(haber)},Total: $${formatearMonto(debe - haber)}`);
  } else {
    filas.push("Sin movimientos cronológicos registrados");
  }

  filas.push("");

  // Seccion 2: Arqueo por método de pago
  filas.push("ARQUEO POR MÉTODO DE PAGO");
  if (detalleCaja.dataArqueo && detalleCaja.dataArqueo.detalle.length > 0) {
    const arqueo = detalleCaja.dataArqueo;
    filas.push("Método de pago,Sistema,Conteo real,Diferencia");
    arqueo.detalle.forEach((item) => {
      const sistema = Number(item.sistema) || 0;
      const real = Number(item.real) || 0;
      const diferencia = real - sistema;
      const textoDif = diferencia > 0 ? "Sobrante" : diferencia < 0 ? "Faltante" : "Exacto";
      filas.push([
        item.nombre_cuenta,
        `$${formatearMonto(sistema)}`,
        `$${formatearMonto(real)}`,
        `${diferencia > 0 ? "+" : ""}$${formatearMonto(Math.abs(diferencia))} (${textoDif})`,
      ].join(","));
    });

    const sumaDesglose = arqueo.detalle.reduce(
      (acc, item) => acc + (Number(item.real) - Number(item.sistema)),
      0
    );
    filas.push("");
    filas.push(`Total del desglose,${sumaDesglose > 0 ? "+" : ""}$${formatearMonto(Math.abs(sumaDesglose))}`);
    filas.push(`Diferencia total de la caja,${formatearMonto(Number(arqueo.diferencia_total) || 0)}`);
  } else {
    filas.push("Sin arqueo registrado");
  }

  filas.push("");

  // Seccion 3: Saldo por método
  if (detalleCaja.dataMetodo && detalleCaja.dataMetodo.length > 0) {
    filas.push("SALDO POR MÉTODO");
    filas.push("Método,Saldo");
    detalleCaja.dataMetodo.forEach((metodo) => {
      filas.push([
        metodo.metodo,
        `$${formatearMonto(metodo.total)}`,
      ].join(","));
    });
  }

  // Usuarios
  if (detalleCaja.dataArqueo) {
    filas.push("");
    filas.push("INFORMACIÓN DE CAJA");
    filas.push(`Abrió,${detalleCaja.dataArqueo.usuario_apertura}`);
    filas.push(`Cerró,${detalleCaja.dataArqueo.usuario_cierre}`);
  }

  const csvContent = filas.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `libro_diario_caja_${idCaja}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Abre una ventana de impresión con el contenido formateado del libro diario
de una caja individual. Incluye movimientos cronológicos, arqueo por método
de pago y saldo por método.
 *
 * @param detalleCaja - Los datos del resumen de la caja (movimientos, arqueo, métodos).
 * @param idCaja - Identificador de la caja para el título.
 */
const imprimirLibroDiario = (
  detalleCaja: {
    dataDetalle?: MovimientoLibroDiario[] | null;
    dataArqueo?: {
      detalle: Array<{ id_cuenta: number; nombre_cuenta: string; sistema: number; real: number }>;
      diferencia_total: number;
      monto_sistema: number;
      monto_final_real: number;
      usuario_apertura: string;
      usuario_cierre: string;
    } | null;
    dataMetodo?: Array<{ id_cuenta: number; metodo: string; total: number }> | null;
  },
  idCaja: number
) => {
  const formatearMonto = (valor: number) =>
    Number(valor || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Construir el HTML del contenido imprimible
  let html = `
    <html>
      <head>
        <title>Libro Diario - Caja #${idCaja}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #1a1a1a;
            padding: 20px;
            line-height: 1.4;
          }
          h1 {
            font-size: 18px;
            margin-bottom: 4px;
            color: #111;
          }
          h2 {
            font-size: 14px;
            margin-top: 20px;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #ccc;
            color: #333;
          }
          .subtitulo {
            font-size: 11px;
            color: #666;
            margin-bottom: 16px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
            font-size: 11px;
          }
          th {
            background: #f5f5f5;
            padding: 6px 8px;
            text-align: left;
            border-bottom: 2px solid #ccc;
            font-weight: bold;
            font-size: 10px;
            text-transform: uppercase;
          }
          td {
            padding: 5px 8px;
            border-bottom: 1px solid #eee;
          }
          tr:last-child td {
            border-bottom: none;
          }
          .total-row {
            font-weight: bold;
            background: #f9f9f9;
          }
          .monto-positivo {
            color: #2d6a4f;
          }
          .monto-negativo {
            color: #b34747;
          }
          .info-caja {
            display: flex;
            gap: 20px;
            margin-top: 20px;
            padding-top: 12px;
            border-top: 1px solid #ccc;
            font-size: 11px;
            color: #555;
          }
          .sin-detalles {
            color: #888;
            font-style: italic;
            padding: 10px 0;
          }
          @media print {
            body { padding: 0; }
            h1 { font-size: 16px; }
            h2 { font-size: 13px; }
          }
        </style>
      </head>
      <body>
  `;

  // Título
  html += `<h1>Libro Diario - Caja #${idCaja}</h1>`;
  html += `<p class="subtitulo">Registro cronológico de caja</p>`;

  // Sección 1: Movimientos cronológicos
  html += `<h2>MOVIMIENTOS CRONOLÓGICOS</h2>`;
  if (detalleCaja.dataDetalle && detalleCaja.dataDetalle.length > 0) {
    const movimientos = detalleCaja.dataDetalle;
    html += `
      <table>
        <thead>
          <tr>
            <th>Cód.</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Categoría</th>
            <th>Descripción</th>
            <th>Cuenta</th>
            <th>Tipo</th>
            <th style="text-align:right">Monto</th>
          </tr>
        </thead>
        <tbody>
    `;
    movimientos.forEach((mov) => {
      html += `
          <tr>
            <td>${String(mov.id_movimiento).padStart(4, "0")}</td>
            <td>${mov.fecha}</td>
            <td>${mov.hora}</td>
            <td>${mov.categoria}</td>
            <td>${(mov.descripcion ?? "").replace(/"/g, '"')}</td>
            <td>${mov.cuenta}</td>
            <td>${mov.tipo}</td>
            <td style="text-align:right">$${formatearMonto(mov.monto)}</td>
          </tr>
      `;
    });

    const debe = movimientos
      .filter((m) => m.tipo === "ingreso")
      .reduce((acc, m) => acc + Number(m.monto), 0);
    const haber = movimientos
      .filter((m) => m.tipo === "egreso")
      .reduce((acc, m) => acc + Number(m.monto), 0);
    const total = debe - haber;

    html += `
          <tr class="total-row">
            <td colspan="7">Totales</td>
            <td style="text-align:right">Debe: $${formatearMonto(debe)} | Haber: $${formatearMonto(haber)} | Total: $${formatearMonto(total)}</td>
          </tr>
        </tbody>
      </table>
    `;
  } else {
    html += `<p class="sin-detalles">Sin movimientos cronológicos registrados</p>`;
  }

  // Sección 2: Arqueo por método de pago
  html += `<h2>ARQUEO POR MÉTODO DE PAGO</h2>`;
  if (detalleCaja.dataArqueo && detalleCaja.dataArqueo.detalle.length > 0) {
    const arqueo = detalleCaja.dataArqueo;
    html += `
      <table>
        <thead>
          <tr>
            <th>Método de pago</th>
            <th style="text-align:right">Sistema</th>
            <th style="text-align:right">Conteo real</th>
            <th style="text-align:right">Diferencia</th>
          </tr>
        </thead>
        <tbody>
    `;
    arqueo.detalle.forEach((item) => {
      const sistema = Number(item.sistema) || 0;
      const real = Number(item.real) || 0;
      const diferencia = real - sistema;
      const claseMonto = diferencia > 0 ? "monto-positivo" : diferencia < 0 ? "monto-negativo" : "";
      const signo = diferencia > 0 ? "+" : "";
      html += `
          <tr>
            <td>${item.nombre_cuenta}</td>
            <td style="text-align:right">$${formatearMonto(sistema)}</td>
            <td style="text-align:right">$${formatearMonto(real)}</td>
            <td style="text-align:right" class="${claseMonto}">${signo}$${formatearMonto(Math.abs(diferencia))}</td>
          </tr>
      `;
    });

    const sumaDesglose = arqueo.detalle.reduce(
      (acc, item) => acc + (Number(item.real) - Number(item.sistema)),
      0
    );
    const signoSuma = sumaDesglose > 0 ? "+" : "";

    html += `
          <tr class="total-row">
            <td>Total del desglose</td>
            <td colspan="2"></td>
            <td style="text-align:right">${signoSuma}$${formatearMonto(Math.abs(sumaDesglose))}</td>
          </tr>
          <tr class="total-row">
            <td>Diferencia total de la caja</td>
            <td colspan="2"></td>
            <td style="text-align:right">$${formatearMonto(Number(arqueo.diferencia_total) || 0)}</td>
          </tr>
        </tbody>
      </table>
    `;
  } else {
    html += `<p class="sin-detalles">Sin arqueo registrado</p>`;
  }

  // Sección 3: Saldo por método
  if (detalleCaja.dataMetodo && detalleCaja.dataMetodo.length > 0) {
    html += `<h2>SALDO POR MÉTODO</h2>
      <table>
        <thead>
          <tr>
            <th>Método</th>
            <th style="text-align:right">Saldo</th>
          </tr>
        </thead>
        <tbody>
    `;
    detalleCaja.dataMetodo.forEach((metodo) => {
      html += `
          <tr>
            <td>${metodo.metodo}</td>
            <td style="text-align:right">$${formatearMonto(metodo.total)}</td>
          </tr>
      `;
    });
    html += `</tbody></table>`;
  }

  // Información de caja
  if (detalleCaja.dataArqueo) {
    html += `
      <div class="info-caja">
        <span><strong>Abrió:</strong> ${detalleCaja.dataArqueo.usuario_apertura}</span>
        <span><strong>Cerró:</strong> ${detalleCaja.dataArqueo.usuario_cierre}</span>
      </div>
    `;
  }

  html += `</body></html>`;

  // Abrir ventana de impresión
  const ventanaImpresion = window.open("", "_blank", "width=800,height=600");
  if (ventanaImpresion) {
    ventanaImpresion.document.write(html);
    ventanaImpresion.document.close();
    ventanaImpresion.focus();
    setTimeout(() => {
      ventanaImpresion.print();
      ventanaImpresion.close();
    }, 250);
  }
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
    modal,
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

  // Teclado del modal del libro diario (spec 014): Escape cierra (con la misma
  // animación de salida que el botón) y el foco entra, queda atrapado y vuelve
  const { refDialog: refLibroDiario } = useModalAccesible({
    abierto: stateListadoCaja.modal.libroDiario,
    onCerrar: manejarCierreConAnimacion,
  });


  return (
    <div className="listado_cajas_pagina">
      <h1 className="visually-hidden">Historial de Cajas</h1>
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

      {/* 2. Sección Inferior: Detalle de Cajas (ancho completo) */}
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

              <div className="modal_finanzas_acciones">
                {detalleCaja && modal.idCajaActual != null && (
                  <>
                    <button
                      className="modal_finanzas_btn_exportar"
                      onClick={() => imprimirLibroDiario(detalleCaja, modal.idCajaActual)}
                      title="Imprimir libro diario"
                      aria-label="Imprimir libro diario"
                    >
                      <Printer size={14} />
                      <span>Imprimir</span>
                    </button>
                    <button
                      className="modal_finanzas_btn_exportar"
                      onClick={() => exportarLibroDiarioCSV(detalleCaja, modal.idCajaActual)}
                      title="Descargar libro diario como CSV"
                      aria-label="Exportar libro diario a CSV"
                    >
                      <Download size={14} />
                      <span>Exportar CSV</span>
                    </button>
                  </>
                )}
                <Boton
                  clase="editar"
                  logo="Cancel"
                  texto="Cerrar"
                  disable={false}
                  onClick={manejarCierreConAnimacion}
                />
              </div>

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
