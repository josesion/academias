import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { listarEntidad } from "../hooks/funcionListar";

import { TipadoData } from "../tipados/tipado.data";
import { InputEmpresaAlta, InputEmpresaMod, ListadoPorFiltro } from "../squemas/empresa";

/** Fila de `empresas` tal como la devuelve la BD. */
export interface FilaEmpresa {
    id_empresa: number;
    razon_social: string;
    domicilio: string;
    whatsapp: string | null;
    instagram: string | null;
    facebook: string | null;
    logo_url: string | null;
    public_id: string | null;
    estado: string;
    fecha_creacion: string | Date;
}

/**
 * Lo que devuelve el alta: los datos con los que se creo. El `id_empresa` NO va
 * en `datosRetorno`: lo agrega el hook `iudEntidad` con el `insertId` y llega
 * como `id`.
 */
export interface DataEmpresaAltaResult {
    razon_social: string;
    domicilio: string;
    whatsapp: string | null;
    instagram: string | null;
    facebook: string | null;
    logo_url: string | null;
}

/** Lo que devuelve la modificacion: solo lo que cambio. */
export interface DataEmpresaModResult {
    id_empresa: number;
    razon_social?: string;
    domicilio?: string;
    whatsapp?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    logo_url?: string | null;
    estado?: string;
}

/** Lo que devuelve la baja logica. */
export interface DataEmpresaBajaResult {
    id_empresa: number;
    estado: string;
}

/**
 * Normaliza una red social para la BD: si no llega o llega vacia se guarda en
 * `NULL` y no como cadena vacia (las tres columnas son nullable).
 */
const normalizarRed = (valor?: string): string | null => {
    if (valor === undefined || valor === null) return null;
    const limpio = valor.trim();
    return limpio.length > 0 ? limpio : null;
};

/**
 * Inserta una empresa nueva.
 *
 * - `estado` y `fecha_creacion` los pone la BD: no viajan desde el Servicio.
 * - Las tres redes se normalizan a `NULL` cuando llegan vacias.
 *
 * @param data - Datos ya validados por Zod en el Servicio + el logo ya subido
 *   a R2 (`logo_url` y `public_id`).
 * @returns {Promise<TipadoData<DataEmpresaAltaResult & { id?: number }>>} La fila
 *   creada (el hook agrega `id` con el `insertId`), o el error del hook.
 */
const altaEmpresa = async (
    data: InputEmpresaAlta & { logo_url: string | null; public_id: string | null }
): Promise<TipadoData<DataEmpresaAltaResult & { id?: number }>> => {

    const { razon_social, domicilio, logo_url, public_id } = data;

    const whatsapp = normalizarRed(data.whatsapp);
    const instagram = normalizarRed(data.instagram);
    const facebook = normalizarRed(data.facebook);

    const sql: string = `INSERT INTO empresas (
                                razon_social,
                                domicilio,
                                whatsapp,
                                instagram,
                                facebook,
                                logo_url,
                                public_id
                            )
                            VALUES (?, ?, ?, ?, ?, ?, ?);`;

    const valores: unknown[] = [
        razon_social,
        domicilio,
        whatsapp,
        instagram,
        facebook,
        logo_url,
        public_id,
    ];

    return await iudEntidad<DataEmpresaAltaResult>({
        slqEntidad: sql,
        valores,
        entidad: "EMPRESA",
        metodo: "CREAR",
        datosRetorno: {
            razon_social,
            domicilio,
            whatsapp,
            instagram,
            facebook,
            logo_url,
        },
    });
};

/**
 * Modifica una empresa.
 *
 * El `SET` se arma **dinamicamente**: solo entran las columnas que llegaron.
 * Lo arma el Servicio, que ya sabe que campos trae (el `.refine()` del esquema
 * garantiza al menos uno). El `WHERE` es unicamente por `id_empresa`.
 *
 * @param data - Datos ya validados por Zod, con el `SET` armado en `setSql` y
 *   sus valores ya en orden.
 * @returns {Promise<TipadoData<DataEmpresaModResult>>} Lo aplicado, o el error del hook.
 */
const modificarEmpresa = async (
    data: InputEmpresaMod & { setSql: string; setValores: unknown[]; logo_url?: string | null }
): Promise<TipadoData<DataEmpresaModResult>> => {

    const { id_empresa, setSql, setValores } = data;

    const sql: string = `UPDATE empresas
                         SET ${setSql}
                         WHERE id_empresa = ?;`;

    const valores: unknown[] = [...setValores, id_empresa];

    const datosRetorno: DataEmpresaModResult = { id_empresa };

    if (data.razon_social !== undefined) datosRetorno.razon_social = data.razon_social;
    if (data.domicilio !== undefined)    datosRetorno.domicilio = data.domicilio;
    if (data.whatsapp !== undefined)     datosRetorno.whatsapp = normalizarRed(data.whatsapp);
    if (data.instagram !== undefined)    datosRetorno.instagram = normalizarRed(data.instagram);
    if (data.facebook !== undefined)     datosRetorno.facebook = normalizarRed(data.facebook);
    if (data.estado !== undefined)       datosRetorno.estado = data.estado;
    if (data.logo_url !== undefined)     datosRetorno.logo_url = data.logo_url;

    return await iudEntidad<DataEmpresaModResult>({
        slqEntidad: sql,
        valores,
        entidad: "EMPRESA",
        metodo: "MODIFICAR",
        datosRetorno,
    });
};

