import { TipadoData } from "../tipados/tipado.data";
import { PostEscuelasInputs, EstadoEscuelasInputs, ListadoEscuelasInputs } from "../squemas/escuelas";

import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidad } from "../hooks/funcionListar";

export interface EscuelaResumen {
    id?: number;
    razon_social: string;
    nombre_propietario: string ;
    apellido_propietario: string ;
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

/**
 * Verifica si ya existe un registro de escuela para el DNI del propietario.
 *
 * @async
 * @function verificarRazonSocialEscuela
 * @param {Pick<PostEscuelasInputs, "dni_propietario">} datos - Datos del propietario para validar duplicados.
 * @returns {Promise<TipadoData<EscuelaResumen>>} Resultado de la validación según `buscarExistenteEntidad`.
 */
const verificarRazonSocialEscuela = async (
    datos: Pick<PostEscuelasInputs, "dni_propietario">
): Promise<TipadoData<EscuelaResumen>> => {
    const { dni_propietario } = datos;

    const sql: string = `SELECT id_escuela, razon_social
                            FROM escuelas
                            WHERE razon_social = ?;`;

    const valores: unknown[] = [ dni_propietario];

    return await buscarExistenteEntidad<EscuelaResumen>({
        slqEntidad: sql,
        valores,
        entidad: "ESCUELA"
    });
};

/**
 * Localiza la clave pública de la imagen asociada a una escuela.
 *
 * @async
 * @function localizarPublicIdEscuela
 * @param {number} id_escuela - ID de la escuela a consultar.
 * @returns {Promise<TipadoData<EscuelaPublicId>>} Resultado con el `public_id` y la URL actual de la imagen.
 */
const localizarPublicIdEscuela = async (
    id_escuela: number
): Promise<TipadoData<EscuelaPublicId>> => {
    const sql: string = `SELECT id_escuela, public_id, urlImagen
                        FROM escuelas
                        WHERE id_escuela = ?;`;

    const valores: unknown[] = [id_escuela];

    return await buscarExistenteEntidad<EscuelaPublicId>({
        slqEntidad: sql,
        valores,
        entidad: "ESCUELA_PUBLIC_ID",
    });
};

/**
 * Inserta una nueva escuela en la base de datos.
 *
 * @async
 * @function altaEscuela
 * @param {PostEscuelasInputs} datos - Datos validados de la escuela a registrar.
 * @returns {Promise<TipadoData<EscuelaResumen>>} Resultado de la operación de escritura.
 */
/**
 * Inserta una nueva escuela en la base de datos.
 *
 * @async
 * @function altaEscuela
 * @param {PostEscuelasInputs} datos - Datos validados de la escuela a registrar.
 * @returns {Promise<TipadoData<EscuelaResumen>>} Resultado de la operación de escritura.
 */
const altaEscuela =async (  datos : PostEscuelasInputs)
:Promise<TipadoData<EscuelaResumen>> =>{

    const {
        dni_propietario, nombre_propietario, apellido_propietario, 
        razon_social, direccion, celular, urlImagen,
        fecha_registro, baja, public_id
    } = datos;

    const sql : string = `INSERT INTO escuelas (
                    dni_propietario, 
                    nombre_propietario, 
                    apellido_propietario, 
                    razon_social, 
                    direccion, 
                    celular, 
                    urlImagen, 
                    public_id, 
                    fecha_registro, 
                    baja
                ) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

    const valores : unknown[] = [
        dni_propietario, nombre_propietario, apellido_propietario, 
        razon_social, direccion, celular, urlImagen, public_id,
        fecha_registro, baja
    ];

    const retorno = { razon_social, nombre_propietario, apellido_propietario  }

    return await iudEntidad<EscuelaResumen>({
        slqEntidad : sql,
        valores : valores,
        entidad : "escuela",
        datosRetorno : retorno,
        metodo : "CREAR"
    });

};

/**
 * Modifica una escuela existente en la base de datos por su ID.
 *
 * @async
 * @function modificarEscuela
 * @param {ModificarEscuelaInputs} datos - Datos nuevos de la escuela y el `id_escuela` a actualizar.
 * @returns {Promise<TipadoData<EscuelaResumen>>} Resultado de la actualización.
 */
const modificarEscuela = async (
    datos: ModificarEscuelaInputs
): Promise<TipadoData<EscuelaResumen>> => {


    const {
        id_escuela,
        dni_propietario,
        nombre_propietario,
        apellido_propietario,
        razon_social,
        direccion,
        celular,
        urlImagen,
        baja,
        public_id,
        imagenMod,
    } = datos;

      

    let sql: string;
    let valores: unknown[];    

    if ( imagenMod && urlImagen ){

             sql = `UPDATE escuelas
                            SET dni_propietario = ?,
                                nombre_propietario = ?,
                                apellido_propietario = ?,
                                razon_social = ?,
                                direccion = ?,
                                celular = ?,
                                urlImagen = ?,
                                public_id = ?,
                                baja = ?
                            WHERE id_escuela = ?;`;

             valores = [
                    dni_propietario,
                    nombre_propietario,
                    apellido_propietario,
                    razon_social,
                    direccion,
                    celular,
                    urlImagen,
                    public_id,
    
                    baja,
                    id_escuela,
            ];
    }else {
        // Si NO se modificó la imagen, EXCLUIMOS urlImagen y public_id del UPDATE para que no se borren
        sql = `UPDATE escuelas
               SET dni_propietario = ?,
                   nombre_propietario = ?,
                   apellido_propietario = ?,
                   razon_social = ?,
                   direccion = ?,
                   celular = ?,
                   baja = ?
               WHERE id_escuela = ?;`;

        valores = [
            dni_propietario,
            nombre_propietario,
            apellido_propietario,
            razon_social,
            direccion,
            celular,
            baja,
            id_escuela,
        ];
    }

    const retorno = {
        razon_social: razon_social ?? "",
        nombre_propietario: nombre_propietario ?? "",
        apellido_propietario: apellido_propietario ?? "",
    };

    return await iudEntidad<EscuelaResumen>({
        slqEntidad: sql,
        valores,
        entidad: "escuela",
        datosRetorno: retorno,
        metodo: "MODIFICAR",
    });
};

export interface RetornoEstado {
    estado : string,
    id_escuela : number
};

const estadoEscuela = async ( estadoProps : EstadoEscuelasInputs )
:Promise<TipadoData<RetornoEstado>> =>{
        const { id_escuela, estado } = estadoProps;

        const sql = `UPDATE escuelas
                    SET baja = ?
                    WHERE id_escuela = ?;`;

        const valores = [ estado, id_escuela];

        const retorno = { id_escuela, estado }

        return await iudEntidad<RetornoEstado>({
            slqEntidad: sql,
            valores,
            entidad: "escuela",
            datosRetorno: retorno , // Ajustá según lo que devuelvas
            metodo: "MODIFICAR",
        });
};


export interface EscuelaListadoRow {
    id_escuela: number;
    dni_propietario: number | null;
    nombre_propietario: string | null;
    apellido_propietario: string | null;
    razon_social: string | null;
    direccion: string | null;
    celular: string | null;
    urlImagen: string | null;
    public_id: string | null;
    fecha_registro: string | null; // o Date dependiendo de cómo te lo devuelva el driver de MySQL
    baja: string;
    total_registros: number;
}


const listadoEscuelas = async (data: ListadoEscuelasInputs,  pagina : string)
: Promise<TipadoData<EscuelaListadoRow[]>>=> {

    const { limit, apellido, razon_social, estado, dni, offset} = data;

    const apellidoLike = `%${apellido || ""}%`;
    const dniLike = `%${dni || ""}%`;
    const razonSocialLike = `%${razon_social || ""}%`;

    const sql = `SELECT 
                            id_escuela,
                            dni_propietario,
                            nombre_propietario,
                            apellido_propietario,
                            razon_social,
                            direccion,
                            celular,
                            urlImagen,
                            public_id,
                            fecha_registro,
                            baja,   
                            COUNT(*) OVER() AS total_registros
                        FROM escuelas
                        WHERE baja = ?
                        AND apellido_propietario LIKE ?
                        AND CAST(dni_propietario AS CHAR) LIKE ?  
                        AND razon_social LIKE ?
                        ORDER BY id_escuela DESC
                LIMIT ${limit} OFFSET ${offset};`;

    // Pasamos el estado dos veces (para la condición 'todos') y luego los tres comodines
    const valores = [ estado, apellidoLike, dniLike, razonSocialLike]; 
    
    return await listarEntidad<EscuelaListadoRow>({
        slqListado: sql,
        valores: valores,
        entidad: "LISTADO_ESCUELA",
        estado: estado,
        limit: limit,
        pagina: String(pagina)
    });
};

export const method = {
    altaEscuela : tryCatchDatos( altaEscuela),
    verificarRazonSocialEscuela : tryCatchDatos( verificarRazonSocialEscuela),
    localizarPublicIdEscuela : tryCatchDatos( localizarPublicIdEscuela),
    modificarEscuela : tryCatchDatos( modificarEscuela),
    estadoEscuela : tryCatchDatos( estadoEscuela ),
    listadoEscuelas: tryCatchDatos( listadoEscuelas )
};

