import { MdOutlineBusiness } from "react-icons/md";
import {
    LuMegaphone,
    LuPencil,
    LuRotateCcw,
    LuTrash2,
} from "react-icons/lu";

import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";
import { Paginacion } from "../../generales/Paginacion/Paginacion";
import { CompoError } from "../../generales/Error/Error";

import type {
    FilaEmpresa,
    FiltrosEmpresasQuery,
} from "../../../servicio/empresas.fetch";
import "./listadoempresas.css";

/* ==========================================================================
   LISTADO DE EMPRESAS

   Cada fila trae: logo (o un ícono si no tiene), razón social + domicilio,
   las redes que tenga cargadas, el chip de estado y las acciones.

   El acceso al panel de anuncios de la empresa es el **botón de la razón
   social**, no la fila entera: una fila con botones dentro no puede ser un
   `<button>` (HTML no permite anidar interactivos) y hacerla clickeable con
   `onClick` en el `<article>` la dejaría inalcanzable con teclado.
   ========================================================================== */

interface ListadoEmpresasProps {
    /** Filas a pintar */
    filas: FilaEmpresa[];
    /** Filtros vigentes: pagina / limit / razon_social / estado */
    filtros: FiltrosEmpresasQuery;
    /** ¿Cargando? → spinner */
    carga: boolean;
    /** Total de páginas del paginador (lo manda el server en `paginacion`) */
    contadorPagina: number;
    /** Aviso de este listado (server caído, sesión vencida…). Null = sin error */
    error?: string | null;
    /** Al cambiar de página del paginador */
    onCambioPagina?: (pagina: number) => void;
    /** Ver los anuncios de la empresa (abre el panel) */
    onVerAnuncios?: (fila: FilaEmpresa) => void;
    /** Modificar: abre el modal con los datos de la fila */
    onModificar?: (fila: FilaEmpresa) => void;
    /** Reactivar una empresa dada de baja (solo si está inactiva) */
    onReactivar?: (fila: FilaEmpresa) => void;
    /** Dar de baja: abre la confirmación */
    onEliminar?: (fila: FilaEmpresa) => void;
}

/** Props de la fila individual */
interface EmpresaItemProps {
    empresa: FilaEmpresa;
    onVerAnuncios?: (fila: FilaEmpresa) => void;
    onModificar?: (fila: FilaEmpresa) => void;
    onReactivar?: (fila: FilaEmpresa) => void;
    onEliminar?: (fila: FilaEmpresa) => void;
}

/** Clase del badge de estado: activo → éxito, inactivo → error, resto → ámbar.
 *  Acepta singular y plural: la BD escribe `'activos'` / `'inactivos'`. */
const claseEstado = (estado: string) => {
    const e = estado.toLowerCase();
    if (["activo", "activa", "activos", "activas"].includes(e)) return "empresa_estado--activo";
    if (["inactivo", "inactiva", "inactivos", "inactivas"].includes(e)) return "empresa_estado--inactivo";
    return "empresa_estado--otro";
};

/** ¿La empresa está dada de baja? Decide si se ofrece "Reactivar". */
const estaInactiva = (estado: string) => {
    const e = estado.toLowerCase();
    return ["inactivo", "inactiva", "inactivos", "inactivas"].includes(e);
};

/** Las redes que la empresa tenga cargadas, en una línea (las vacías no van). */
const redesTexto = (empresa: FilaEmpresa) => {
    const partes = [
        empresa.whatsapp ? `WhatsApp: ${empresa.whatsapp}` : null,
        empresa.instagram ? `Instagram: ${empresa.instagram}` : null,
        empresa.facebook ? `Facebook: ${empresa.facebook}` : null,
    ].filter(Boolean);

    return partes.length > 0 ? partes.join(" · ") : "Sin redes cargadas";
};

