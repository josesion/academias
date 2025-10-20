//Hooks 
import { select } from "../utils/baseDatos";
//Type
import  { TipadoData } from "../tipados/tipado.data";


interface BuscarExistenteParametros {
    slqEntidad: string,
    valores: unknown[],
    entidad: string,
};


export const buscarExistenteEntidad = async <TRespuesta>  ( 
    parametros : BuscarExistenteParametros 
) : Promise<TipadoData<TRespuesta>> =>{
        
    const { slqEntidad, valores, entidad  } = parametros;
    // Normalizamos la entidad a mayúsculas para los códigos de respuesta
    const entidadM = entidad.toUpperCase();

    // Ejecución de la consulta SELECT.
    const busqueda = await select<TRespuesta | [] >(slqEntidad, valores);

    // --- LÓGICA DE VALIDACIÓN ---

    // Caso 1: ENTIDAD ENCONTRADA (Fallo en la Validación)
    if ( busqueda.length > 0) {
        return {
            // Indicamos error: true para que el flujo de control se detenga.
            error : true,
            message : `${entidadM} ya existe en la base de datos.`,
            // Devolvemos el registro existente (primer elemento) en 'data'.
            data : busqueda[0], 
            code : `${entidadM}_EXISTE`,
            errorsDetails : undefined
        }
    }

    // Caso 2: ENTIDAD NO ENCONTRADA (Validación Exitosa)
    return {
        // Indicamos error: false para que el flujo de control continúe (generalmente a un INSERT).
        error : false,
        message : `Validación exitosa: La entidad ${entidadM} no existe.`, 
        // Devolvemos los datosRetorno limpios para pasarlos a la siguiente operación.
        data : [] ,
        code : `${entidadM}_NO_EXISTE`,
        errorsDetails : undefined
    }
    
}