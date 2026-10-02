import type{  EscuelaListadoRow } from "../servicio/escuelas.fetch";

export interface CeldasInput {
    name: string;
    value: string;
}

export interface EscuelasTipado {
    metodo: "POST" | "PUT"  | null;
    modalAbierto: boolean;
    modalEstado: boolean;
    error : string | null;
    errorEstado: string | null;
    carga : boolean ;
    id_escuela : number | null,
    actualizar : number,
    estadoListado: "activos" | "inactivos" | null,

    // Paginación
    pagina: number;
    limit: number;

    formulario: {
        dni_propietario: CeldasInput;
        nombre_propietario: CeldasInput;
        apellido_propietario: CeldasInput;
        razon_social: CeldasInput;
        direccion: CeldasInput;
        celular: CeldasInput;

    };

    filtros: {
        apellido: CeldasInput;
        razon_social: CeldasInput;
        estado: "activos" | "inactivos" | null;
    };

    imagen: {
        imagen: File | null;
        urlVistaPrevia: string | null;
        modificado?: boolean | null;
    };

    errorListado : string | null;
    cargaListado : boolean
    listadoEscuelas :  EscuelaListadoRow[] |  null   

}

export const initialEscuelas = (): EscuelasTipado => ({
    metodo: "POST",
    modalAbierto: false,
    modalEstado: false,
    error : null,
    errorEstado: null,
    carga : false,
    id_escuela :  null,
    actualizar : 0,
    estadoListado: "activos",

    // Paginación
    pagina: 1,
    limit: 30,

    formulario: {
        dni_propietario: { name: "dni_propietario", value: "" },
        nombre_propietario: { name: "nombre_propietario", value: "" },
        apellido_propietario: { name: "apellido_propietario", value: "" },
        razon_social: { name: "razon_social", value: "" },
        direccion: { name: "direccion", value: "" },
        celular: { name: "celular", value: "" },

    },

    filtros: {
        apellido: { name: "apellido", value: "" },
        razon_social: { name: "razon_social", value: "" },
        estado: null,
    },

    imagen: { 
        imagen: null, 
        urlVistaPrevia: null,
        modificado: null 
    },

    cargaListado : false, 
    errorListado : null,
    
    listadoEscuelas: null
});

// 🎯 Acciones tipadas para cubrir todo el flujo
export type EscuelasAction =
    | { type: "SET_METODO"; payload: "POST" | "PUT"  | null }
    | { type: "SET_CAMPO_FORM"; payload: { field: keyof EscuelasTipado["formulario"]; value: string } }
    | { type: "RESET_FORM" }
    | { type: "CARGAR_ESCUELA_EDICION"; payload: any } // Recibe los datos de la escuela para editar
    | { type: "ABRIR_MODAL"; payload: "POST" | "PUT" } 
    | { type: "CERRAR_MODAL" }
    | { type: "ERROR_GENERICO", payload : string | null}
    | { type: "SET_CARGA", payload : boolean}
    | { type: "ERROR_GENERICO_LISTADO", payload : string | null}
    | { type: "SET_CARGA_LISTADO", payload : boolean}
    | { type: "SET_LISTADO_ESCUELA" , payload : EscuelaListadoRow[]  | null }
    | { type: "SET_IMAGEN_MOD", payload : boolean }
    | { type: "SET_IMAGEN"; payload: File | null } 
    | { type: "ID_ESCUELA", payload : number | null }
    | { type: "ACTUALIZAR" }
    | { type: "SET_MODAL_ESTADO"; payload: boolean }
    | { type: "SET_ESTADO_LISTADO"; payload: "activos" | "inactivos" | null }
    | { type: "ERROR_ESTADO"; payload: string | null }
    // Filtros
    | { type: "SET_CAMPO_FILTRO"; payload: { field: keyof EscuelasTipado["filtros"]; value: string | null } }
    | { type: "RESET_FILTROS" }
    // Paginación
    | { type: "SET_PAGINACION"; payload: { pagina?: number; limit?: number } }

