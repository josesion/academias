import { useState , useEffect} from "react";
// Seccion de typados
import type { PaginacionProps } from "../tipadosTs/genericos";
import type { ErrorBackend } from "./erroresZod";

// Seccion de hooks
import { transformErrores } from "./erroresZod";
import { peticiones } from "./peticiones";


/**
 * @typedef {function(data: any, signal?: AbortSignal): Promise<any>} ServicioCrud
 * Define el contrato para las funciones de servicio CRUD (asíncronas).
 */
type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

/**
 * @interface AbmConfig
 * Contrato de configuración requerido por el hook useAbmGenerico.
 * Contiene toda la lógica de negocio y conectores específicos de la entidad.
 */
interface AbmConfig {
    recursoSingular: string; // Nombre singular del recurso (ej: "Alumno", "Curso") para mensajes.
    idEscuela : number  ,     // ID de la escuela, esencial para el scope de las operaciones.
    
    // Funciones tipadas para interactuar con la API (CRUD).
    servicios: {
        registro: ServicioCrud;
        modificar: ServicioCrud;
        eliminar: ServicioCrud;
        listado: ServicioCrud; 
    };
    
    inputsFormulario: any[]; // Array de configuración para los campos del formulario de alta/modificación.
    inputsFiltro: any[];     // Array de configuración para los campos del buscador/filtro.
    
    inicialFormData: any;    // Objeto con valores iniciales del formulario de alta (para resetear).
    
    paginacion : PaginacionProps; // Configuración inicial de la paginación (página, límite, contador).
    inicialFiltros : any;    // Objeto con valores iniciales para los filtros de búsqueda.
    
    estados: string[];       // Opciones de estado de la entidad (ej: ["activos", "inactivos"]).

    mapDeFormulario :  (dataM: any) => any;  // Mapea los datos del listado al formato del formulario (para Modificar).
    mapDataEliminar :  (data: any) => any; // Mapea los datos a la estructura requerida para la petición de Eliminar.
    mapTextoEliminar :  (data: any) => any; // Genera el texto de confirmación para el modal de eliminación.
}

/**
 * @function useAbmGenerico
 * @template TData Tipo de datos de la entidad en el listado (ej: AlumnosResponse).
 * @param {AbmConfig} config Objeto de configuración que inyecta la lógica de negocio específica.
 * @returns {object} Retorna todos los estados reactivos, configuraciones y handlers CRUD para la UI.
 * * Hook genérico que encapsula toda la lógica de estado y flujo de un componente ABM (Alta, Baja, Modificación).
 * Este hook es independiente de la entidad (Alumno, Curso, etc.).
 */
