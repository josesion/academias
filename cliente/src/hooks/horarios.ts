import { useEffect, useReducer} from "react";
import { useNavigate } from "react-router-dom";

import { peticiones } from "../utils/peticiones";
import { generarRangoUnaHora } from "./setHora";

import { mensajeErrorTemporal } from "./mensajeTemporales";
import { initialState, horarioReducer } from "../reducers/horariosReducers";

/**
 * @typedef {function(data: any, signal?: AbortSignal): Promise<any>} ServicioCrud
 * Define el contrato para las funciones de servicio CRUD (asíncronas).
 */
type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;
import type * as TipadoHorario from "../tipadosTs/horario";
import { type ClaseHorario  } from "../componentes/ClasesAsignadas/ClasesAsiganadas";
import { type MensajeCelda } from "../componentes/CeldaVacia/CeldaVacia";


interface HorarioConfig {

    servicios : {
        listadoProfesores : ServicioCrud,
        listadoNivel : ServicioCrud,
        listadoTipo : ServicioCrud,
        horarioEscuela : ServicioCrud,
        altaHorario   : ServicioCrud,
        modHorario   : ServicioCrud,
        eliminarHorario : ServicioCrud,
        HORARIOS  :  TipadoHorario.Horas[], 
        DIAS_SEMANA : TipadoHorario.DiaSemana[],

    },
    inicialFiltroProfesor : { dni : string },
    inicialFiltroNivel : { nivel : string },
    inicialFiltroTipo : { tipo : string },

};


