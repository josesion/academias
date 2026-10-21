import { coloresSobrios } from "./ListadoCajasBase";

import { type ListadoCajas , type ListadoCajaAction} from "../../reducers/listadoCajaReducer";
import type { CajasResumenResponse, DataResumen } from "../../servicio/historial.cajas.fetch";
import type { ApiSuccessResponse } from "../../utils/apiFetch";

type ServicioCrud = (data: DataResumen, signal?: AbortSignal) => Promise<ApiSuccessResponse<CajasResumenResponse>>;

interface LibroDiarioCongif {

        servicios : {
            detalleCajaResumen : ServicioCrud
        },
        stateLibroDiario : ListadoCajas,
        dispatchLibroDiario :  React.Dispatch<ListadoCajaAction>;
};

export const libroDiario = ( config : LibroDiarioCongif) => {

    const { dispatchLibroDiario } = config;

    /**
     * Pide el libro diario de la caja y guarda el resultado en el estado.
     *
     * Además de los movimientos (`dataDetalle`) y el gráfico por método de pago
     * (`dataMetodo`), guarda el **arqueo** (`dataArqueo`): el desglose por cuenta
     * con el conteo real del cajero contra lo que decía el sistema (spec 042).
     * Si el server no lo manda (caja inexistente), queda en `null` y la sección
     * no se muestra.
     */
    const abrirLibroDiario =async (idCaja: number) =>{
  
      dispatchLibroDiario({ type : "SET_MODAL_LIBRO_DIARIO" , payload : true });
      dispatchLibroDiario({ type : "SET_CARGA_DETALLE", payload : true });

      const detalle = config.servicios.detalleCajaResumen;
      
      try {
        const resultDetalle = await detalle({ id_caja : idCaja });
    
        const metodoPago = resultDetalle.code === 'LISTADO_DETALLE_CAJA_OK' ? resultDetalle.data.dataMetodo : null ;

        const metodoPagoSet = metodoPago?.map( ( item :{id_cuenta : number, metodo : string, total : number} , index : number ) =>({
          ...item,
          color : coloresSobrios[index % coloresSobrios.length]
        })) ?? [];

        const result = resultDetalle.code === 'LISTADO_DETALLE_CAJA_OK' 
                       ? { 
                            dataDetalle: resultDetalle.data.dataDetalle,
                            dataMetodo : metodoPagoSet,
                            dataArqueo : resultDetalle.data.dataArqueo ?? null
                       } : null;
                       
        dispatchLibroDiario({ 
              type : "SET_DETALLE_CAJA", 
              payload : result 
              ? result
              : null  
        }); 
      } finally {
        dispatchLibroDiario({ type : "SET_CARGA_DETALLE", payload : false });
      }

    };

    const cerrarLibroDiario = () =>{
      dispatchLibroDiario({ type : "SET_MODAL_LIBRO_DIARIO" , payload : false });
      // y aca lo borramos
      dispatchLibroDiario({ type : "SET_DETALLE_CAJA", payload : null });
      dispatchLibroDiario({ type : "SET_CARGA_DETALLE", payload : false });
    };


 return{
    abrirLibroDiario, cerrarLibroDiario,
 }   
};