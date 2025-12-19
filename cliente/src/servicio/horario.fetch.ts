import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../hooks/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";


import type * as TipadoHorario from "../tipadosTs/horario";


export const calendarioEscuela = async( 
    data : TipadoHorario.Calendario ,
    signal? : AbortSignal
 ) : Promise<ApiResponse<TipadoHorario.ResultCalendarioHorario>>=>{
    const verificarUser= await verificarAutenticacion();
    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }

    const parametrosQuery = {
        estado: data.estado || "activos",
        id_escuela: data.id_escuela.toString(),
    };

    const ruta  = `${PAGINA}api/lista_horario?${new URLSearchParams(parametrosQuery as Record<string, string>).toString()}`;      
    return await apiFetch( ruta , {
        method : "GET",
        signal : signal
    });

};