export const useHorarioHook = ( config : HorarioConfig ) =>{

    const irA = useNavigate();
    const [ state , dispatch] = useReducer( horarioReducer, initialState());

    const setErrorGenericoAdapter = (error: string | null) => {
        dispatch({ type: 'SET_ERROR', payload: error });
    };    

    const setCargaAdapter = ( valor : boolean) => {
        dispatch({ type: 'SET_CARGA', payload: valor });
    };

// ──────────────────────────────────────────────────────────────
//  Parametros que se  usa el  Calendarrio
// ──────────────────────────────────────────────────────────────  
    const horarios : TipadoHorario.Horas[] = config.servicios.HORARIOS;
    const diasSemana : TipadoHorario.DiaSemana[] = config.servicios.DIAS_SEMANA;

// ──────────────────────────────────────────────────────────────
// Funciones Handle para la Seccion de Horarios de las escuelas
// ──────────────────────────────────────────────────────────────  

    const handleCachearProfesores = ( e: React.ChangeEvent<HTMLInputElement> ) =>{

       dispatch({ type : "SET_FILTRO_BUSQUEDA_PROFESOR", payload : { ...state.filtroBusquedaProfesor, [ e.target.name ] : e.target.value }}); 

       const dniProfesor = e.target.value;
       const profeSeleccionado = state.listaProfe.find( profe => profe.Dni === dniProfesor);
       if( profeSeleccionado ){
 
            dispatch({ type : "SET_PROFESORES", payload : profeSeleccionado });
            dispatch({ type : "SET_CONJUNTO_ID_HORARIO" , payload : { ...state.conjuntoIDHorario, dni_profe : profeSeleccionado.Dni } });
            dispatch({ type : "SET_DATA_FORM_HORARIO", payload : { ...state.dataFormHorario, dni_profesor : profeSeleccionado.Dni }});
            dispatch({ type : "SET_DATA_MOD_HORARIO", payload : { ...state.dataModHorario, dni_profesor : profeSeleccionado.Dni }});
       } else {
    
            dispatch({ type : "SET_PROFESORES", payload : null }); 
            dispatch({ type : "SET_CONJUNTO_ID_HORARIO" , payload : { ...state.conjuntoIDHorario, dni_profe : null } });                 
            dispatch({ type : "SET_DATA_FORM_HORARIO", payload : { ...state.dataFormHorario , dni_profesor : null} });
            dispatch({ type : "SET_DATA_MOD_HORARIO", payload : { ...state.dataModHorario, dni_profesor : null }});            
       }
    };
    
    const handleCachearNiveles = ( e: React.ChangeEvent<HTMLInputElement> ) =>{

        dispatch({ type : "SET_FILTRO_BUSQUEDA_NIVEL", payload : { ...state.filtroBusquedaNivel, [ e.target.name ] : e.target.value  }});
        const nivelSeleccionado = state.listaNiveles.find( nivel => nivel.nivel === e.target.value);
    
        if( nivelSeleccionado ){

            dispatch({ type : "SET_NIVELES", payload : nivelSeleccionado });
            dispatch({ type : "SET_CONJUNTO_ID_HORARIO" , payload : { ...state.conjuntoIDHorario, id_nivel : nivelSeleccionado.id} });   
            dispatch({ type : "SET_DATA_FORM_HORARIO", payload : { ...state.dataFormHorario , id_nivel : nivelSeleccionado.id } });           
            dispatch({ type : "SET_DATA_MOD_HORARIO", payload : { ...state.dataModHorario, id_nivel : nivelSeleccionado.id }});             
        } else {
  
            dispatch({ type : "SET_NIVELES", payload : null });            
            dispatch({ type : "SET_CONJUNTO_ID_HORARIO" , payload : { ...state.conjuntoIDHorario, id_nivel : null }} );   
            dispatch({ type : "SET_DATA_FORM_HORARIO", payload : { ...state.dataFormHorario , id_nivel : null } });                     
            dispatch({ type : "SET_DATA_MOD_HORARIO", payload : { ...state.dataModHorario, dni_profesor : null }});                    
        };
    };
    
   const handleCachearTipos = (e :  React.ChangeEvent<HTMLInputElement> ) =>{

         dispatch({ type : "SET_FILTRO_BUSQUEDA_TIPO", payload : { ...state.filtroBusquedaTipo,  [ e.target.name ] : e.target.value } }); 
        
         const tipoSeleccionado = state.listaTipo.find( tipo => tipo.tipo === e.target.value);   
         if( tipoSeleccionado ){
           
            dispatch({ type : "SET_TIPO", payload : tipoSeleccionado });
            dispatch({ type : "SET_CONJUNTO_ID_HORARIO" , payload : { ...state.conjuntoIDHorario, id_tipo_clase : tipoSeleccionado.id } }); 
            dispatch({ type : "SET_DATA_FORM_HORARIO", payload : { ...state.dataFormHorario , id_tipo_clase : tipoSeleccionado.id } });     
            dispatch({ type : "SET_DATA_MOD_HORARIO", payload : { ...state.dataModHorario, id_tipo_clase : tipoSeleccionado.id }});

         } else {
          
            dispatch({ type : "SET_TIPO", payload : null });
            dispatch({ type : "SET_CONJUNTO_ID_HORARIO" , payload : { ...state.conjuntoIDHorario, id_tipo_clase : null} }); 
            dispatch({ type : "SET_DATA_FORM_HORARIO", payload : { ...state.dataFormHorario , id_tipo_clase : null } });              
            dispatch({ type : "SET_DATA_MOD_HORARIO", payload : { ...state.dataModHorario, id_tipo_clase : null }});                   
         };      
   };

// ──────────────────────────────────────────────────────────────
// Handles para abrir formulario de horarios y cerrarlos
// ────────────────────────────────────────────────────────────── 

   const handleAbrirModificarHorario = ( clase : ClaseHorario) =>{
      
        dispatch({ type : "SET_MODAL_INTERNO", payload : true });
        dispatch({ type : "SET_METODO", payload : "MOD" });
        dispatch({ type : "SET_TIPO", payload : {id: clase.id_clase ,tipo : clase.tipo_clase} });
        dispatch({ type : "SET_NIVELES", payload : {id : clase.id_nivel , nivel : clase.nivel} });
        dispatch({ type : "SET_PROFESORES", payload : {Dni : clase.dni_profe, Apellido : clase.profesor , Nombre : clase.nombre } });
        dispatch({ type : "SET_HORARIOFIN" , payload :{ hora_inicio : clase.hora_inicio as TipadoHorario.Horas , 
                                                        hora_fin : clase.hora_fin as TipadoHorario.Horas } });                    
        dispatch({ type : "SET_DIA_HORARIO", payload : clase.dia });    
        dispatch({ type : "SET_DATA_MOD_HORARIO", payload : { 
               ...state.dataModHorario, 
                id : clase.id_horario,
                dni_profesor : clase.dni_profe,
                id_nivel     : clase.id_nivel,
                id_tipo_clase: clase.id_clase 
         }});
         dispatch({ type : "SET_DATA_ELIMINAR_HORARIO" , payload : { ...state.dataEliminarHorario, id : clase.id_horario  } });

   };

   const handleAbirModalHoarios = ( mensaje : MensajeCelda) =>{
        
        if (mensaje.mensaje === "+"){
           const {hora_fin , hora_inicio} = generarRangoUnaHora(mensaje.hora);
           dispatch({ type : "SET_MODAL_INTERNO", payload : true });    
           dispatch({ type : "SET_HORARIOFIN", payload : generarRangoUnaHora(mensaje.hora) }); 
           dispatch({ type : "SET_DIA_HORARIO", payload : mensaje.dia });
           dispatch({ type : "SET_METODO", payload : "ALTA" }); 
           dispatch({ type    : "SET_DATA_FORM_HORARIO", 
                      payload : { ...state.dataFormHorario , 
                                 dia_semana : mensaje.dia,
                                 hora_inicio : hora_inicio,
                                 hora_fin    : hora_fin    }});            
        };   
   };
   
   const handleCerrarModalHoarios =  () =>{

        dispatch({ type : "SET_MODAL_INTERNO", payload : false });   
        dispatch({ type : "SET_PROFESORES", payload : null });
        dispatch({ type : "SET_TIPO", payload : null });
        dispatch({ type : "SET_NIVELES", payload : null });
        dispatch({ type : "SET_CONJUNTO_ID_HORARIO" , payload : { 
            dni_profe : null,
            id_tipo_clase  : null,
            id_nivel  : null,
            id_horario : null  
         } }); 
   };   
   
   const hanldeVolver = () =>{
     dispatch({ type : "SET_MODAL_HORARIO", payload : false });
     irA("/user_manager_priv");
   };
   
// ──────────────────────────────────────────────────────────────
// Handles de supcripciones Alta, Modificacion y Eliminar Horarios
// ────────────────────────────────────────────────────────────── 
   const handleAltaHorario = async() =>{

        if (!state.listoEnviar){
               console.log("s") 
            const mensajeBase = state.errorGenericoHorario as string;
            return    mensajeErrorTemporal({ 
                        tiempo : 3 ,
                        mensajeError:"Faltan campos verificar",
                        mensajeEspera: mensajeBase , 
                        setErrorGenerico : setErrorGenericoAdapter});
        };

        const servicioApiFetch =   config.servicios.altaHorario;
        const resultadoAlta  = await servicioApiFetch(state.dataFormHorario);
     
        if (resultadoAlta.error === true){
  
           dispatch({ type : "SET_ERROR" , payload : resultadoAlta.message });
      
           return;
        };
        dispatch({ type : "SET_ACTUALIZAR", payload : !state.actualizar });
        dispatch({ type : "RESET_FORMULARIO" });
        dispatch({ type : "SET_MODAL_INTERNO" , payload : false });

   };

   const handleModHorario =async( ) =>{
    
        if (!state.listoEnviar){
            const mensajeBase = state.errorGenericoHorario as string;
            return  mensajeErrorTemporal({ 
                    tiempo : 3 ,
                    mensajeError:"Faltan campos verificar",
                    mensajeEspera: mensajeBase , 
                    setErrorGenerico : setErrorGenericoAdapter});
        };
        const servicioApiFetch = config.servicios.modHorario;
        const resultadoMod   = await servicioApiFetch(state.dataModHorario);
        if ( resultadoMod.error === true){
            dispatch({ type : "SET_ERROR" , payload : resultadoMod.message });
            return;
        };  
        dispatch({ type : "SET_ACTUALIZAR", payload : !state.actualizar });        
        dispatch({ type : "RESET_FORMULARIO" });
        dispatch({ type : "SET_MODAL_INTERNO" , payload : false });
   }; 
   

   const handleEliminarHorario = async() =>{
        const servicioApiFetch = config.servicios.eliminarHorario;
        const resultadoEliminar = await servicioApiFetch(state.dataEliminarHorario);
       
        if (resultadoEliminar.error === true) {
            dispatch({ type : "SET_ERROR", payload : resultadoEliminar.message });
            return;
        };

        dispatch({ type : "SET_ACTUALIZAR", payload : !state.actualizar });        
        dispatch({ type : "RESET_FORMULARIO" });
        dispatch({ type : "SET_MODAL_INTERNO" , payload : false });
   };


// ──────────────────────────────────────────────────────────────
// Listado de profesores sin paginacion
// ──────────────────────────────────────────────────────────────    
useEffect(()=>{
    const {controlador , signal , timeoutId} = peticiones({
        tiempo : 5,
        setErrorGenerico : setErrorGenericoAdapter,
        setCarga : setCargaAdapter
    });

    const listadoProfesoreCompleto = async () => {
        const servicioApiFetch = config.servicios.listadoProfesores;
        try {
            const respuesta = await servicioApiFetch( state.filtroBusquedaProfesor , signal );
    
            if ( respuesta.error === false ) {
                dispatch({ type : "SET_LISTADO_PROFESORES", payload : respuesta.data });
            };
        }catch(error) {
            dispatch({ type : "SET_ERROR", payload : 'Ocurrió un error inesperado al cargar los datos Profesores.' });  
        }finally{
            clearTimeout( timeoutId );
            dispatch({ type : "SET_CARGA", payload : false });
        };

    };

    listadoProfesoreCompleto();

    return () => {
        clearTimeout( timeoutId );
        controlador.abort();
    };
}, [state.filtroBusquedaProfesor] );

// ──────────────────────────────────────────────────────────────
// Listado de niveles sin paginacion
// ──────────────────────────────────────────────────────────────    
useEffect(()=>{

    const {controlador , signal , timeoutId} = peticiones({
        tiempo : 5,
        setErrorGenerico : setErrorGenericoAdapter,
        setCarga : setCargaAdapter
    });

    const listadoNivelCompleto = async () => {
        const servicioApiFetch = config.servicios.listadoNivel;
        try {
            const respuesta = await servicioApiFetch( state.filtroBusquedaNivel , signal );

            if ( respuesta.error === false ) {
                dispatch({ type : "SET_LISTADO_NIVELES", payload : respuesta.data });
            };
        }catch(error) {
            dispatch({ type : "SET_ERROR", payload :'Ocurrió un error inesperado al cargar los datos Niveles.' });    
        }finally{
            clearTimeout( timeoutId );
            dispatch({ type : "SET_CARGA", payload : false });  
        };

    };

    listadoNivelCompleto();

    return () => {
        clearTimeout( timeoutId );
        controlador.abort();
    };
}, [state.filtroBusquedaNivel] );

// ──────────────────────────────────────────────────────────────
// Listado de Tipos sin paginacion
// ──────────────────────────────────────────────────────────────    
useEffect(()=>{

    const {controlador , signal , timeoutId} = peticiones({
        tiempo : 5,
        setErrorGenerico : setErrorGenericoAdapter,
        setCarga : setCargaAdapter
    });

    const listadoTiposCompleto = async () => {
        const servicioApiFetch = config.servicios.listadoTipo;
        try {
            const respuesta = await servicioApiFetch( state.filtroBusquedaTipo , signal );
        
            if ( respuesta.error === false ) {
                dispatch({ type : "SET_LISTADO_TIPO", payload : respuesta.data });
            };
        }catch(error) { 
            dispatch({ type : "SET_ERROR", payload :'Ocurrió un error inesperado al cargar los datos Tipos.' });            
        }finally{
            clearTimeout( timeoutId );
            dispatch({ type : "SET_CARGA", payload : false }); 
        };

    };

    listadoTiposCompleto();

    return () => {
        clearTimeout( timeoutId );
        controlador.abort();
    };
}, [ state.filtroBusquedaTipo] );

// ──────────────────────────────────────────────────────────────
// Listado de Calendario sin paginacion
// ──────────────────────────────────────────────────────────────  
useEffect( ()=>{
    const {controlador , signal , timeoutId} = peticiones({
        tiempo : 5,
        setErrorGenerico : setErrorGenericoAdapter,
        setCarga : setCargaAdapter
    });
    const calendario = async() =>{
        try{
            const servicioApiFetch = config.servicios.horarioEscuela;
            const listadoCalendario = await servicioApiFetch( state.filtroCalendario, signal )
            
            if (listadoCalendario.error === false) {
                dispatch({ type : "SET_CALENDARIO", payload : listadoCalendario.data });
            };
        }catch(error){
            console.error('Ocurrió un error inesperado al cargar los datos del Calendario.')
        }finally{
            clearTimeout( timeoutId );
            dispatch({ type : "SET_CARGA", payload : false }); 
        }
    };
  
    calendario();

    return () => {
        clearTimeout( timeoutId );
        controlador.abort();
    };

},[state.actualizar]);

// ──────────────────────────────────────────────────────────────
// Para manejar el estado q el cliente
// ──────────────────────────────────────────────────────────────  

useEffect(() => {

  if (state.metodo === "MOD") {

    dispatch({ type : "SET_ERROR", payload :"Puede modificar los datos o guardar" });  
    dispatch({ type : "SET_ENVIAR", payload : true });

    return;
  }

  if (
    !state.conjuntoIDHorario.dni_profe ||
    !state.conjuntoIDHorario.id_tipo_clase ||
    !state.conjuntoIDHorario.id_nivel
  ) {
    const faltantes: string[] = [];

    if (!state.conjuntoIDHorario.dni_profe) faltantes.push("Profesor");
    if (!state.conjuntoIDHorario.id_nivel) faltantes.push("Nivel");
    if (!state.conjuntoIDHorario.id_tipo_clase) faltantes.push("Tipo");

    dispatch({ type : "SET_ERROR", payload : `Falta seleccionar: ${faltantes.join(" , ")}` });  
    dispatch({ type : "SET_ENVIAR", payload : false });  

  } else {
   
    dispatch({ type : "SET_ERROR", payload : "Listo para Guardar." })
    dispatch({ type : "SET_ENVIAR", payload : true });  
  
}

}, [state.conjuntoIDHorario, state.metodo]);

return {
    state,
   
    horarios, 
    diasSemana, 
    handleCachearProfesores,
    handleCachearNiveles,
    handleCachearTipos,
    handleModHorario,
    handleAbirModalHoarios,
    handleAbrirModificarHorario,
    handleCerrarModalHoarios,
    handleAltaHorario,
    handleEliminarHorario,
    hanldeVolver,

};

};