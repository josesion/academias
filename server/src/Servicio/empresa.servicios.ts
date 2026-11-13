import { tryCatchDatos } from "../utils/tryCatchBD";
import { subirImagenR2, eliminarImagenR2 } from "../utils/subirImagen";

import { method as dataEmpresa, FilaEmpresa } from "../data/empresa.data";

import { TipadoData } from "../tipados/tipado.data";
import {
    EsquemaEmpresaAlta, EsquemaEmpresaMod, EsquemaEmpresaBaja, EsquemaEmpresaLista,
    InputEmpresaAlta, InputEmpresaMod, InputEmpresaBaja, ListadoEmpresaInput,
    ListadoPorFiltro, LogoEmpresaArchivo,
} from "../squemas/empresa";

/** Lo que devuelve el alta: la empresa creada con su logo. */
export interface EmpresaAltaRetorno {
    id_empresa: number;
    razon_social: string;
    domicilio: string;
    whatsapp: string | null;
    instagram: string | null;
    facebook: string | null;
    logo_url: string | null;
}

/** Lo que devuelve la modificacion. */
export interface EmpresaModRetorno {
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
export interface EmpresaBajaRetorno {
    id_empresa: number;
    estado: string;
}

/** Formatos de logo aceptados (los mismos que flyers). */
const FORMATOS_LOGO = ["image/jpeg", "image/png", "image/webp"];

/** Tope del logo: 2 MB, igual que el de la imagen de los flyers. */
const TAMANO_MAX_LOGO = 2 * 1024 * 1024;

/** Carpeta del bucket de R2 donde viven los logos. */
const CARPETA_EMPRESAS = "empresas/";

/** Objeto que se armo como payload del alta y del PUT. */
interface EmpresaConLogo {
    dataTabla: Record<string, unknown>;
    logo?: LogoEmpresaArchivo;
}

/**
 * Valida un logo de empresa.
 *
 * Va aparte del esquema de los datos de la tabla (el archivo llega como
 * `req.file`, no en el body) y devuelve el motivo del rechazo o `null` si esta
 * bien. Los topes se validan ACA y no en multer: un `MulterError` o un error del
 * `fileFilter` terminaria en el handler global de `app.ts` como 500.
 *
 * @param logo - El archivo que llego en `req.file` (o `undefined` si no vino).
 * @returns {string | null} `FORMATO_LOGO_INVALIDO`, `TAMANO_LOGO_INVALIDO` o `null`.
 */
const validarLogo = (logo?: LogoEmpresaArchivo): string | null => {

    if (!logo) return null;

    if (!FORMATOS_LOGO.includes(logo.tipo)) {
        return "FORMATO_LOGO_INVALIDO";
    }

    if (logo.size > TAMANO_MAX_LOGO) {
        return "TAMANO_LOGO_INVALIDO";
    }

    return null;
};

/**
 * Sube un logo a Cloudflare R2 y devuelve la URL publica + la key del bucket.
 *
 * @param logo - El archivo validado.
 * @returns {Promise<{ url: string; key: string }>} La URL publica y la key.
 */
const subirLogo = async (logo: LogoEmpresaArchivo): Promise<{ url: string; key: string }> => {

    const key = await subirImagenR2(logo.buffer, logo.nombre, logo.tipo, CARPETA_EMPRESAS);

    return { url: `${process.env.R2_PUBLIC_URL}/${key}`, key };
};

/**
 * Crea una empresa.
 *
 * 1. Valida el logo (formato y tope de 2 MB) antes de tocar nada.
 * 2. Valida los datos de la tabla con Zod.
 * 3. Sube el logo a R2 en `empresas/` (opcional) y arma `logo_url` + `public_id`.
 * 4. Inserta. Si el INSERT falla despues de subir el logo, borra el objeto
 *    huerfano de R2 antes de devolver el error.
 *
 * @param data - Los datos del formulario y el logo opcional.
 * @returns {Promise<TipadoData<EmpresaAltaRetorno>>} `EMPRESA_ALTA_OK` (200) o el error.
 */
const altaEmpresa = async (data: EmpresaConLogo): Promise<TipadoData<EmpresaAltaRetorno>> => {

    const { dataTabla, logo } = data;

    // 1. El archivo primero: es la validacion que mas corta es (400 sin ir a la BD)
    const errorLogo = validarLogo(logo);

    if (errorLogo === "FORMATO_LOGO_INVALIDO") {
        return { error: true, message: "El formato del logo no esta permitido.", code: "FORMATO_LOGO_INVALIDO" };
    }

    if (errorLogo === "TAMANO_LOGO_INVALIDO") {
        return { error: true, message: "El logo no puede superar los 2 MB.", code: "TAMANO_LOGO_INVALIDO" };
    }

    // 2. Zod
    const validado: InputEmpresaAlta = EsquemaEmpresaAlta.parse(dataTabla);

    // 3. Subida a R2 (opcional)
    let logo_url: string | null = null;
    let public_id: string | null = null;

    if (logo) {
        try {
            const subido = await subirLogo(logo);
            logo_url = subido.url;
            public_id = subido.key;
        } catch {
            return { error: true, message: "No se pudo subir el logo.", code: "ERROR_SUBIR_LOGO" };
        }
    }

    // 4. Insercion
    const resultado = await dataEmpresa.altaEmpresa({ ...validado, logo_url, public_id });

    if (resultado.code === "EMPRESA_CREAR") {
        return {
            error: false,
            message: "Empresa creada correctamente.",
            data: {
                id_empresa: Number(resultado.data?.id),
                razon_social: validado.razon_social,
                domicilio: validado.domicilio,
                whatsapp: validado.whatsapp ?? null,
                instagram: validado.instagram ?? null,
                facebook: validado.facebook ?? null,
                logo_url,
            },
            code: "EMPRESA_ALTA_OK",
        };
    }

    // El logo ya esta en R2 pero no hay fila que lo referencie: lo sacamos.
    if (public_id) {
        await eliminarImagenR2(logo_url as string);
    }

    return { error: true, message: "Error en el servidor , crear empresa.", code: "ERROR_SERVIDOR" };
};

/**
 * Modifica una empresa.
 *
 * 1. Valida el logo nuevo si viene.
 * 2. Valida los datos con Zod (el `.refine()` ya garantiza al menos un campo).
 * 3. Arma el `SET` dinamico con lo que llego: lo que no vino no se toca.
 * 4. Si hay logo nuevo, lo sube y **borra el anterior de R2**.
 * 5. Si la empresa no existe, 404 (se busca antes de escribir).
 *
 * @param data - Los datos del formulario y el logo opcional.
 * @returns {Promise<TipadoData<EmpresaModRetorno>>} `EMPRESA_MOD_OK` (200),
 *   `EMPRESA_NO_ENCONTRADA` (404) o el error.
 */
const modificarEmpresa = async (data: EmpresaConLogo & { id_empresa: number }): Promise<TipadoData<EmpresaModRetorno>> => {

    const { logo, id_empresa } = data;
    // `cambia_logo` viaja al `.parse()` a proposito: el `.refine()` del esquema
    // lo necesita para saber que reemplazar el logo ES un cambio. No es una
    // columna, asi que el SET (que se arma campo por campo) nunca lo incluye.
    const { id_empresa: _id, ...campos } = data.dataTabla;

    // 1. Logo
    const errorLogo = validarLogo(logo);

    if (errorLogo === "FORMATO_LOGO_INVALIDO") {
        return { error: true, message: "El formato del logo no esta permitido.", code: "FORMATO_LOGO_INVALIDO" };
    }

    if (errorLogo === "TAMANO_LOGO_INVALIDO") {
        return { error: true, message: "El logo no puede superar los 2 MB.", code: "TAMANO_LOGO_INVALIDO" };
    }

    // 2. Zod
    const validado: InputEmpresaMod = EsquemaEmpresaMod.parse({ ...campos, id_empresa });

    // 3. SET dinamico: solo las columnas que llegaron
    const columnas: string[] = [];
    const valores: unknown[] = [];

    if (validado.razon_social !== undefined) { columnas.push("razon_social = ?"); valores.push(validado.razon_social); }
    if (validado.domicilio !== undefined)    { columnas.push("domicilio = ?");    valores.push(validado.domicilio); }
    if (validado.whatsapp !== undefined)     { columnas.push("whatsapp = ?");     valores.push(validado.whatsapp?.trim() || null); }
    if (validado.instagram !== undefined)    { columnas.push("instagram = ?");    valores.push(validado.instagram?.trim() || null); }
    if (validado.facebook !== undefined)     { columnas.push("facebook = ?");     valores.push(validado.facebook?.trim() || null); }
    if (validado.estado !== undefined)       { columnas.push("estado = ?");       valores.push(validado.estado); }

    // 4. La empresa tiene que existir: si no, 404 antes de subir el logo
    const existente = await dataEmpresa.buscarEmpresaPorId(id_empresa);

    if (existente.code === "EMPRESA_NO_EXISTE") {
        return { error: true, message: "No existe una empresa con ese id.", code: "EMPRESA_NO_ENCONTRADA" };
    }

    let logo_url: string | null | undefined;
    let public_id: string | null | undefined;
    const logoAnterior = existente.data?.logo_url ?? null;

    if (logo) {
        try {
            const subido = await subirLogo(logo);
            logo_url = subido.url;
            public_id = subido.key;
            columnas.push("logo_url = ?");
            valores.push(logo_url);
            columnas.push("public_id = ?");
            valores.push(public_id);
        } catch {
            return { error: true, message: "No se pudo subir el logo.", code: "ERROR_SUBIR_LOGO" };
        }
    }

    const resultado = await dataEmpresa.modificarEmpresa({
        ...validado,
        setSql: columnas.join(", "),
        setValores: valores,
    });

    if (resultado.code === "EMPRESA_MODIFICAR") {
        // El logo viejo se borra recien cuando ya se guardo el nuevo.
        if (logo && logoAnterior) {
            await eliminarImagenR2(logoAnterior);
        }

        return {
            error: false,
            message: "Empresa modificada correctamente.",
            data: resultado.data as EmpresaModRetorno,
            code: "EMPRESA_MOD_OK",
        };
    }

    // El logo nuevo quedo huerfano: lo sacamos de R2.
    if (logo && logo_url) {
        await eliminarImagenR2(logo_url);
    }

    return { error: true, message: "Error en el servidor , modificar empresa.", code: "ERROR_SERVIDOR" };
};

/**
 * Da de baja una empresa de forma LOGICA: la fila **no** se borra, cambia
 * `estado` a 'inactivos'. La reactivacion es un `modificarEmpresa` con
 * `estado: "activos"`.
 *
 * @param data - `{ id_empresa }` del body del DELETE.
 * @returns {Promise<TipadoData<EmpresaBajaRetorno>>} `EMPRESA_BAJA_OK` (200) o
 *   `EMPRESA_NO_ENCONTRADA` (404).
 */
const bajaEmpresa = async (data: InputEmpresaBaja): Promise<TipadoData<EmpresaBajaRetorno>> => {

    const validado = EsquemaEmpresaBaja.parse(data);

    const existente = await dataEmpresa.buscarEmpresaPorId(validado.id_empresa);

    if (existente.code === "EMPRESA_NO_EXISTE") {
        return { error: true, message: "No existe una empresa con ese id.", code: "EMPRESA_NO_ENCONTRADA" };
    }

    // El logo NO se borra de R2: la fila sigue existiendo y puede reactivarse.
    const resultado = await dataEmpresa.bajaLogicaEmpresa(validado.id_empresa);

    if (resultado.code === "EMPRESA_MODIFICAR") {
        return {
            error: false,
            message: "Empresa dada de baja correctamente.",
            data: { id_empresa: validado.id_empresa, estado: "inactivos" },
            code: "EMPRESA_BAJA_OK",
        };
    }

    return { error: true, message: "Error en el servidor , baja de empresa.", code: "ERROR_SERVIDOR" };
};

/**
 * Listado paginado de empresas.
 *
 * 1. Valida la query con Zod (si un filtro no es valido, la SQL nunca corre).
 * 2. Calcula el `offset` y consulta la data.
 *
 * @param data - Query de la peticion (`pagina`, `limit`, `razon_social`, `estado`).
 * @returns {Promise<TipadoData<FilaEmpresa[]>>} `EMPRESA_LISTA_OK` (200) o
 *   `SIN_EMPRESAS` (204).
 */
const listarEmpresas = async (data: ListadoEmpresaInput): Promise<TipadoData<FilaEmpresa[]>> => {

    const base = EsquemaEmpresaLista.parse(data);

    const parametros: ListadoPorFiltro = { ...base, offset: (base.pagina - 1) * base.limit };

    const resultado = await dataEmpresa.listarEmpresas(parametros);

    if (resultado.code === "EMPRESAS_LISTED") {
        return {
            error: false,
            message: "Listado de empresas.",
            data: resultado.data,
            paginacion: resultado.paginacion,
            code: "EMPRESA_LISTA_OK",
        };
    }

    if (resultado.code === "NO_ACTIVE_EMPRESAS") {
        return { error: true, message: "Sin empresas para mostrar.", code: "SIN_EMPRESAS" };
    }

    return { error: true, message: "Error en el servidor , listar empresas.", code: "ERROR_SERVIDOR" };
};

export const method = {
    altaEmpresa: tryCatchDatos(altaEmpresa),
    modificarEmpresa: tryCatchDatos(modificarEmpresa),
    bajaEmpresa: tryCatchDatos(bajaEmpresa),
    listarEmpresas: tryCatchDatos(listarEmpresas),
};