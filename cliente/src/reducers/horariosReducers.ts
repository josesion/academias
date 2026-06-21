import * as TipadoHorario from "../tipadosTs/horario";
import { type ResultHoras } from "../hooks/setHora"; 

import { fechaHoy } from "../utils/fecha"; 

// ==========================================
// 1. DEFINICIÓN DEL ESTADO (MOLDE)
// ==========================================
export interface HorarioTipado{
    
    errorGenericoHorario: string | null;
    listoEnviar  : boolean;
    actualizar   : boolean;
    carga        : boolean;

    modales :{
        modalInterno : boolean,
        modalHorario : boolean 
    },

    metodo : TipadoHorario.metodo | null,  
// ──────────────────────────────────────────────────────────────
// Seccion para el filtrado de Profesores , Tipos y Niveles
// ──────────────────────────────────────────────────────────────  
    profesores : TipadoHorario.DataProfesor | null,
    listaProfe : TipadoHorario.DataProfesor[],

    niveles : TipadoHorario.DataNivel | null,
    listaNiveles : TipadoHorario.DataNivel[],

    tipo : TipadoHorario.DataTipo | null,
    listaTipo : TipadoHorario.DataTipo[],

// ──────────────────────────────────────────────────────────────
//  Estados q usa el  Calendario
// ──────────────────────────────────────────────────────────────
    
    calendario : TipadoHorario.ClaseHorarioData[],

// ──────────────────────────────────────────────────────────────
// Estados para la Tarjeta que muestra la ingo del nuevo horario
// ────────────────────────────────────────────────────────────── 

   horaInicioFin :  ResultHoras | null ,
   diaHorario    :  TipadoHorario.DiaSemana | null ,
// ──────────────────────────────────────────────────────────────
// Estados el alta del Horario
// ──────────────────────────────────────────────────────────────     
   dataFormHorario : TipadoHorario.DataHorario,
   dataModHorario  : TipadoHorario.ModHorario,
   dataEliminarHorario : TipadoHorario.EliminarHorario,
   conjuntoIDHorario  : TipadoHorario.ConjuntoIDHorario,
// ──────────────────────────────────────────────────────────────
// Estados de Filtros en general 
// ──────────────────────────────────────────────────────────────  
   filtroCalendario : TipadoHorario.Calendario,
   filtroBusquedaProfesor : TipadoHorario.FiltroProfesor,
   filtroBusquedaNivel : TipadoHorario.FiltroNivel,
   filtroBusquedaTipo  : TipadoHorario.FiltroTipo,   


};

// ==========================================
// 2. VALORES INICIALES (ESTADO CERO)
// ==========================================
export const initialState = ( ) :HorarioTipado =>({

    errorGenericoHorario : "Completar los campos Profesor , Nivel y Tipo",       
    listoEnviar   : false,
    actualizar    : false, 
    carga         : false,  

    modales : {
        modalHorario : false,
        modalInterno : false, 
    },

    metodo : null,
// ──────────────────────────────────────────────────────────────
// Seccion para el filtrado de Profesores , Tipos y Niveles
// ──────────────────────────────────────────────────────────────  
    profesores : null,
    listaProfe : [],

    niveles : null,
    listaNiveles : [],

    tipo : null,
    listaTipo : [],
// ──────────────────────────────────────────────────────────────
//  Estados q usa el  Calendario
// ──────────────────────────────────────────────────────────────
   
    calendario : [],

// ──────────────────────────────────────────────────────────────
// Estados para la Tarjeta que muestra la ingo del nuevo horario
// ────────────────────────────────────────────────────────────── 

    horaInicioFin : null,
    diaHorario    : null,
// ──────────────────────────────────────────────────────────────
// Estados el alta del Horario
// ──────────────────────────────────────────────────────────────  
   dataFormHorario : {
            dni_profesor : null,
            id_nivel :  null,
            id_tipo_clase  :  null,
            hora_inicio : null,
            hora_fin   : null,
            dia_semana : null,
            fecha_creacion : fechaHoy(),
            estado : "activos"     
   },
   dataModHorario : {
        dni_profesor : null,
        id_nivel     : null,
        id_tipo_clase: null,
        id           : null    
   },
   dataEliminarHorario : {
        id : null,
        estado : "inactivos",
        vigente : false    
   },
   conjuntoIDHorario : {
        dni_profe : null ,
        id_tipo_clase  : null,
        id_nivel  : null,
        id_horario : null     
   },
// ──────────────────────────────────────────────────────────────
// Estados de Filtros en general 
// ──────────────────────────────────────────────────────────────    
   filtroBusquedaProfesor : { dni : ""  , estado : "activos"},
   filtroBusquedaNivel    : { nivel: "" , estado : "activos" },
   filtroBusquedaTipo     : { tipo : "" , estado : "activos" },
   filtroCalendario       : { estado : "activos"}
}); 

