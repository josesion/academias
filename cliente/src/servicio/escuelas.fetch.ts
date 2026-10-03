import { PAGINA } from "./variables.globales";
import { apiFetch ,type ApiResponse  } from "../utils/apiFetch";
import { verificarAutenticacion } from "../hooks/verificacionUsuario";

export interface EscuelaResumen {
    id?: number;
    razon_social: string;
    nombre_propietario: string ;
    apellido_propietario: string ;
}

export interface PostEscuelasInputs{
    dni_propietario: number;
    nombre_propietario: string;
    apellido_propietario: string;
    razon_social: string;
    direccion: string;
    celular: string;
    urlImagen?: string | "";
    fecha_registro?: string;
    baja?: string;
    public_id?: string;
}

export interface ModificarEscuelaInputs extends Partial<PostEscuelasInputs> {
    id_escuela: number;
    imagenMod : boolean;
}

export interface EscuelaPublicId {
    id_escuela: number;
    public_id?: string;
    urlImagen?: string;
}

export interface PostEscuelasPayload extends PostEscuelasInputs {
    imagen: File | null; 
}

export const postEscuelas = async( parametro : PostEscuelasPayload ) 
    :Promise<ApiResponse<EscuelaResumen>> =>{

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
    // 1. Creamos la instancia de FormData para soportar texto + archivos binarios
    const formData = new FormData();
    formData.append("dni_propietario", String(parametro.dni_propietario));
    formData.append("nombre_propietario", parametro.nombre_propietario);
    formData.append("apellido_propietario", parametro.apellido_propietario);
    formData.append("razon_social", parametro.razon_social);
    formData.append("direccion", parametro.direccion);
    formData.append("celular", String(parametro.celular));

    // 2. Adjuntamos la imagen solo si existe físicamente
    if (parametro.imagen) {
        formData.append("imagen", parametro.imagen);
    }

    const ruta  = `${PAGINA}api/post_escuelas`;
    return await apiFetch( ruta , {
        method : "POST",
        body : formData 
    });
}


export type EstadoEscuela = "activos" | "inactivos";

export interface ListadoEscuelasParams  {
  apellido: string;
  dni: string;
  razon_social: string;
  baja?: "activos" | "vencidos" | "inactivos"
  pagina: number | string;
  limit: number;
  offset?: number;
};

export interface EscuelaListadoRow {
    id_escuela: number;
    dni_propietario: number | string ;
    nombre_propietario: string ;
    apellido_propietario: string ;
    razon_social: string ;
    direccion: string ;
    celular: string ;
    urlImagen: string ;
    public_id: string ;
    fecha_registro: string; // o Date dependiendo de cómo te lo devuelva el driver de MySQL
    baja:EstadoEscuela;
    total_registros?: number;
}

export const getEscuelas = async (
    parametro: ListadoEscuelasParams,
    signal?: AbortSignal
): Promise<ApiResponse<EscuelaListadoRow[]>> => {

    const verificarUser = await verificarAutenticacion();

    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }

    const params = new URLSearchParams();

    if (parametro.apellido) {
        params.append("apellido", parametro.apellido);
    }

    if (parametro.dni) {
        params.append("dni", parametro.dni);
    }

    if (parametro.razon_social) {
        params.append("razon_social", parametro.razon_social);
    }

    params.append("estado", parametro.baja || "activos");
    params.append("pagina", parametro.pagina.toString());
    params.append("limit", parametro.limit.toString());

    if (parametro.offset !== undefined) {
        params.append("offset", parametro.offset.toString());
    }

    const ruta = `${PAGINA}api/lista_escuelas?${params.toString()}`;

    return await apiFetch(ruta, {
        method: "GET",
        signal: signal
    });
};


export interface PutEscuelasInputs extends PostEscuelasInputs {
    imagenMod : boolean,
    imagen: File | null; 
    id_escuela : number | null
};

export const putEscuelas = async (datos: PutEscuelasInputs)
: Promise<ApiResponse<EscuelaResumen>> => {

    const verificarUser = await verificarAutenticacion();

    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    }

    const formData = new FormData();

    formData.append("id_escuela", String(datos.id_escuela));
    formData.append("dni_propietario", String(datos.dni_propietario));
    formData.append("nombre_propietario", datos.nombre_propietario);
    formData.append("apellido_propietario", datos.apellido_propietario);
    formData.append("razon_social", datos.razon_social);
    formData.append("direccion", datos.direccion);
    formData.append("celular", String(datos.celular));

    if (datos.urlImagen) {
        formData.append("urlImagen", datos.urlImagen);
    }

    if (datos.fecha_registro) {
        formData.append("fecha_registro", datos.fecha_registro);
    }

    if (datos.baja) {
        formData.append("baja", datos.baja);
    }

    if (datos.public_id) {
        formData.append("public_id", datos.public_id);
    }
    if (datos.imagen) {
        formData.append("imagen",datos.imagen);
    }

    formData.append("imagenMod", String(datos.imagenMod));

   

    const ruta = `${PAGINA}api/mod_escuelas`;

    return await apiFetch(ruta, {
        method: "PUT",
        body: formData
    });
};  

export interface EstadoEscuelasInputs {
     estado  : string,
     id_escuela : number
}


export const estadoEscuelas  = async ( datos : EstadoEscuelasInputs )
:Promise<ApiResponse<EscuelaResumen>> =>{
    const verificarUser = await verificarAutenticacion();

    if (verificarUser.autenticado === false) {
        return {
            error: true,
            message: "Usuario no autenticado",
            statusCode: 401,
            code: "NOT_AUTHENTICATED",
            errorsDetails: undefined
        };
    };

    const {estado, id_escuela} =  datos;
   
    const ruta = `${PAGINA}api/estado_escuela/${estado}/${id_escuela}`;
    console.log(ruta)

    return await apiFetch(ruta, {
        method: "PUT",
    });
};