export const useAbmGenerico = <TData>( config : AbmConfig) =>{

// --- Estados de Control de UI (Modales, Carga, Mensajes) ---
    const [ modal , setModal]  = useState<boolean>(false);         // Controla la visibilidad del modal de Alta/Modificar.
    const [ modalEliminar , setModalEliminar] = useState<boolean>(false); // Controla la visibilidad del modal de confirmación de Eliminar.
    const [ accionEliminar , setAccionEliminar] = useState<string >("") ; // Texto dinámico para el modal de eliminación.
    const [ textoboton , setTextoBoton] = useState<"Eliminar" | "Restaurar" >("Eliminar") // Texto del botón de acción en la tabla (según el estado).
    const [ estadoUrl , setEstadoUrl ] = useState<"activos" | "inactivos">("inactivos"); // Estado de la entidad (para la URL de eliminación/restauración).
    const [ tipoFormulario , setTipoFormulario] = useState<"alta" | "modificar">("alta"); // Determina el modo del formulario.
    const [ carga , setCarga] = useState<boolean>(true);         // Estado de carga/loading para peticiones.

// --- Estados de Datos y Errores ---
    const [dataListado, setDataListado] = useState<TData[]>([]);              // Almacena el listado de entidades.
    const [ errorsZod, setErrorsZod] = useState<Record<string, string | null>>({ }); // Errores de validación del backend (Zod).
    const [ errorGenerico, setErrorGenerico] = useState<string | null>(null);   // Mensajes de error generales del backend/conexión.
    const [ actualizarListado , setActualizarListado] = useState<number>(0);   // Contador para forzar la actualización del listado.
    const [ estadoListado , setEstadoListado] = useState({ error : false , statuscode : 0}); // Estado y código de la última respuesta del listado.
    
// --- Estados del Formulario y Filtros ---
    const [ formData , setFormData ] = useState<any>({   // Datos del formulario de alta/modificación.
        ...config.inicialFormData,
        id_escuela : config.idEscuela
    });
    const [ barraPaginacion , setBarraPaginacion ] = useState<PaginacionProps>(config.paginacion); // Datos de la paginación (total de páginas, etc.).
    const [filtroData , setFiltroData] =  useState<any>({ // Datos del filtro de búsqueda (incluye paginación y estado).
        ... config.inicialFiltros ,
        estado : "activos" ,
        id_escuela : config.idEscuela,
        pagina : config.paginacion.pagina,
        limite : config.paginacion.limite
        } );

     

// -------------------------------- Manejadores de Modales y Acciones Principales ---------------------------------- 

/** Manejador para abrir el modal de Alta. Resetea formData y setea el tipo de formulario. */
    const handleAgragar = ( ) =>{
            setFormData({            
                ... config.inicialFormData,
                id_escuela : config.idEscuela
            });
            setModal( true );
            setTipoFormulario("alta");

    };  

/** Manejador para abrir el modal de Modificación. Mapea los datos del listado al formulario. */
    const handleModificar = ( dataM :  TData ) =>{
        const mapData = config.mapDeFormulario(dataM)
        setFormData({
            ...mapData,
            id_escuela : config.idEscuela
        })
        setTipoFormulario("modificar");
        setModal( true );

    };

/** Manejador para abrir el modal de Eliminación/Restauración. Mapea y setea el texto de confirmación. */
    const handleEliminar = ( data : TData ) =>{
        const mapData = config.mapDataEliminar(data);     
        setAccionEliminar(config.mapTextoEliminar(data));
        setFormData({   ... mapData,
                        id_escuela : config.idEscuela,
                        estado : estadoUrl });
        setModalEliminar(true);
    } 

// ---------------------------- Manejadores de Interacción de UI ----------------------

/** Cierra el modal del cuadro de eliminación/restauración. */
    const handleCancelarEliminar = () =>{
        setModalEliminar(false);
    }

/** Cierra el modal de formulario, resetea el modo y limpia los errores. */
     const handleCancelar = () =>{ 
        setModal(false) ;
        setTipoFormulario("alta");
        setErrorsZod({ null : null });
        setErrorGenerico(null);
    };   

/** Maneja el cambio de valores en los campos de filtro. Resetea la paginación a 1. */
    const handleChangeBuscador = (e: React.ChangeEvent<HTMLInputElement>) =>{
        setFiltroData({
            ...filtroData,
            pagina: 1,
            [e.target.name] : e.target.value,
        });
    };
  
/** Maneja el cambio de valores en los campos del formulario de Alta/Modificación. */
    const handleChangeFormulario = (e: React.ChangeEvent<HTMLInputElement>) => { 
        setFormData({
            ...formData,
            [e.target.name] : e.target.value,
        });
    };    

/** Maneja el cambio del estado de listado (Activos/Inactivos), ajustando el botón de acción. */
    const handleEstado = (e: React.ChangeEvent<HTMLSelectElement>) =>{
     
            if ( e.target.value === "activos" ){ 
                setEstadoUrl("inactivos");  // La acción será "inactivar" si se muestran "activos"
                setTextoBoton("Eliminar")  // El botón dirá Eliminar (o Inactivar)
            }else { 
                setEstadoUrl("activos");    // La acción será "activar" si se muestran "inactivos"
                setTextoBoton("Restaurar"); // El botón dirá Restaurar (o Activar)
            }
            setFiltroData({  // Actualiza el filtro de listado y vuelve a la página 1.
                ...filtroData,
                pagina: 1,
                estado : e.target.value
            });
    };  

/** Actualiza el filtro con la nueva página solicitada por el componente de paginación. */
    const handlePaginaCambiada = (pagina: number) => {
        setFiltroData({
            ...filtroData,
            pagina: pagina
        });
    };

// ---------------------------------- Manejadores de Submit (API) ------------------------

/** Maneja el envío del formulario de Alta o Modificación. */
  const handleSubmit   = async(e : React.FormEvent<HTMLFormElement>) =>{ 
        e.preventDefault();

        // Selecciona el servicio correcto (registro o modificar)
        const servicioApiFetch = tipoFormulario === "alta"
            ? config.servicios.registro
            : config.servicios.modificar

        const resultado = await servicioApiFetch( formData );
            
        // Manejo de errores de vole.log(resultado)alidación de campos (Zod/Backend)
        if ( resultado.error === true && resultado.code === "VALIDATION_ERROR" && resultado.errorsDetails) {
            const erroresTransformados = transformErrores( resultado.errorsDetails  as ErrorBackend[]);
            setErrorsZod(erroresTransformados);
            setErrorGenerico(resultado.message);
            return ;
        }

        // Manejo de errores generales
        if ( resultado.error === true) {
            setErrorGenerico(resultado.message);
            setErrorsZod({null : null });
            return;
        }
        
        // Éxito: Actualiza la lista, resetea el formulario y cierra el modal.
        setErrorGenerico(null);
        setErrorsZod({null : null });
        setActualizarListado( actualizarListado + 1 );
        setFormData({
            ... config.inicialFormData,
            id_escuela : config.idEscuela
        });
        
        return setModal(false)
    };

/** Maneja el envío de la confirmación de Eliminación/Restauración. */
    const handleSubmitEliminar = async( ) =>{
        const servicioApiFetch = config.servicios.eliminar;

        const resultado = await servicioApiFetch(formData);

        // Éxito: Actualiza la lista y cierra el modal.
        if ( resultado.error === false  ){ 
            setActualizarListado( actualizarListado + 1 );
            setModalEliminar(false);
            return;
        }

        // Manejo de errores, muestra el mensaje y cierra el modal tras un breve tiempo.
        if ( resultado.error === true) {
            setErrorGenerico( resultado.message);
                setTimeout(() => {
                    setModalEliminar(false);
                    return    
                }, 1500);
        }

        setModalEliminar(false);
    };


// ---------------------------------- Efecto de Listado ----------------------------------

/** Efecto principal que gestiona la carga del listado en cada cambio de filtro o actualización forzada. */
    useEffect(() => {
    // 1. Configura el controlador de aborto y la lógica del temporizador.
    const { signal, timeoutId, controlador } = peticiones({
        tiempo: 5,
        setErrorGenerico,
        setCarga
    });

    const listado = async () => {


        const servicioApiFetch = config.servicios.listado;
        try {
            setCarga(true);
                  //console.log(filtroData)
            const listado_alumnos = await servicioApiFetch(filtroData, signal);
            // NOTA: Aquí podrías añadir una lógica para redirigir al login si el statusCode es de No Autorizado.
                  //console.log(listado_alumnos)
            // Éxito: Verifica que los datos y la paginación existan.
            if (!listado_alumnos.error && listado_alumnos.data && listado_alumnos.paginacion) {
                setDataListado(listado_alumnos.data);
                setBarraPaginacion(listado_alumnos.paginacion);
                setEstadoListado({ error: listado_alumnos.error, statuscode: listado_alumnos.statusCode })
            }else{  
                // Error o lista vacía: Limpia los datos y resetea la paginación a 1.
                setEstadoListado({ error: listado_alumnos.error , statuscode: 404 }); 
                setDataListado([]); 
                setBarraPaginacion({ ...config.paginacion, contadorPagina: 1 }); 
            }
        } catch (error) {
            // Manejo de errores de conexión/aborto.
        console.log("paso algo")
            setErrorGenerico('Ocurrió un error inesperado al cargar los datos.');
        } finally {
            clearTimeout(timeoutId);
            setCarga(false);
        }
    };
        
    listado();
    return () => {
        // Cleanup: Aborta la petición y limpia el timer si el componente se desmonta o el efecto se re-ejecuta.
        controlador.abort(); 
        clearTimeout(timeoutId);
    };

}, [filtroData, actualizarListado ]); // Dependencias: se re-ejecuta con cambios en filtros o al actualizar.

// ---------------------------------- Retorno de la API del Hook ----------------------------------
     
    return{
        // Configuración Estática (para la UI: inputs, estados)
        inputsFormulario: config.inputsFormulario,
        inputsFiltro: config.inputsFiltro,
        estados: config.estados,
        entidad : config.recursoSingular,

        // Estados Reactivos (datos a renderizar y control de UI)
        modal, modalEliminar,
        dataListado,
        formData,
        filtroData,
        barraPaginacion,
        carga,
        estadoListado,
        errorsZod, errorGenerico,
        tipoFormulario, accionEliminar, textoboton,

        // Manejadores (funciones de interacción para la UI)
        handleAgragar, handleModificar, handleEliminar,
        handleChangeFormulario, handleChangeBuscador, handleEstado,
        handleSubmit, handleSubmitEliminar,
        handleCancelar, handleCancelarEliminar,
        handlePaginaCambiada,
    }

};