// ==========================================
// 3. ACCIONES (EVENTOS DEL SISTEMA)
// ==========================================
export type HorarioAction =  
      | { type: 'SET_ERROR' ;  payload: string | null }
      | { type: "SET_ENVIAR" ; payload : boolean  }
      | { type: "SET_ACTUALIZAR" ; payload : boolean  }
      | { type: "SET_CARGA" ; payload : boolean  }  
      | { type : "SET_MODAL_HORARIO"  ; payload : boolean }
      | { type : "SET_MODAL_INTERNO"  ; payload : boolean }    
      | { type : "SET_METODO"  ; payload :  TipadoHorario.metodo | null }  

// ──────────────────────────────────────────────────────────────
// Seccion para el filtrado de Profesores , Tipos y Niveles
// ──────────────────────────────────────────────────────────────     

      | { type : "SET_PROFESORES"  ; payload :   TipadoHorario.DataProfesor | null }      
      | { type : "SET_LISTADO_PROFESORES"  ; payload :  TipadoHorario.DataProfesor[] }    

      | { type : "SET_NIVELES"  ; payload :   TipadoHorario.DataNivel | null }      
      | { type : "SET_LISTADO_NIVELES"  ; payload :  TipadoHorario.DataNivel[] }    

      | { type : "SET_TIPO"  ; payload :   TipadoHorario.DataTipo | null }      
      | { type : "SET_LISTADO_TIPO"  ; payload :  TipadoHorario.DataTipo[] }    

// ──────────────────────────────────────────────────────────────
//  Estados q usa el  Calendario
// ──────────────────────────────────────────────────────────────      

     | { type : "SET_CALENDARIO"  ; payload :  TipadoHorario.ClaseHorarioData[] }  
     
// ──────────────────────────────────────────────────────────────
// Estados para la Tarjeta que muestra la ingo del nuevo horaro
// ──────────────────────────────────────────────────────────────      
     | { type : "SET_HORARIOFIN"  ; payload : ResultHoras | null }  
     | { type : "SET_DIA_HORARIO"  ; payload :  TipadoHorario.DiaSemana | null }  
     
// ──────────────────────────────────────────────────────────────
// Estados el alta del Horario
// ──────────────────────────────────────────────────────────────         
     | { type : "SET_DATA_FORM_HORARIO"  ; payload :  TipadoHorario.DataHorario }
     | { type : "SET_DATA_MOD_HORARIO"   ; payload :  TipadoHorario.ModHorario } 
     | { type : "SET_DATA_ELIMINAR_HORARIO"  ; payload :  TipadoHorario.EliminarHorario } 
     | { type : "SET_CONJUNTO_ID_HORARIO"  ; payload :  TipadoHorario.ConjuntoIDHorario }   
// ──────────────────────────────────────────────────────────────
// Estados de Filtros en general 
// ────────────────────────────────────────────────────────────── 
     | { type : "SET_FILTRO_BUSQUEDA_PROFESOR"  ; payload :  TipadoHorario.FiltroProfesor } 
     | { type : "SET_FILTRO_BUSQUEDA_NIVEL"     ; payload :  TipadoHorario.FiltroNivel } 
     | { type : "SET_FILTRO_BUSQUEDA_TIPO"      ; payload :  TipadoHorario.FiltroTipo  } 
     | { type : "SET_FILTRO_CALENDARIO"         ; payload :  TipadoHorario.Calendario } 
// ──────────────────────────────────────────────────────────────
// Limpieza de los estados 
// ────────────────────────────────────────────────────────────── 
    | { type: "RESET_FORMULARIO" }   


| { type: "SELECT_PROFESOR"; payload: TipadoHorario.DataProfesor }
| { type: "RESET_PROFESOR" }


// ==========================================
// 4. EL CEREBRO (REDUCER)
// ==========================================

