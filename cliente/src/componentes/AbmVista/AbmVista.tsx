import { Formulario } from "../../componentes/Formulario/Formulario";
import { ListadoMolde } from "../../componentes/ListaMolde/Listado";
import { Buscadores } from "../../componentes/Buscadores/Buscador";
import { Paginacion } from "../../componentes/Paginacion/Paginacion";
import { EliminarVentana } from "../EliminarModal/EliminarModal";

import "./ambcss.css";

// Aquí definimos los tipos de las props que el componente recibirá
/**
 * @typedef {Object} AmbViewProps
 * // === Control de Modales y Formulario ===
 * @property {boolean} modal - Controla la visibilidad del modal de Alta/Modificación.
 * @property {boolean} modalEliminar - Controla la visibilidad del modal de Eliminación.
 * @property {Record<string, string | null>} errorsZod - Errores de validación por campo del formulario.
 * @property {string | null} errorGenerico - Mensaje de error a nivel de formulario/proceso de eliminación.
 * @property {any} formData - Datos actuales del formulario de Alta/Modificación.
 * @property {any[]} inputsEntidad - Definición de los campos del formulario.
 * @property {"alta" | "modificar"} tipoFormulario - Indica el modo de la operación actual.
 * @property {string} botonTexto - Texto para el botón de acción principal de la lista.
 * @property {string} accionEliminar - Descripción del elemento a eliminar.
 * * // === Listado y Paginación ===
 * @property {any[]} dataAlumnosListado - Datos de la tabla a mostrar.
 * @property {any} barraPaginacion - Objeto con los datos de paginación (página actual, total, etc.).
 * @property {boolean} carga - Indica si la carga de datos de la lista o una acción de ABM está en curso.
 * @property {boolean} error - Indica si ocurrió un error al cargar la lista.
 * @property {number} statuscode - Código de estado HTTP de la última carga de listado.
 * * // === Buscador y Filtro ===
 * @property {any} filtroData - Datos actuales del formulario de filtro.
 * @property {any[]} inputsFiltro - Definición de los campos para el buscador.
 * @property {string[]} estados - Opciones de estado (ej: Activo/Inactivo) para el filtro.
 * * // === Handlers (Funciones) ===
 * @property {function(React.ChangeEvent<HTMLInputElement>): void} onHandleChangeBuscador - Manejador de cambios en los inputs del buscador.
 * @property {function(): void} onHandleCancelar - Cierra el modal de formulario.
 * @property {function(React.FormEvent<HTMLFormElement>): Promise<void>} onHandleSubmit - Envía el formulario de Alta/Modificación.
 * @property {function(React.ChangeEvent<HTMLInputElement>): void} onHandleChangeFormulario - Manejador de cambios en los inputs del formulario.
 * @property {function(): void} onHandleAgregar - Abre el modal en modo 'alta'.
 * @property {function(React.ChangeEvent<HTMLSelectElement>): void} onHandleEstado - Manejador para el cambio de filtro de estado.
 * @property {function(number): void} onHandlePaginaCambiada - Maneja el evento de cambio de página.
 * @property {function(any): void} [onModificar] - Función para iniciar la modificación de un ítem (desde la tabla).
 * @property {function(any): void} [onEliminar] - Función para abrir el modal de eliminación (desde la tabla).
 * @property {function(): void} [onHandleCancelarEliminar] - Cancela y cierra el modal de eliminación.
 * @property {function(): Promise<void>} onHandleSubmitEliminar - Confirma y ejecuta la eliminación.
 */

// Aquí definimos los tipos de las props que el componente recibirá
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
  onHandleItems: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onHandleItemsFormulario: (e: React.ChangeEvent<HTMLSelectElement>) => void;

  onHandlePaginaCambiada: (pagina: number) => void;

  onModificar?: (data: any) => void;
  onEliminar?: (data: any) => void;

  onHandleCancelarEliminar?: () => void;
  onHandleSubmitEliminar: () => Promise<void>;
}

/**
 * @function AmbVistas
 * @description Componente funcional React que renderiza la estructura completa de un módulo ABM,
 * incluyendo Buscador, Listado, Paginación y Modales de Formulario y Eliminación.
 * @param {AmbViewProps} props - Propiedades pasadas desde el componente de lógica (AmbAlumnos).
 * @returns {JSX.Element} La estructura visual completa del ABM.
 */

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

  return (
    <div className="amb_contenedor_principal">
      {modal && (
        <div className="formulario_overlay">
          <Formulario
            data={inputsEntidad}
            formData={formData}
            textoSubmit="Registrar"
            tituloFormulario={
              tipoFormulario === "alta"
                ? `Alta ${entidad}`
                : `Mofidicar ${entidad}`
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
        <div className="modal_eliminar">
          <EliminarVentana
            onCancelar={onHandleCancelarEliminar}
            onSi={onHandleSubmitEliminar}
            accion={accionEliminar}
            data={formData}
            mensaje={errorGenerico}
          />
        </div>
      )}

      <div className="listado_contenedor_principal">
        <div className="buscador_contenedor">
          <Buscadores
            intputBuscador={inputsFiltro}
            tituloBuscador=""
            buscadorData={filtroData}
            onChange={onHandleChangeBuscador}
            captionBoton="Agregar"
            onAgregar={onHandleAgregar}
            estados={estados}
            onEstados={onHandleEstado}
            onItems={onHandleItems}
          />
        </div>
        <div className="Listado_contenedor">
          <ListadoMolde
            items={dataAlumnosListado}
            onEditar={onModificar}
            onEliminar={onEliminar}
            carga={carga}
            error={error}
            statusCode={statuscode}
            botonEstado={botonTexto}
          />
        </div>
        <div className="paginacion_contenedor">
          <Paginacion
            contadorPagina={barraPaginacion.contadorPagina || 0}
            paginaActual={barraPaginacion.pagina || 1}
            onPaginaCambiada={onHandlePaginaCambiada}
          />
        </div>
      </div>
    </div>
  );
};
