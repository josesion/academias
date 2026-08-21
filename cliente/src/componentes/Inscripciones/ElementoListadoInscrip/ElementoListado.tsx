import React from "react";
import { Activity } from "lucide-react";
import "./elementolista.css";

export interface InscripcionListado {
  id_inscripcion: number;
  dni_alumno: number;
  nombre_completo: string;
  nombre_plan: string;
  clases_usadas: number;
  clases_totales: number;
  fecha_inicio: string;
  vigencia: string;
  monto_pagado: string;
  metodo_pago: "efectivo" | "transferencia" | "debito" | "credito" | string;
  estado: string;
}

interface ElementoListaProps {
  inscripcion: InscripcionListado;
  vigencia: string;
  onSeleccionar: (
    id: number,
    metodo_pago: string,
    monto_pagado: string,
    nombre_completo: string,
    dni_alumno: number,
    clases_tomadas: number,
    clases_totales: number,
    vigencia: string,
    estado: string,
  ) => void;
}

const CLASE_SELLO: Record<string, string> = {
  activos: "sello_verde",
  vencidos: "sello_rojo",
  suspendido: "sello_ambar",
};

const TEXTO_SELLO: Record<string, string> = {
  activos: "Activa",
  vencidos: "Vencida",
  suspendido: "Suspendida",
};

export const ElementoLista: React.FC<ElementoListaProps> = ({
  inscripcion,
  vigencia,
  onSeleccionar,
}) => {
  const porcentajeUso =
    (inscripcion.clases_usadas / inscripcion.clases_totales) * 100;

  const claseSello = CLASE_SELLO[inscripcion.estado] ?? "sello_neutro";
  const textoSello = TEXTO_SELLO[inscripcion.estado] ?? inscripcion.estado;

  const handleClick = () =>
    onSeleccionar(
      inscripcion.id_inscripcion,
      inscripcion.metodo_pago,
      inscripcion.monto_pagado,
      inscripcion.nombre_completo,
      inscripcion.clases_totales,
      inscripcion.clases_usadas,
      inscripcion.dni_alumno,
      inscripcion.vigencia,
      inscripcion.estado,
    );

  return (
    <>
      {/* VISTA DESKTOP: Fila de tabla (<tr>) que ocupa todo el ancho con las columnas alineadas */}
      <tr
        className={`fila_inscripcion_desktop ${vigencia}`}
        onClick={handleClick}
      >
        {/* Alumno */}
        <td>
          <div className="celda_alumno">
            <span className="nombre_tabla">{inscripcion.nombre_completo}</span>
            <span className="dni_tabla">
              DNI: {inscripcion.dni_alumno.toLocaleString("es-AR")}
            </span>
          </div>
        </td>

        {/* Plan y Pago */}
        <td>
          <div className="celda_plan">
            <span className="plan_tabla">{inscripcion.nombre_plan}</span>
            <span className="monto_tabla">
              ${Number(inscripcion.monto_pagado).toLocaleString("es-AR")} (
              {inscripcion.metodo_pago})
            </span>
          </div>
        </td>

        {/* Estado de Consumo */}
        <td>
          <div className="celda_consumo">
            <div className="consumo_header_tabla">
              <span>
                {inscripcion.clases_usadas} / {inscripcion.clases_totales}
              </span>
            </div>
            <div className="barra_fondo_tabla">
              <div
                className="barra_progreso_tabla"
                style={{ width: `${porcentajeUso}%` }}
              />
            </div>
          </div>
        </td>

        {/* Inicio */}
        <td className="text-right">
          <span className="fecha_tabla">{inscripcion.fecha_inicio}</span>
        </td>

        {/* Vigencia */}
        <td className="text-right">
          <span className="fecha_tabla">{inscripcion.vigencia}</span>
        </td>

        {/* Estado (Sello) */}
        <td className="text-center">
          <div className={`sello_estado ${claseSello}`}>{textoSello}</div>
        </td>
      </tr>

      {/* VISTA MOBILE: Tarjeta vertical (se muestra solo en pantallas chicas) */}
      <div
        className={`tarjeta_inscripcion_mobile group ${vigencia}`}
        onClick={handleClick}
      >
        <div className="tarjeta_header_superior">
          <span className="tarjeta_id">
            #{String(inscripcion.id_inscripcion).padStart(4, "0")}
          </span>
          <div className={`sello_estado ${claseSello}`}>{textoSello}</div>
        </div>

        <div className="tarjeta_body_principal">
          <div className="alumno_info">
            <span className="alumno_nombre">{inscripcion.nombre_completo}</span>
            <span className="alumno_dni">
              DNI: {inscripcion.dni_alumno.toLocaleString("es-AR")}
            </span>
          </div>

          <div className="plan_y_consumo">
            <span className="plan_nombre">{inscripcion.nombre_plan}</span>
            <div className="consumo_contenedor">
              <div className="consumo_header">
                <div className="consumo_titulo">
                  <Activity size={10} />
                  <span>Consumo</span>
                </div>
                <span className="consumo_numeros">
                  {inscripcion.clases_usadas} / {inscripcion.clases_totales}
                </span>
              </div>
              <div className="barra_fondo">
                <div
                  className="barra_progreso"
                  style={{ width: `${porcentajeUso}%` }}
                />
              </div>
            </div>
          </div>

          <div className="tarjeta_detalles_inferiores">
            <div className="pago_monto">
              <span>
                ${Number(inscripcion.monto_pagado).toLocaleString("es-AR")}
              </span>
              <span className="pago_metodo">{inscripcion.metodo_pago}</span>
            </div>
            <span className="vigencia_fecha">
              Vence: {inscripcion.vigencia}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};