/** Fila individual de una empresa */
const EmpresaItem = ({ empresa, onVerAnuncios, onModificar, onReactivar, onEliminar }: EmpresaItemProps) => {
    return (
        <article className="empresa_row">
            {/* ---------- Logo (o ícono si no tiene) ---------- */}
            <div className="empresa_logo">
                {empresa.logo_url ? (
                    <img
                        src={empresa.logo_url}
                        alt={`Logo de ${empresa.razon_social}`}
                        className="empresa_logo_img"
                    />
                ) : (
                    <span className="empresa_logo_vacio" aria-hidden="true">
                        <MdOutlineBusiness size={22} />
                    </span>
                )}
            </div>

            {/* ---------- Principal: la razón social abre los anuncios ---------- */}
            <div className="empresa_principal">
                {onVerAnuncios ? (
                    <button
                        type="button"
                        className="empresa_nombre empresa_nombre--accion"
                        onClick={() => onVerAnuncios(empresa)}
                    >
                        <LuMegaphone size={16} />
                        {empresa.razon_social}
                        <span className="empresa_nombre_pista">ver sus anuncios</span>
                    </button>
                ) : (
                    <h3 className="empresa_nombre">{empresa.razon_social}</h3>
                )}

                <p className="empresa_domicilio">{empresa.domicilio}</p>
            </div>

            {/* ---------- Redes ---------- */}
            <div className="empresa_dato">
                <span className="empresa_label">Contacto</span>
                <span className="empresa_valor">{redesTexto(empresa)}</span>
            </div>

            <span className={`empresa_estado ${claseEstado(empresa.estado)}`}>
                {empresa.estado}
            </span>

            {/* ---------- Acciones ---------- */}
            <div className="empresa_acciones">
                {onModificar && (
                    <button
                        type="button"
                        className="empresa_accion"
                        aria-label={`Modificar ${empresa.razon_social}`}
                        onClick={() => onModificar(empresa)}
                    >
                        <LuPencil size={16} />
                        <span>Modificar</span>
                    </button>
                )}

                {/* Reactivar solo tiene sentido si está dada de baja */}
                {onReactivar && estaInactiva(empresa.estado) && (
                    <button
                        type="button"
                        className="empresa_accion empresa_accion--reactivar"
                        aria-label={`Reactivar ${empresa.razon_social}`}
                        onClick={() => onReactivar(empresa)}
                    >
                        <LuRotateCcw size={16} />
                        <span>Reactivar</span>
                    </button>
                )}

                {onEliminar && !estaInactiva(empresa.estado) && (
                    <button
                        type="button"
                        className="empresa_accion empresa_accion--peligro"
                        aria-label={`Eliminar ${empresa.razon_social}`}
                        onClick={() => onEliminar(empresa)}
                    >
                        <LuTrash2 size={16} />
                        <span>Eliminar</span>
                    </button>
                )}
            </div>
        </article>
    );
};

/** Listado de empresas: spinner / vacío / filas + aviso + paginador */
export const ListadoEmpresas = ({
    filas,
    filtros,
    carga,
    contadorPagina,
    error,
    onCambioPagina,
    onVerAnuncios,
    onModificar,
    onReactivar,
    onEliminar,
}: ListadoEmpresasProps) => {
    return (
        <section className="listado_empresas">
            {carga ? (
                <SpinnerTarjeta />
            ) : filas.length === 0 ? (
                <p className="listado_empresas_vacio">
                    No hay empresas para mostrar.
                </p>
            ) : (
                <div className="listado_empresas_lista">
                    {filas.map((fila) => (
                        <EmpresaItem
                            key={fila.id_empresa}
                            empresa={fila}
                            onVerAnuncios={onVerAnuncios}
                            onModificar={onModificar}
                            onReactivar={onReactivar}
                            onEliminar={onEliminar}
                        />
                    ))}
                </div>
            )}

            {/* Aviso de este listado (server caído / sesión vencida) */}
            {error && <CompoError mensaje={error} />}

            <Paginacion
                paginaActual={filtros.pagina}
                contadorPagina={contadorPagina}
                onPaginaCambiada={(pagina) => onCambioPagina?.(pagina)}
            />
        </section>
    );
};