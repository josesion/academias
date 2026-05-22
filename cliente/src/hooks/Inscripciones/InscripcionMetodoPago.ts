import { useEffect } from "react";

//Reducer
import type { InscripcionTipado, InscripcionAcciones } from "../../reducers/inscripcionReducer";
// Tipados
import type {  MetodoPagoInput} from "../../reducers/inscripcionReducer";
type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface MetodoPagoInscripciones {

     servicios :{
        litaMetodoPago      : ServicioCrud,
     },
     state : InscripcionTipado,
     dispatch :  React.Dispatch<InscripcionAcciones>;
};


export const InscripcionMetodoPago = ( config : MetodoPagoInscripciones ) => {

    const { state , dispatch } = config;
// ──────────────────────────────────────────────────────────────
// Funcion para obtener el id del metodo de pago para guardarlo 
// ────────────────────────────────────────────────────────────── 
    const handleCachearMetodoPago = (e: React.ChangeEvent<HTMLSelectElement>) =>{
        const idSeleccionado = e.target.value;

        if ( idSeleccionado ){
            dispatch({type : "SET_CUENTA" , payload : Number(idSeleccionado)});
        }else{
            dispatch({type : "SET_CUENTA" , payload : null});
        }
    };
// ──────────────────────────────────────────────────────────────
// Funcion para obtener la descripcion si es q el usuario pone alguna
// ────────────────────────────────────────────────────────────── 
    const handleTextAreaNotas = (e: React.ChangeEvent<HTMLTextAreaElement>) =>{          
        dispatch({type : "SET_NOTAS" , payload : e.target.value});
    };


// ──────────────────────────────────────────────────────────────
// Listado de  metodos de pagos
// ──────────────────────────────────────────────────────────────

useEffect( ()=> {

    const ListaMetodoPago = async () => {
    
    const servicioFetch = config.servicios.litaMetodoPago;
    
    const data = {
        nombre_cuenta : "",
        tipo_cuenta : "todos",
        estado : "activos",
        id_escuela : state.inscripcionData.id_escuela,
        limite :10,
        pagina : 1
    };    
        try{
            dispatch({ type : "SET_CARGANDO_ENTIDAD", payload : { entidad : "metodoPago", bandera : true }});

            const listaMetodoPagoResult = await servicioFetch(data);

            if ( listaMetodoPagoResult.code === "LISTADO_TIPOS_CUENTAS_OK"){
    
                const listaSeteada = listaMetodoPagoResult.data.map((item : MetodoPagoInput ) => {
                            const metodos = {
                                descripcion_cuenta :  `${item.nombre_cuenta} : (${item.tipo_cuenta})`,
                                id_metodo : item.id_cuenta
                            }
                    return metodos
                });
                dispatch({ type : "SET_LISTADO_METODO_PAGO" , payload : listaSeteada});
                return
            };

            if ( listaMetodoPagoResult.code === "SIN_LISTADO_TIPOS_CUENTAS"){
                dispatch({ type : "SET_LISTADO_METODO_PAGO" , payload : [] });
                return;
            };    

        }catch(err){
            dispatch({type : "SET_ERROR_ENTIDAD", payload : {entidad : "metodoPago" , mensaje : "Ocurrió un error inesperado al cargar los datos de métodos de pago." }});
        }finally{
            dispatch({ type : "SET_CARGANDO_ENTIDAD", payload : { entidad : "metodoPago", bandera : false }});
            dispatch({type : "SET_ERROR_ENTIDAD", payload : {entidad : "metodoPago" , mensaje : null }})
        };
    };


    ListaMetodoPago();

} , [] );    

    return { handleCachearMetodoPago, handleTextAreaNotas};

};