export const EscuelasReducer = ( 
    state: EscuelasTipado, 
    action: EscuelasAction
): EscuelasTipado => {

    switch (action.type) {

        case "SET_METODO":
            return {
                ...state,
                metodo: action.payload
            };

        case "SET_CAMPO_FORM":
            return {
                ...state,
                formulario: {
                    ...state.formulario,
                    [action.payload.field]: {
                        ...state.formulario[action.payload.field],
                        value: action.payload.value
                    }
                }
            };


        case "SET_CAMPO_FILTRO":
            return {
                ...state,
                filtros: {
                    ...state.filtros,
                    [action.payload.field]: action.payload.field === "estado"
                        ? action.payload.value
                        : {
                            ...state.filtros[action.payload.field],
                            value: action.payload.value
                        }
                }
            };

    
        case "ID_ESCUELA" :
            return {
                ...state,
                id_escuela : action.payload
            }    

        case "SET_IMAGEN":
            return {
                ...state,
                imagen: {
                    ...state.imagen,
                    imagen: action.payload,
                    // Si hay archivo nuevo, creamos una URL local temporal para mostrarla en pantalla
                    urlVistaPrevia: action.payload ? URL.createObjectURL(action.payload) : null,
                    modificado: state.metodo === "PUT" ? true : null
                }
            };

        case "CARGAR_ESCUELA_EDICION":
            // Útil cuando abrís el modal para editar y cargás los datos existentes
            return {
                ...state,
                metodo: "PUT",
                formulario: {
                    dni_propietario: { name: "dni_propietario", value: String(action.payload.dni_propietario || "") },
                    nombre_propietario: { name: "nombre_propietario", value: action.payload.nombre_propietario || "" },
                    apellido_propietario: { name: "apellido_propietario", value: action.payload.apellido_propietario || "" },
                    razon_social: { name: "razon_social", value: action.payload.razon_social || "" },
                    direccion: { name: "direccion", value: action.payload.direccion || "" },
                    celular: { name: "celular", value: action.payload.celular || "" },
                },
                imagen: {
                    imagen: null, // De entrada no hay un File nuevo cargado
                    urlVistaPrevia: action.payload.urlImagen || "",
                    modificado: false // Arranca en false porque todavía no tocó la imagen en el PUT
                },
            
            };

        case "ABRIR_MODAL":
            return {
                ...state,
                modalAbierto: true,
                metodo: action.payload //  Setea automáticamente si es POST o PUT al abrir
            };

        case "SET_MODAL_ESTADO":
            return {
                ...state,
                modalEstado: action.payload
            };

        case "SET_ESTADO_LISTADO":
            return {
                ...state,
                estadoListado: action.payload
            };

        case "ERROR_ESTADO":
            return {
                ...state,
                errorEstado: action.payload
            };

        case "ERROR_GENERICO":
            return {
                ...state,
                error : action.payload
            };

        case "SET_CARGA":
            return {
                ...state,
                carga : action.payload
            };

        case "CERRAR_MODAL":
        return {
                ...state,
                modalAbierto: false,
                // Reseteamos los campos del formulario y errores del form, PERO PRESERVAMOS EL LISTADO
                metodo: "POST",
                error: null,
                carga: false,
                formulario: {
                    dni_propietario: { name: "dni_propietario", value: "" },
                    nombre_propietario: { name: "nombre_propietario", value: "" },
                    apellido_propietario: { name: "apellido_propietario", value: "" },
                    razon_social: { name: "razon_social", value: "" },
                    direccion: { name: "direccion", value: "" },
                    celular: { name: "celular", value: "" },
                },
                imagen: {
                    imagen: null,
                    urlVistaPrevia: null,
                    modificado: null
                }
                // listadoEscuelas, cargaListado y errorListado se quedan intactos gracias al ...state
            };
 
        case  "SET_IMAGEN_MOD" :
            return {
                ...state,
                imagen: {
                    ...state.imagen,
                    modificado: action.payload
                 }
            }

    
        case "ERROR_GENERICO_LISTADO":
            return {
                ...state,
                errorListado : action.payload
            };

        case "SET_LISTADO_ESCUELA" : 
            return {
                ...state,
                listadoEscuelas : action.payload
            }    

        case "SET_CARGA_LISTADO":
            return {
                ...state,
                cargaListado : action.payload
            };    
        
        case "ACTUALIZAR" : 
            return {
                ...state, 
                actualizar : state.actualizar +1
            }    

        
        case "RESET_FORM":
            return {
                ...state,
                metodo: null,
                error: null,
                carga: false,
                id_escuela : null,
                formulario: {
                    dni_propietario: { name: "dni_propietario", value: "" },
                    nombre_propietario: { name: "nombre_propietario", value: "" },
                    apellido_propietario: { name: "apellido_propietario", value: "" },
                    razon_social: { name: "razon_social", value: "" },
                    direccion: { name: "direccion", value: "" },
                    celular: { name: "celular", value: "" },
                },
                imagen: {
                    imagen: null,
                    urlVistaPrevia: null,
                    modificado: null
                },
                // Forzamos explícitamente a mantener lo que ya tenía el listado y el modal
                listadoEscuelas: state.listadoEscuelas,
                cargaListado: state.cargaListado,
                errorListado: state.errorListado,
                modalAbierto: false,

            };        


        case "RESET_FILTROS":
            return {
                ...state,
                filtros: {
                    apellido: { name: "apellido", value: "" },
                    razon_social: { name: "razon_social", value: "" },
                    estado: null,
                },
            };

        case "SET_PAGINACION":
            return {
                ...state,
                pagina: action.payload.pagina ?? state.pagina,
                limit: action.payload.limit ?? state.limit,
            };


        default: 
            return state;

    };
};