import { useReducer, useEffect } from "react";
import { useEffectServicio } from "../../utils/useEfectServicio";
import  { initialStateListadoCaja , listadoCajaReducer,type ListadoCajaAction } from "../../reducers/listadoCajaReducer";


import { libroDiario } from "./libroDiario";


interface Paginacion {
    pagina : number, limite? : number , contadorPagina : number
}

import  type{ DataEstadoResult, ResultUsuariosEscuela } from "../../servicio/historial.cajas.fetch";


export const coloresSobrios = [
  "var(--color-primario)",    // #6D5DF6 
  "var(--color-secundario)",  // #66A9E8 
  "#38BDF8",                  // Celeste suave secundario
  "#2DD4BF",                  // Teal apagado elegante
  "#34D399",                  // Esmeralda suave
  "#FBBF24",                  // Ámbar sobrio (no chilla)
  "#FB923C",                  // Naranja tostado sutil
  "#F87171",                  // Coral / Rojo atenuado
  "#A78BFA",                  // Púrpura claro complementario
  "var(--texto-secundario)"   // #A7AFBF - Gris texto secundario para el neutro
];

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

type estadoCaja = "exacta" | "con_diferencia" | null

interface HistorialCajasConfig {
        servicios : {
            estadoEncabezado : ServicioCrud,
            historialCajas : ServicioCrud,
            usuariosEscuela : ServicioCrud,
            detalleCajaResumen :ServicioCrud,
        },
};