export const horarioReducer = (state: ReturnType<typeof initialState>, action: HorarioAction)
: ReturnType<typeof initialState> =>{

    switch(action.type){

        case 'SET_ERROR':
             return { ...state, errorGenericoHorario: action.payload };
        case 'SET_CARGA':
             return { ...state, carga : action.payload };             
        case 'SET_ACTUALIZAR':
             return { ...state, actualizar: action.payload }; 
        case 'SET_ENVIAR':
             return { ...state, listoEnviar: action.payload };  
        case 'SET_MODAL_HORARIO':
             return { ...state, modales : {...state.modales, modalHorario : action.payload }  };                           
        case 'SET_MODAL_INTERNO':
             return { ...state, modales : {...state.modales, modalInterno : action.payload }  };   
        case 'SET_METODO':
             return { ...state, metodo : action.payload };

// ──────────────────────────────────────────────────────────────
// Seccion para el filtrado de Profesores , Tipos y Niveles
// ──────────────────────────────────────────────────────────────                
        case "SET_PROFESORES" :
             return { ...state, profesores : action.payload};    
        case "SET_LISTADO_PROFESORES" :
             return { ...state, listaProfe : action.payload}; 

        case "SET_NIVELES" :
             return { ...state, niveles : action.payload};    
        case "SET_LISTADO_NIVELES" :
             return { ...state, listaNiveles : action.payload}; 

        case "SET_TIPO" :
             return { ...state, tipo : action.payload};    
        case "SET_LISTADO_TIPO" :
             return { ...state, listaTipo : action.payload};              
// ──────────────────────────────────────────────────────────────
//  Estados q usa el  Calendario
// ──────────────────────────────────────────────────────────────
        case "SET_CALENDARIO" :
             return { ...state, calendario : action.payload};  
// ──────────────────────────────────────────────────────────────
// Estados para la Tarjeta que muestra la ingo del nuevo horario
// ──────────────────────────────────────────────────────────────              
        case "SET_HORARIOFIN" :
             return { ...state, horaInicioFin : action.payload}; 
        case "SET_DIA_HORARIO" :
             return { ...state, diaHorario : action.payload};               
 // ──────────────────────────────────────────────────────────────
// Estados el alta del Horario
// ──────────────────────────────────────────────────────────────              
        case "SET_DATA_FORM_HORARIO" :
             return { ...state,  dataFormHorario : action.payload};  
        case "SET_DATA_MOD_HORARIO" :
             return { ...state,  dataModHorario : action.payload}
        case "SET_DATA_ELIMINAR_HORARIO" :
             return { ...state,  dataEliminarHorario : action.payload}                   
        case "SET_CONJUNTO_ID_HORARIO" :
             return { ...state,  conjuntoIDHorario : action.payload}
// ──────────────────────────────────────────────────────────────
// Estados de Filtros en general 
// ──────────────────────────────────────────────────────────────              
        case "SET_FILTRO_BUSQUEDA_PROFESOR" :
             return { ...state,  filtroBusquedaProfesor : action.payload};  
        case "SET_FILTRO_BUSQUEDA_NIVEL" :
             return { ...state,  filtroBusquedaNivel : action.payload}
        case "SET_FILTRO_BUSQUEDA_TIPO" :
             return { ...state,  filtroBusquedaTipo : action.payload}                   
        case "SET_FILTRO_CALENDARIO" :
             return { ...state,  filtroCalendario : action.payload}

               case "RESET_FORMULARIO": 
                         return { 
                              ...state, 
                              // 1. Reset de Selectores
                              profesores: null,
                              tipo: null,
                              niveles: null,

                              // 2. Reset de Calendario / Tarjeta
                              horaInicioFin: null,
                              diaHorario: null,

                              // 3. Reset de Conjunto ID (para el validado)
                              conjuntoIDHorario: {
                                   dni_profe: null,
                                   id_tipo_clase: null,
                                   id_nivel: null,
                                   id_horario: null
                              },

                              // 4. Reset de datos de formularios (Alta/Mod/Eliminar)
                              dataFormHorario: { 
                                   dni_profesor: null,
                                   id_nivel: null,
                                   id_tipo_clase: null,
                                   hora_inicio: null,
                                   hora_fin: null,
                                   dia_semana: null,
                                   fecha_creacion: fechaHoy(),
                                   estado: "activos"
                              },
                              dataModHorario: {
                                   dni_profesor: null,
                                   id_nivel: null,
                                   id_tipo_clase: null,
                                   id: null
                              },
                              dataEliminarHorario: {
                                   id: null,
                                   estado: "inactivos",
                                   vigente: false
                              },

                              // 5. Reset de Filtros de búsqueda (a valores vacíos)
                              filtroBusquedaProfesor: { ...state.filtroBusquedaProfesor, dni: "" },
                              filtroBusquedaNivel: { ...state.filtroBusquedaNivel, nivel: "" },
                              filtroBusquedaTipo: { ...state.filtroBusquedaTipo, tipo: "" },

                              // 6. Reset de estados de UI
                              errorGenericoHorario: "Completar los campos Profesor , Nivel y Tipo",
                              listoEnviar: false
                         };


    default:
            return state;

    };

};