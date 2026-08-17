import { useReducer, useEffect, use } from "react";
import { useEffectServicio } from "../../utils/useEfectServicio";
import  { initialStateListadoCaja , listadoCajaReducer,type ListadoCajaAction } from "../../reducers/listadoCajaReducer";





const coloresSobrios = [
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
            historialCajas : ServicioCrud
        },
}

export const useListaCajaBase = ( config : HistorialCajasConfig ) => {
    
    const [ stateListadoCaja, dispatchListadoCaja] = useReducer( listadoCajaReducer , initialStateListadoCaja());

    console.log(stateListadoCaja.filtrosBusqueda)



    const abrirLibroDiario = () =>{
      dispatchListadoCaja({ type : "SET_MODAL_LIBRO_DIARIO" , payload : true });
    };

    const cerrarLibroDiario = () =>{
      dispatchListadoCaja({ type : "SET_MODAL_LIBRO_DIARIO" , payload : false });
    };
// ──────────────────────────────────────────────────────────────
//  Funciones para cachear los filtros de busqueda
// ──────────────────────────────────────────────────────────────  
  // ---------------------------- Cachear usuario      ---------------

  const cachearUsuario = (e: React.ChangeEvent<HTMLSelectElement>) =>{ 
      const usuario : number | null = e.target.value  ? Number(e.target.value) : null ;
      dispatchListadoCaja({type : "SET_FILTRO_BUSQUEDA_USUARIO", payload : usuario})
  }
  // ---------------------------- Cachear estado caja  ---------------
  const cachearEstado = (e: React.ChangeEvent<HTMLSelectElement>) =>{ 
      const estado : estadoCaja = e.target.value ? e.target.value as estadoCaja : null ;
      dispatchListadoCaja({ type : "SET_FILTRO_BUSQUEDA_ESTADO" , payload : estado});
  }
  // ---------------------------- Cachear Fecha Desde  ---------------
 const cachearFechaD =  (event: React.ChangeEvent<HTMLInputElement>) =>{
      dispatchListadoCaja({type : "SET_FILTRO_BUSQUEDA_FECHAD", payload : event.target.value});
 };
  // ---------------------------- Cachear Fecha Hasta ---------------
  const cachearFechaH =  (event: React.ChangeEvent<HTMLInputElement>) =>{
      dispatchListadoCaja({type : "SET_FILTRO_BUSQUEDA_FECHAH", payload : event.target.value})
 };



// ──────────────────────────────────────────────────────────────
//  Trae el encabezado del historial de caja 
// ──────────────────────────────────────────────────────────────  
   useEffectServicio<any,any, ListadoCajaAction>({
      valores : {},
      servicios : config.servicios.estadoEncabezado,
      dispatch : dispatchListadoCaja,
      accionResultado : (data)=>({type : "SET_ESTADO_CAJA", payload : data || null}),
      accionError : ( mensaje ) =>({type : "SET_ERROR_ESTADO_CAJA", payload : mensaje || ""}),
      accionCarga : ( estado ) =>({ type : "SET_CARGA_ESTADO", payload : estado}),
      useAbort : true,
      dependencias : []
   });

   const data = {
      idUsuarioFiltro : null, fechaDesde: "2026-02-11", fechaHasta : "2026-08-11", pagina : 1 , estadoDiferencia : null
   };

// ──────────────────────────────────────────────────────────────
//  Trae el Historial de cajas, Metricas Metodos Pago y Paginacion
// ──────────────────────────────────────────────────────────────  
useEffect(()=>{
        const controlador = new AbortController();
        const signal = controlador.signal;

        // 1. Timeout razonable (ej: 10 segundos = 10000 ms)
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
          dispatchListadoCaja({type : "SET_CARGA_HISTORIAL", payload : true});

          const historialCasjas = config.servicios.historialCajas;
          const resultHistorial = await historialCasjas(data, signal);

          if( resultHistorial.code === 'HISTORIAL_CAJA_OK') {

            const metodoPago = resultHistorial.data.dataMetodo !== null ? resultHistorial.data.dataMetodo : null

            const dataConColor = metodoPago.map((item : { id_cuenta : number,metodo : string, total : number, } , index : number) => ({
              ...item,
              color: coloresSobrios[index % coloresSobrios.length]
            }))


             const cargaProps = { 
                  dataDetalle:  resultHistorial.data.dataDetalle,
                  dataMetodo:   dataConColor,
                  paginacion :  resultHistorial.paginacion
             };
             dispatchListadoCaja({ type : "SET_HISOTRIAL_CAJAS", payload : cargaProps})
          };

        }catch(e: any){
          // Si el error fue provocado por el AbortController, no pisamos el mensaje de timeout
          if (e.name !== 'AbortError') {
            dispatchListadoCaja({type : "SET_ERROR_HISTORIAL_CAJA", payload : "Error en el servidor, historial cajas."});
          }
        }finally{
          // 2. Importante: Limpiamos el timeout apenas termina la petición (sea éxito o error)
          clearTimeout(timeoutId);
          dispatchListadoCaja({type : "SET_CARGA_HISTORIAL", payload : false});
        };
       };

       historialCaja();

    return () => {
        // Cleanup en orden correcto: primero limpiamos el timer y después abortamos
        clearTimeout(timeoutId);
        controlador.abort(); 
    };       
   },[]);


  
    
        return {
            stateListadoCaja, abrirLibroDiario, cerrarLibroDiario,
            cachearUsuario, cachearEstado, cachearFechaD, cachearFechaH,
        };
};