export const useListaCajaBase = ( config : HistorialCajasConfig ) => {
    
  const [ stateListadoCaja, dispatchListadoCaja] = useReducer( listadoCajaReducer , initialStateListadoCaja());

    //console.log(stateListadoCaja.filtrosBusqueda)


 // ──────────────────────────────────────────────────────────────
//  Configuracion para manejar la info en Resumen detalle caja
// ──────────────────────────────────────────────────────────────    
  const resumenDetalle = libroDiario({
      servicios : {
        detalleCajaResumen : config.servicios.detalleCajaResumen
      },
      stateLibroDiario : stateListadoCaja,
      dispatchLibroDiario : dispatchListadoCaja
  });

// ──────────────────────────────────────────────────────────────
//  Abrir y cerrar el modal del libro diario
// ────────────────────────────────────────────────────────────── 


// ──────────────────────────────────────────────────────────────
//  Funciones para cachear los filtros de busqueda
// ──────────────────────────────────────────────────────────────  
  // ---------------------------- Cachear usuario      ---------------

  const cachearUsuario = (e: React.ChangeEvent<HTMLSelectElement>) =>{ 
      const usuario : number | null = e.target.value  ? Number(e.target.value) : null ;
      dispatchListadoCaja({type : "SET_FILTRO_BUSQUEDA_USUARIO", payload : usuario})
  };
  // ---------------------------- Cachear estado caja  ---------------
  const cachearEstado = (e: React.ChangeEvent<HTMLSelectElement>) =>{ 
      const estado : estadoCaja = e.target.value ? e.target.value as estadoCaja : null ;
      dispatchListadoCaja({ type : "SET_FILTRO_BUSQUEDA_ESTADO" , payload : estado});
  };
  // ---------------------------- Cachear Fecha Desde  ---------------
 const cachearFechaD =  (event: React.ChangeEvent<HTMLInputElement>) =>{
      dispatchListadoCaja({type : "SET_FILTRO_BUSQUEDA_FECHAD", payload : event.target.value});
 };
  // ---------------------------- Cachear Fecha Hasta ---------------
  const cachearFechaH =  (event: React.ChangeEvent<HTMLInputElement>) =>{
      dispatchListadoCaja({type : "SET_FILTRO_BUSQUEDA_FECHAH", payload : event.target.value})
 };

  const handlePaginaCambiada = (pagina: number) => {
       dispatchListadoCaja({type : "ACTUALIAR_PAGINA" , payload : pagina });
  };


// ──────────────────────────────────────────────────────────────
//  Trae el encabezado del historial de caja 
// ──────────────────────────────────────────────────────────────  
   useEffectServicio<void, DataEstadoResult, ListadoCajaAction>({
      valores : undefined,
      servicios : config.servicios.estadoEncabezado,
      dispatch : dispatchListadoCaja,
      accionResultado : (data)=>({type : "SET_ESTADO_CAJA", payload : data || null}),
      accionError : ( mensaje ) =>({type : "SET_ERROR_ESTADO_CAJA", payload : mensaje || ""}),
      accionCarga : ( estado ) =>({ type : "SET_CARGA_ESTADO", payload : estado}),
      useAbort : true,
      dependencias : []
   });

// ──────────────────────────────────────────────────────────────
//  Listado de usuarios de cada escuela 
// ────────────────────────────────────────────────────────────── 
   useEffectServicio<void,ResultUsuariosEscuela[], ListadoCajaAction>({
      valores : undefined,
      servicios : config.servicios.usuariosEscuela,
      dispatch  : dispatchListadoCaja,
      accionResultado : ( data ) =>({ type : "SET_LISTADO_USUARIOS", payload : data || null}),
      accionError : ( mensaje ) =>({ type : "SET_ERROR_USUARIOS", payload : mensaje }),
      accionCarga : ( estado )=> ({ type : "SET_CARGA_USUARIOS", payload : estado}),
      useAbort : false, 
      dependencias : []
   });


// ──────────────────────────────────────────────────────────────
//  Trae el Historial de cajas, Metricas Metodos Pago y Paginacion
// ──────────────────────────────────────────────────────────────  
useEffect(()=>{
    const controlador = new AbortController();
    const signal = controlador.signal;
    
    // 1. Configuración del Timeout: Si la petición tarda más de 10s, se aborta y se notifica al usuario
    const timeoutId = setTimeout(() => {
        controlador.abort();
        dispatchListadoCaja({ 
          type : "SET_ERROR_HISTORIAL_CAJA", 
          payload : "La solicitud ha tardado demasiado tiempo. Por favor, inténtelo de nuevo más tarde."
        });
        dispatchListadoCaja({ type : "SET_CARGA_HISTORIAL", payload: false});
    }, 10000); 

    const historialCaja = async () =>{
        try{ 
          // 2. Activamos el estado de carga antes de iniciar la petición
          dispatchListadoCaja({type : "SET_CARGA_HISTORIAL", payload : true});

          // 3. Unificamos los filtros de búsqueda y la paginación actuales del estado
          const data = {
              ...stateListadoCaja.filtrosBusqueda, ...stateListadoCaja.paginacion             
          };

          // 4. Ejecución del servicio de historial de cajas pasando la señal de aborto
          const historialCajas = config.servicios.historialCajas;
          const resultHistorial = await historialCajas(data, signal);
 
          // 5. Verificamos que la respuesta del servidor sea exitosa
          if( resultHistorial.code === 'HISTORIAL_CAJA_OK') {
            
            // Actualizamos la paginación devuelta por el servidor (o valores por defecto si no viene)
            const paginacion : Paginacion = resultHistorial.paginacion ? resultHistorial.paginacion : { pagina : 1, contadorPagina : 1}
            dispatchListadoCaja({ type : "SET_FILTRO_PAGINACION", payload : paginacion})

            // Validamos y extraemos los métodos de pago
            const metodoPago = resultHistorial.data.dataMetodo !== null ? resultHistorial.data.dataMetodo : null

            // 6. Asignamos de forma cíclica los colores sobrios que definimos previamente a cada método de pago
            const dataConColor = metodoPago.map((item : { id_cuenta : number, metodo : string, total : number, } , index : number) => ({
              ...item,
              color: coloresSobrios[index % coloresSobrios.length]
            }))

             // Empaquetamos todo el resultado procesado
             const cargaProps = { 
                  dataDetalle:  resultHistorial.data.dataDetalle,
                  dataMetodo:   dataConColor,
                  paginacion :  resultHistorial.paginacion
             };

             // 7. Guardamos el historial completo en el estado global
             dispatchListadoCaja({ type : "SET_HISOTRIAL_CAJAS", payload : cargaProps})
          };

        }catch(e: any){
          // 8. Manejo de errores: Ignoramos si fue cancelado intencionalmente por el AbortController
          if (e.name !== 'AbortError') {
             dispatchListadoCaja({type : "SET_ERROR_HISTORIAL_CAJA", payload : "Error en el servidor, historial cajas."});
          }
        }finally{
          // 9. Limpieza final: Apagamos el timeout y desactivamos la bandera de carga
          clearTimeout(timeoutId);
          dispatchListadoCaja({type : "SET_CARGA_HISTORIAL", payload : false});
        };
    };

    // Disparamos la función asíncrona
    historialCaja();

    return () => {
        // 10. Cleanup del Hook: Limpia el timer y aborta fetch pendientes si cambian las dependencias o se desvanece el componente
        clearTimeout(timeoutId);
        controlador.abort(); 
    };        
},[stateListadoCaja.filtrosBusqueda, stateListadoCaja.paginacion.pagina]);


        return {
            resumenDetalle,

            stateListadoCaja, abrirLibroDiario : resumenDetalle.abrirLibroDiario, cerrarLibroDiario : resumenDetalle.cerrarLibroDiario,
            cachearUsuario, cachearEstado, cachearFechaD, cachearFechaH,
            handlePaginaCambiada,
        };
};