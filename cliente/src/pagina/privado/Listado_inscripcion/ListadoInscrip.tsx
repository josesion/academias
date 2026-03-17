import { Buscadores } from "../../../componentes/Buscadores/Buscador";
import { FiltroFechas } from "../../../componentes/FiltrosFechas/FiltrosFechas";

import { ContenedorListadoInscripciones } from "../../../componentes/ContenedorListadoInscrp/ContendorListadoInscrip";

import { setListadoInscripcion } from "../../../hookNegocios/listadoInscrip";

import "./listadoInscrip.css";

export const ListadoInscripcionPage = () => {
  const {
    inputsFiltro,
    estado,
    filtroData,
    handleChangaValue,
    handleChangeEstado,
    handleChangeFechaDesde,
    handleChangeFechaHasta,
  } = setListadoInscripcion();

  const dataMock = [
    {
      id_inscripcion: 106,
      dni_alumno: 40345678,
      nombre_completo: "Lucía Martínez",
      nombre_plan: "Plan Anual Ilimitado",
      clases_usadas: 12,
      clases_totales: 12, // Barra llena
      fecha_inicio: "2026-03-06",
      vigencia: "2027-03-06",
      monto_pagado: "250000.00",
      metodo_pago: "transferencia",
    },
    {
      id_inscripcion: 107,
      dni_alumno: 38123456,
      nombre_completo: "Marcos Galperin",
      nombre_plan: "Pase Libre Mensual",
      clases_usadas: 45,
      clases_totales: 100, // Barra al 45%
      fecha_inicio: "2026-02-15",
      vigencia: "2026-03-15",
      monto_pagado: "45000.00",
      metodo_pago: "efectivo",
    },
    {
      id_inscripcion: 108,
      dni_alumno: 42987654,
      nombre_completo: "Sofía Rodríguez",
      nombre_plan: "Funcional 2 veces x semana",
      clases_usadas: 2,
      clases_totales: 8, // Barra al 25%
      fecha_inicio: "2026-03-01",
      vigencia: "2026-04-01",
      monto_pagado: "32000.00",
      metodo_pago: "tarjeta",
    },
    {
      id_inscripcion: 109,
      dni_alumno: 35000111,
      nombre_completo: "Julián Álvarez",
      nombre_plan: "Crossfit Ilimitado",
      clases_usadas: 12,
      clases_totales: 16, // Barra casi vacía (el caso que mencionaste)
      fecha_inicio: "2026-01-10",
      vigencia: "2027-01-10",
      monto_pagado: "180000.00",
      metodo_pago: "transferencia",
    },
    {
      id_inscripcion: 106,
      dni_alumno: 40345678,
      nombre_completo: "Lucía Martínez",
      nombre_plan: "Plan Anual Ilimitado",
      clases_usadas: 12,
      clases_totales: 12, // Barra llena
      fecha_inicio: "2026-03-06",
      vigencia: "2027-03-06",
      monto_pagado: "250000.00",
      metodo_pago: "transferencia",
    },
    {
      id_inscripcion: 107,
      dni_alumno: 38123456,
      nombre_completo: "Marcos Galperin",
      nombre_plan: "Pase Libre Mensual",
      clases_usadas: 45,
      clases_totales: 100, // Barra al 45%
      fecha_inicio: "2026-02-15",
      vigencia: "2026-03-15",
      monto_pagado: "45000.00",
      metodo_pago: "efectivo",
    },
    {
      id_inscripcion: 108,
      dni_alumno: 42987654,
      nombre_completo: "Sofía Rodríguez",
      nombre_plan: "Funcional 2 veces x semana",
      clases_usadas: 2,
      clases_totales: 8, // Barra al 25%
      fecha_inicio: "2026-03-01",
      vigencia: "2026-04-01",
      monto_pagado: "32000.00",
      metodo_pago: "tarjeta",
    },
    {
      id_inscripcion: 109,
      dni_alumno: 35000111,
      nombre_completo: "Julián Álvarez",
      nombre_plan: "Crossfit Ilimitado",
      clases_usadas: 12,
      clases_totales: 16, // Barra casi vacía (el caso que mencionaste)
      fecha_inicio: "2026-01-10",
      vigencia: "2027-01-10",
      monto_pagado: "180000.00",
      metodo_pago: "transferencia",
    },
  ];

  const carga: boolean = false;
  const statusCode: number = 404;

  return (
    <div className="contenedor_listado">
      <div className="contenedor_filtros">
        <Buscadores
          tituloBuscador="Filtro de Busqueda"
          intputBuscador={inputsFiltro}
          estados={estado}
          buscadorData={filtroData}
          captionBoton={"Inscribir"}
          onChange={handleChangaValue}
          onEstados={handleChangeEstado}
        />
        <FiltroFechas
          fechaDesde={filtroData.fecha_desde}
          fechaHasta={filtroData.fecha_hasta}
          onDesdeChange={handleChangeFechaDesde}
          onHastaChange={handleChangeFechaHasta}
        />
      </div>

      <ContenedorListadoInscripciones
        data={dataMock}
        carga={carga}
        statusCode={statusCode}
      />
    </div>
  );
};
