import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";

import { Formulario } from "../../generales/Formulario/Formulario";
import { ListadoMolde } from "../ListaMolde/Listado";
import { Buscadores } from "../../generales/Buscadores/Buscador";
import { Paginacion } from "../../generales/Paginacion/Paginacion";
import { EliminarVentana } from "../../generales/EliminarModal/EliminarModal";

import "./ambcss.css";

interface AmbViewProps {
  modal: boolean;
  modalEliminar: boolean;
  errorsZod: Record<string, string | null>;
  errorGenerico: string | null;
  dataAlumnosListado: any[];
  formData: any;
  barraPaginacion: any;
  filtroData: any;
  inputsFiltro: any[];
  inputsEntidad: any[];
  estados: string[];
  entidad: string;

  carga: boolean;
  enProceso: boolean;
  error: boolean;
  statuscode: number;

  accionEliminar: string;
  tipoFormulario: "alta" | "modificar";
  botonTexto: string;

  onHandleChangeBuscador: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHandleCancelar: () => void;
  onHandleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onHandleChangeFormulario: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onHandleAgregar: () => void;
  onHandleEstado: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onHandleItems?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onHandleItemsFormulario?: (e: React.ChangeEvent<HTMLSelectElement>) => void;

  onHandlePaginaCambiada: (pagina: number) => void;

  onModificar?: (data: any) => void;
  onEliminar?: (data: any) => void;

  onHandleCancelarEliminar?: () => void;
  onHandleSubmitEliminar: () => Promise<void>;
}

export const AmbVistas: React.FC<AmbViewProps> = (props) => {
  const {
    modal,
    modalEliminar,
    errorsZod,
    errorGenerico,
    dataAlumnosListado,
    formData,
    barraPaginacion,
    filtroData,
    inputsFiltro,
    inputsEntidad,
    estados,
    carga,
    enProceso,
    error,
    statuscode,
    tipoFormulario,
    accionEliminar,
    botonTexto,
    entidad,
    onHandleChangeBuscador,
    onHandleCancelar,
    onHandleSubmit,
    onHandleChangeFormulario,
    onHandleAgregar,
    onHandleItems,
    onHandleItemsFormulario,
    onHandleEstado,
    onHandlePaginaCambiada,
    onHandleCancelarEliminar,
    onHandleSubmitEliminar,
    onModificar,
    onEliminar,
  } = props;

  const [buscadorAbierto, setBuscadorAbierto] = useState(false);

  return (
    <div className="amb_master_wrapper">
      {/* MODALES - Sin cambios en la lógica */}
      {modal && (
        <div className="modal_overlay_fix">
          <Formulario
            data={inputsEntidad}
            formData={formData}
            textoSubmit="Registrar"
            tituloFormulario={
              tipoFormulario === "alta"
                ? `Alta ${entidad}`
                : `Modificar ${entidad}`
            }
            onCancelar={onHandleCancelar}
            onChange={onHandleChangeFormulario}
            onSubmit={onHandleSubmit}
            onItemsFormulario={onHandleItemsFormulario}
            errorGenerico={errorGenerico}
            errorsZod={errorsZod}
          />
        </div>
      )}

      {modalEliminar && (
        <div className="modal_overlay_fix">
          <EliminarVentana
            onCancelar={onHandleCancelarEliminar}
            onSi={onHandleSubmitEliminar}
            accion={accionEliminar}
            data={formData}
            mensaje={errorGenerico}
            cargando={enProceso}
          />
        </div>
      )}

      {/* ESTRUCTURA DE ALTO RENDIMIENTO */}
      <div className="amb_layout_container">
        {/* BUSCADOR: ahora es un panel lateral que se esconde */}
        <div
          className={`area_buscador_lateral ${buscadorAbierto ? "abierto" : ""}`}
        >
          <button
            type="button"
            className="area_buscador_lengueta"
            onClick={() => setBuscadorAbierto((prev) => !prev)}
            aria-expanded={buscadorAbierto}
            aria-label={buscadorAbierto ? "Ocultar filtros" : "Mostrar filtros"}
          >
            <Search size={16} />
            <span className="area_buscador_lengueta_texto">Filtro</span>
            <ChevronRight size={14} className="area_buscador_flecha" />
          </button>

          <div className="area_buscador_cuerpo">
            <Buscadores
              tituloBuscador="Filtro de Busqueda"
              intputBuscador={inputsFiltro}
              buscadorData={filtroData}
              onChange={onHandleChangeBuscador}
              captionBoton="Agregar"
              onAgregar={onHandleAgregar}
              estados={estados}
              onEstados={onHandleEstado}
              onItems={onHandleItems}
            />
          </div>
        </div>

        {/* LISTADO: ocupa todo el centro, ahora arranca más arriba */}
        <main className="area_listado">
          <ListadoMolde
            items={dataAlumnosListado}
            onEditar={onModificar}
            onEliminar={onEliminar}
            carga={carga}
            error={error}
            statusCode={statuscode}
            botonEstado={botonTexto}
          />
        </main>

        {/* PAGINACIÓN */}
        <footer className="area_paginacion">
          <Paginacion
            contadorPagina={barraPaginacion.contadorPagina || 0}
            paginaActual={barraPaginacion.pagina || 1}
            onPaginaCambiada={onHandlePaginaCambiada}
          />
        </footer>
      </div>
    </div>
  );
};
