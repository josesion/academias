// utills
import { ClientError } from "../utils/error";
// hook 
import { select } from "../utils/baseDatos";
// Typado
import { CodigoEstadoHTTP } from "../tipados/generico";
import { TipadoData } from "../tipados/tipado.data";


interface PaginacionBase {
    limit   : number,
    pagina  :string
}

interface PaginacionDBRow {
    total_registros: number; // Usamos un nombre de columna estandarizado
}

interface ParametrosListaGenerica extends PaginacionBase {
    slqListado  : string,
    valores     :unknown[],// por q podria recibir cual tipo de dato
    entidad     : string,
    estado?      : string
}



export const listarEntidad = async <TRespuesta>(
    parametros: ParametrosListaGenerica 
) : Promise<TipadoData<TRespuesta[]>>=> {

    const { estado ,entidad, valores ,slqListado, limit, pagina } = parametros;
    const entidadM = entidad.toUpperCase();
    
    type RowConTotal = TRespuesta & PaginacionDBRow;

    const listado = await select<RowConTotal>(slqListado , valores);

    if ( listado.length <= 0) {
        throw new ClientError(`No hay ${entidadM} ${estado}` ,
                               CodigoEstadoHTTP.SIN_CONTENIDO,  
                              `NO_ACTIVE_${entidadM}`);
    }
 
    const totalRegistro  =listado[0].total_registros;
    const totalPagina = Math.ceil( totalRegistro / limit);
    // extraigo el total de registros para la renderizacion 

    const dataEntidad = listado.map( entidad => {
        const { total_registros, ...alumnoData } = entidad as any; 
        return alumnoData;
    });


      return {
        error: false,
        message: ` ${entidadM} listados ${estado}`,
        data: dataEntidad,
        paginacion: {
            pagina: Number(pagina),
            limite: Number(limit),
            contadorPagina: totalPagina
        },
        code:  `${entidadM}_LISTED`,
        errorsDetails: undefined
    };

}