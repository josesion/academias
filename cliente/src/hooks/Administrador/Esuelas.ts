import { useReducer, useEffect } from "react";

import { initialEscuelas, EscuelasReducer, type EscuelasAction } from "../../reducers/escuelas.reducer";
import { useEffectServicio } from "../../utils/useEfectServicio";

import { type EscuelasTipado } from "../../reducers/escuelas.reducer";
import type{  EscuelaListadoRow, PutEscuelasInputs } from "../../servicio/escuelas.fetch";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

export interface EscuelasProps {
    servicios : {
        postEscuelas :ServicioCrud,
        getEscuelas : ServicioCrud,
        putEscuelas : ServicioCrud,
        estadoEscuelas : ServicioCrud
    }    
};

export const  EscuelasLogica = ( config : EscuelasProps ) =>{

    const [state, dispatch] = useReducer( EscuelasReducer,initialEscuelas() );
    const { imagen } = state;
    const { urlVistaPrevia } = imagen;

//////////////////////////////////////////////////////////////////////////////////////////////////////
// SECCION PARA CACHEAR INFORMACION 
/////////////////////////////////////////////////////////////////////////////////////////////////////
    const handleCerrarFormulario = () =>{
        dispatch({ type : "CERRAR_MODAL"});
    };

    const hanldeAbrirPostFormulario = () =>{
        dispatch({ type : "ABRIR_MODAL", payload : "POST" });
    };

    const handleAbirModalEstado = ( escuela: EscuelaListadoRow ) =>{
        dispatch({ type : "ID_ESCUELA", payload : escuela.id_escuela });
        dispatch({ type: "SET_MODAL_ESTADO", payload: true });
    };

    const handleCerrarModalEstado = () => {
        dispatch({ type: "SET_MODAL_ESTADO", payload: false });
    };

    const cachearFiltros = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) =>{

    };



    const cachearFormulario = (event: React.ChangeEvent<HTMLInputElement>) =>{
        
        const { value, name} = event.target;
      
        dispatch({  
            type : "SET_CAMPO_FORM", 
            payload : { 
                field : name  as keyof EscuelasTipado["formulario"], 
                value : value 
            }});

    };
    
    const cacharFormularioPut = (escuela: EscuelaListadoRow) => {
        dispatch({ type: "CARGAR_ESCUELA_EDICION", payload: escuela });
        dispatch({ type : "ID_ESCUELA" , payload : escuela.id_escuela});
        dispatch({ type: "ABRIR_MODAL", payload : "PUT" });
    };

