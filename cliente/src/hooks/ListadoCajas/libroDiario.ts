import { coloresSobrios } from "./ListadoCajasBase"; 

import { type ListadoCajas , type ListadoCajaAction} from "../../reducers/listadoCajaReducer";

type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;

interface LibroDiarioCongif {

        servicios : {
            detalleCajaResumen : ServicioCrud
        },
        stateLibroDiario : ListadoCajas,
        dispatchLibroDiario :  React.Dispatch<ListadoCajaAction>;
};

export const libroDiario = ( config : LibroDiarioCongif) => {

    const {  stateLibroDiario, dispatchLibroDiario } = config;

    console.log( stateLibroDiario.detalleCaja?.dataMetodo )

    const abrirLibroDiario =async (idCaja: number) =>{
     console.log(idCaja)
      dispatchLibroDiario({ type : "SET_MODAL_LIBRO_DIARIO" , payload : true });

      const detalle = config.servicios.detalleCajaResumen;
      
      const resultDetalle = await detalle({ id_caja : idCaja });
      console.log(resultDetalle)
      
      const metodoPago = resultDetalle.code === 'LISTADO_DETALLE_CAJA_OK' ? resultDetalle.data.dataMetodo : null ;

      const metodoPagoSet = metodoPago.map( ( item :{id_cuenta : number, metodo : string, total : number} , index : number ) =>({
        ...item,
        color : coloresSobrios[index % coloresSobrios.length]
      }));

      const result = resultDetalle.code === 'LISTADO_DETALLE_CAJA_OK' 
                     ? { 
                          dataDetalle: resultDetalle.data.dataDetalle,
                          dataMetodo : metodoPagoSet
                     } : null; 
                     

      dispatchLibroDiario({ 
            type : "SET_DETALLE_CAJA", 
            payload : result 
            ? result
            : null  
      }); 

    };

    const cerrarLibroDiario = () =>{
      dispatchLibroDiario({ type : "SET_MODAL_LIBRO_DIARIO" , payload : false });
      // y aca lo borramos
      dispatchLibroDiario({ type : "SET_DETALLE_CAJA", payload : null });
    };


 return{
    abrirLibroDiario, cerrarLibroDiario,
 }   
};