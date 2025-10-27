// utills
import { ClientError } from "../utils/error";

//Hooks 
import { iud } from "../utils/baseDatos" ;
//Type
import { CodigoEstadoHTTP } from "../tipados/generico";
import { TipadoData } from "../tipados/tipado.data";
import { PlanServioCode } from "../tipados/planes.usuarios"; 

// Definición local del tipo de resultado de la función iud (metadata de la BD)
interface IudResultMetadata {
    affectedRows: number;
    insertId: number;
  
}


type Accion = "CREAR" | "MODIFICAR" | "ELIMINAR" | "ALTA"; 

interface ParametrosEntidad<TDatosRetorno> {
    slqEntidad: string,
    valores: unknown[],
    entidad: string,
    metodo: Accion,
    datosRetorno: TDatosRetorno;
}

// Ahora la función es genérica en el retorno
export const iudEntidad = async <TDatosRetorno extends object>(
    parametros: ParametrosEntidad<TDatosRetorno>
): Promise<TipadoData<TDatosRetorno & { id?: number }>> => { // Añadimos 'id' genérico al tipo de retorno (insertId)

    const { slqEntidad, valores, entidad, metodo, datosRetorno } = parametros;
    const entidadM = entidad.toUpperCase();


    const entidadIud = await iud(slqEntidad, valores) as IudResultMetadata; 
    

    if (entidadIud.affectedRows <= 0) {
    // Construcción del código de error basado en la acción
        const code = metodo === "MODIFICAR" || metodo === "ELIMINAR" ? 
            `${metodo}_NOT_FOUND` : PlanServioCode.CREATION_FAILED;

     // Determinación del texto de la acción para el mensaje 
        const accionTexto = metodo === "CREAR" ? 'crear' : (metodo === "MODIFICAR" ? 'modificar' : 'eliminar');
    // Lanzamiento del error con mensaje detallado
        throw new ClientError(`No se logró ${accionTexto} la entidad ${entidadM}. Filas afectadas: 0`,
                                CodigoEstadoHTTP.NO_ENCONTRADO, 
                                code);
    }

    // creación de datos finales a devolver con su tipado 
    let datosFinales: TDatosRetorno & { id?: number };
    
    // entra si el metodo = "CREAR"
    //'insertId' in entidadIud :  Verifica si 'insertId' existe en el objeto entidadIud
    //entidadIud.insertId :  Verifica que insertId no sea 0 o undefined
    if (metodo === "CREAR" && 'insertId' in entidadIud && entidadIud.insertId) {
        datosFinales = { 
            ...datosRetorno, 
            id: entidadIud.insertId 
        } as TDatosRetorno & { id: number };// le digo  q va a devolver DatosRetorno con id que es number

    } else {
    // datosFinales toma el valor de datosRetorno sin modificaciones y  su existe el id tambien lo toma
        datosFinales = datosRetorno as TDatosRetorno & { id?: number };
    }
    // Construcción del mensaje y código de respuesta
    const message = `${entidadM} ${metodo === "CREAR" 
                    ? 'creada' 
                    : (metodo === "MODIFICAR" ? 'modificada' 
                    : 'eliminada')} exitosamente.`;
    const code = `${entidadM}_${metodo}`;

    return {
        error: false,
        message: message,
        data: datosFinales,
        code: code,
        errorsDetails: undefined
    };
}