//////////////////////////////////////////////////////////////////////////////////////////////////////
// SECCION DE HANLDES
/////////////////////////////////////////////////////////////////////////////////////////////////////
    const handlePostEscuelas = async (event: React.MouseEvent<HTMLButtonElement>) =>{
            event.preventDefault();

    // 1. Extraemos los valores de forma plana para validar más cómodamente
    const dni = state.formulario.dni_propietario.value.trim();
    const nombre = state.formulario.nombre_propietario.value.trim();
    const apellido = state.formulario.apellido_propietario.value.trim();
    const razonSocial = state.formulario.razon_social.value.trim();
    const direccion = state.formulario.direccion.value.trim();
    const celular = state.formulario.celular.value.trim();
    const logo = state.imagen.imagen; // El archivo File o null

    // 2. Validaciones mínimas obligatorias
    if (!dni || !nombre || !apellido || !razonSocial || !direccion || !celular) {
        dispatch({ type : "ERROR_GENERICO", payload : "Todos los campos son obligatorios." })
        return; 
    }

    // Validación opcional: Verificar si el DNI o celular tienen formato numérico básico
    if (isNaN(Number(dni)) || isNaN(Number(celular))) {
        dispatch({ type : "ERROR_GENERICO", payload : "El DNI y el celular deben ser valores numéricos válidos." })
        return;
    }

    // Validación opcional: Asegurar que cargó la imagen si es requerida en el POST
    if (!logo) {
        dispatch({ type : "ERROR_GENERICO", payload : "Debes seleccionar una imagen o logo para la academia." })
        return;
    }

    // 3. Si pasa todas las validaciones, armamos el payload listo para enviar
    const payloadEscuela = {
        dni_propietario: Number(dni),
        nombre_propietario: nombre,
        apellido_propietario: apellido,
        razon_social: razonSocial,
        direccion: direccion,
        celular: celular,
        imagen: logo
    };

        try{
            dispatch({ type : "SET_CARGA", payload : true});
            const postEscuelas = config.servicios.postEscuelas;
      
            const resultPostEscuelas = await postEscuelas(payloadEscuela);
      
            if (resultPostEscuelas.code === "ESCUELA_POST_OK"){
               dispatch({ type : "RESET_FORM" }); 
               dispatch({ type : "ACTUALIZAR"});
            };

            if (
                resultPostEscuelas.code === "FORMATO_IMAGEN_INVALIDO" || 
                resultPostEscuelas.code === "TAMANO_IMAGEN_INVALIDO" || 
                resultPostEscuelas.code === "ERROR_SUBIR_IMAGEN" ||
                resultPostEscuelas.code === "DNI_RAZON_SOCIAL_EXISTENTE"
            ) {
                dispatch({ type : "ERROR_GENERICO", payload : resultPostEscuelas.message});
            };           

        }catch(error){
            dispatch({ type : "ERROR_GENERICO", payload : "Error en el servidor, intente mas tarde." })
        }finally{
            dispatch({ type : "SET_CARGA", payload : false});
        };


    };


    const handlePutEscuelas =async (event: React.MouseEvent<HTMLButtonElement>) =>{
        event.preventDefault();
       // console.log(state.formulario)
       // console.log(state.imagen)
    // 1. Extraemos los valores de forma plana para validar más cómodamente
        const id_escuela = state.id_escuela;
        const dni = state.formulario.dni_propietario.value.trim();
        const nombre = state.formulario.nombre_propietario.value.trim();
        const apellido = state.formulario.apellido_propietario.value.trim();
        const razonSocial = state.formulario.razon_social.value.trim();
        const direccion = state.formulario.direccion.value.trim();
        const celular = state.formulario.celular.value.trim();
        const logo = state.imagen.imagen; // El archivo File o null

        // 2. Validaciones mínimas obligatorias
        if (!dni || !nombre || !apellido || !razonSocial || !direccion || !celular) {
            dispatch({ type : "ERROR_GENERICO", payload : "Todos los campos son obligatorios." })
            return; 
        }

        // Validación opcional: Verificar si el DNI o celular tienen formato numérico básico
        if (isNaN(Number(dni)) || isNaN(Number(celular))) {
            dispatch({ type : "ERROR_GENERICO", payload : "El DNI y el celular deben ser valores numéricos válidos." })
            return;
        }
   
      const datos: PutEscuelasInputs = {
            id_escuela : id_escuela,
            dni_propietario: Number(dni),
            nombre_propietario: nombre,
            apellido_propietario: apellido,
            razon_social: razonSocial,
            direccion: direccion,
            celular: celular,
            imagen: logo,
            imagenMod: state.imagen.modificado ?? false
        };

        try{
            dispatch({ type : "SET_CARGA", payload : true});
            const putEscuela = config.servicios.putEscuelas;

            const resultPutEscuela = await putEscuela( datos );

            if ( resultPutEscuela.code === 'ESCUELA_UPDATE_OK'){
                dispatch({ type : "RESET_FORM" }); 
                dispatch({ type : "ACTUALIZAR" });
            };
        
            if (resultPutEscuela.code === "DNI_RAZON_SOCIAL_EXISTENTE" ){
                dispatch({ type : "ERROR_GENERICO" , payload : resultPutEscuela.message });
            };


        }catch(error){
            dispatch({ type : "ERROR_GENERICO", payload : "Error en el servidor, intente mas tarde." })
        }finally{
            dispatch({ type : "SET_CARGA", payload : false});
        };

    };

    const handleEstadoEscuelas = async () =>{
    
        if (!state.id_escuela) {
          
            dispatch({ type: "ERROR_GENERICO", payload: "No hay escuela seleccionada" });
            return;
        }
         
        if (!state.estadoListado || (state.estadoListado !== "activos" && state.estadoListado !== "inactivos")) {
            dispatch({ type: "ERROR_GENERICO", payload: "Estado inválido: debe ser 'activos' o 'inactivos'" });
            return;
        }
        // TODO: lógica para cambiar estado de la escuela
       
        try{
            dispatch({ type : "SET_CARGA", payload : true });
            const data = {
                id_escuela: state.id_escuela,
                nuevo_estado: state.estadoListado === "activos" ? "inactivos" : "activos"
            };

            const estadoEscuela = config.servicios.estadoEscuelas;

            const resultEstadoEscuela = await  estadoEscuela(data);    

            // ESTO QUEDA PENDIENDO AHSTA Q COLOQUE EL BUSCADOR

            console.log(resultEstadoEscuela);

        }catch( error ){
                dispatch({ type : "ERROR_ESTADO", payload : "Error al cambiar el estado de la escuela." });
        }finally{   
           dispatch({ type : "SET_CARGA" , payload : false }); 
        };

    };

    const handleCambioImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const archivo = e.target.files?.[0] || null;
        
        if (state.metodo === "PUT" ){
            dispatch({ type : "SET_IMAGEN_MOD" , payload : true });
        }

        if (archivo) {
            if (archivo.type.startsWith("image/")) {
                dispatch({ type: "SET_IMAGEN", payload: archivo });
            } else {
                alert("Por favor, seleccioná un archivo de imagen válido.");
                // Opcional: limpiar el input si no es válido
            }
        } else {
            dispatch({ type: "SET_IMAGEN", payload: null });
        }
    };




    useEffect(() => {
        return () => {
            // Solo revocamos si la URL existe y empieza con 'blob:' 
            // (lo que indica que fue creada localmente)
            if (urlVistaPrevia && urlVistaPrevia.startsWith("blob:")) {
                URL.revokeObjectURL(urlVistaPrevia);
            }
        };
    }, [urlVistaPrevia]);    

   
//////////////////////////////////////////////////////////////////////////////////////////////////////
//  LISTADO DE ESCUELAS
/////////////////////////////////////////////////////////////////////////////////////////////////////  
    const valores1 = {
        apellido: "",
        dni: "",
        razon_social: "",
        estado: "activos",
        pagina: 1,
        limit: 30,
        offset: 0
    }

    useEffectServicio<any , any , EscuelasAction>({
        dispatch : dispatch,
        servicios : config.servicios.getEscuelas,
        valores : valores1,
        accionResultado : ( resultado) =>({ type : "SET_LISTADO_ESCUELA", payload : resultado}),
        accionCarga : ( carga ) =>({type : "SET_CARGA_LISTADO", payload : carga }),
        accionError : ( mensaje ) =>({ type : "ERROR_GENERICO_LISTADO", payload : mensaje}),
        useAbort :  true,
        dependencias :[state.actualizar]
    });



    return{
        state,
        handleCambioImagen,
        handleCerrarFormulario, hanldeAbrirPostFormulario,
        handleAbirModalEstado,
        handleCerrarModalEstado,
        handlePostEscuelas, handlePutEscuelas, handleEstadoEscuelas,
        cachearFormulario, cachearFiltros,
        cacharFormularioPut,
    }

};