/**
 * Baja LOGICA de una empresa: la fila NO se borra, solo cambia `estado` a
 * 'inactivos'. La reactivacion es un `modificarEmpresa` con `estado: 'activos'`.
 *
 * El `WHERE` filtra por `id_empresa` y por `estado = 'activos'` para que dar de
 * baja dos veces la misma empresa devuelva 404 en la segunda (y no un 200 con
 * 0 cambios reales).
 *
 * @param id_empresa - Identificador de la empresa a dar de baja.
 * @returns {Promise<TipadoData<DataEmpresaBajaResult>>} La baja aplicada o el error del hook.
 */
const bajaLogicaEmpresa = async (
    id_empresa: number
): Promise<TipadoData<DataEmpresaBajaResult>> => {

    const sql: string = `UPDATE empresas
                         SET estado = 'inactivos'
                         WHERE id_empresa = ?
                           AND estado = 'activos';`;

    const valores: unknown[] = [id_empresa];

    return await iudEntidad<DataEmpresaBajaResult>({
        slqEntidad: sql,
        valores,
        entidad: "EMPRESA",
        metodo: "MODIFICAR",
        datosRetorno: { id_empresa, estado: "inactivos" },
    });
};

/**
 * Busca una empresa por su id.
 *
 * Se consulta ANTES de modificarla o de darla de baja, para responder 404 si no
 * existe en lugar de dejar que el `UPDATE` afecte 0 filas.
 *
 * @param id_empresa - Identificador de la empresa.
 * @returns {Promise<TipadoData<FilaEmpresa>>} `EMPRESA_EXISTE` si hay fila /
 *   `EMPRESA_NO_EXISTE` si ese id no existe.
 */
const buscarEmpresaPorId = async (
    id_empresa: number
): Promise<TipadoData<FilaEmpresa>> => {

    const sql: string = `SELECT id_empresa, razon_social, domicilio, whatsapp, instagram,
                                facebook, logo_url, public_id, estado, fecha_creacion
                         FROM empresas
                         WHERE id_empresa = ?;`;

    const valores: unknown[] = [id_empresa];

    return await buscarExistenteEntidad<FilaEmpresa>({
        slqEntidad: sql,
        valores,
        entidad: "EMPRESA",
    });
};

/**
 * Listado paginado de empresas.
 *
 * - Sin `estado` el filtro es `activos` (el caso normal de la pantalla); para ver
 *   las dadas de baja hay que mandar `?estado=inactivos`.
 * - `razon_social` es parcial: `LIKE '%texto%'`.
 * - Usa el hook generico `listarEntidad`, por lo que la SQL trae
 *   `COUNT(*) OVER() AS total_registros` para el calculo de paginacion.
 *
 * @param parametros - Lo validado por Zod en el Servicio mas el `offset` calculado alla.
 * @returns {Promise<TipadoData<FilaEmpresa[]>>} Listado paginado o el error asociado.
 */
const listarEmpresas = async (
    parametros: ListadoPorFiltro
): Promise<TipadoData<FilaEmpresa[]>> => {

    const { pagina, limit, offset, razon_social, estado } = parametros;

    const condiciones: string[] = [];
    const valores: unknown[] = [];

    condiciones.push("estado = ?");
    valores.push(estado ?? "activos");

    if (razon_social !== undefined) {
        condiciones.push("razon_social LIKE ?");
        valores.push(`%${razon_social}%`);
    }

    const where = `WHERE ${condiciones.join(" AND ")}`;

    const sql: string = `SELECT id_empresa, razon_social, domicilio, whatsapp, instagram,
                                facebook, logo_url, public_id, estado, fecha_creacion,
                                COUNT(*) OVER() AS total_registros
                         FROM empresas
                         ${where}
                         ORDER BY razon_social
                         LIMIT ${limit} OFFSET ${offset};`;

    return listarEntidad<FilaEmpresa>({
        slqListado: sql,
        valores,
        entidad: "EMPRESAS",
        estado: estado ?? "activas",
        limit,
        pagina: String(pagina),
    });
};

export const method = {
    altaEmpresa: tryCatchDatos(altaEmpresa),
    modificarEmpresa: tryCatchDatos(modificarEmpresa),
    bajaLogicaEmpresa: tryCatchDatos(bajaLogicaEmpresa),
    buscarEmpresaPorId: tryCatchDatos(buscarEmpresaPorId),
    listarEmpresas: tryCatchDatos(listarEmpresas),
};