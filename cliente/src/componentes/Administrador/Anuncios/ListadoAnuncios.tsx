import { LuPencil, LuTrash2, LuVideo } from "react-icons/lu";

import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";
import { Paginacion } from "../../generales/Paginacion/Paginacion";
import { CompoError } from "../../generales/Error/Error";

import type {
    FilaAnuncio,
    FiltrosAnunciosQuery,
} from "../../../servicio/anuncios.fetch";
import "./listadoanuncios.css";

/* ==========================================================================
   LISTADO DE ANUNCIOS

   Cada fila trae: la miniatura (o el ícono de video), el título + descripción,
   la empresa, el tipo de contacto, la fecha y las acciones.

   Ojo con la miniatura: el server manda `tipo_media` ya resuelto, así que acá
   no hay que adivinar por la extensión de la URL.
   ========================================================================== */

interface ListadoAnunciosProps {
    /** Filas a pintar */
    filas: FilaAnuncio[];
    /** Filtros vigentes: pagina / limit / los 4 filtros */
    filtros: FiltrosAnunciosQuery;
    /** ¿Cargando? → spinner */
    carga: boolean;
    /** Total de páginas del paginador (lo manda el server en `paginacion`) */
    contadorPagina: number;
    /** Aviso de este listado (server caído, sesión vencida…). Null = sin error */
    error?: string | null;
    /** Al cambiar de página del paginador */
    onCambioPagina?: (pagina: number) => void;
    /** Modificar: abre el modal con los datos de la fila */
    onModificar?: (fila: FilaAnuncio) => void;
    /** Eliminar: abre la confirmación (la baja borra el archivo) */
    onEliminar?: (fila: FilaAnuncio) => void;
}

/** Props de la fila individual */
interface AnuncioItemProps {
    anuncio: FilaAnuncio;
    onModificar?: (fila: FilaAnuncio) => void;
    onEliminar?: (fila: FilaAnuncio) => void;
}

/** Etiqueta legible de cada red (la dirección real vive en la empresa) */
const ETIQUETA_CONTACTO: Record<string, string> = {
    whatsapp: "WhatsApp",
    facebook: "Facebook",
    instagram: "Instagram",
};

/** Fecha a texto legible (acepta `string` de MySQL o `Date`) */
const fechaTexto = (fecha: string | Date) => {
    return typeof fecha === "string" ? fecha.slice(0, 10) : fecha.toLocaleDateString("es-AR");
};

/** Fila individual de un anuncio */
const AnuncioItem = ({ anuncio, onModificar, onEliminar }: AnuncioItemProps) => {
    return (
        <article className="anuncio_row">
            {/* ---------- Miniatura: la imagen directa, o el ícono si es video ---------- */}
            <div className="anuncio_media">
                {anuncio.tipo_media === "video" ? (
                    <span className="anuncio_media_icono" aria-hidden="true">
                        <LuVideo size={20} />
                    </span>
                ) : (
                    <img
                        src={anuncio.media_url}
                        alt={anuncio.titulo}
                        className="anuncio_media_img"
                    />
                )}
            </div>

            {/* ---------- Principal ---------- */}
            <div className="anuncio_principal">
                <h3 className="anuncio_titulo">{anuncio.titulo}</h3>

                <p className="anuncio_descripcion">{anuncio.descripcion}</p>

                {/* `razon_social` puede venir null si la empresa se borró */}
                <span className="anuncio_empresa">
                    {anuncio.razon_social ?? "Empresa desconocida"}
                </span>
            </div>

            <span className="anuncio_contacto">
                {ETIQUETA_CONTACTO[anuncio.tipo_contacto] ?? anuncio.tipo_contacto}
            </span>

            <div className="anuncio_dato">
                <span className="anuncio_label">Publicado</span>
                <span className="anuncio_valor">{fechaTexto(anuncio.fecha_creacion)}</span>
            </div>

            {/* ---------- Acciones ---------- */}
            <div className="anuncio_acciones">
                {onModificar && (
                    <button
                        type="button"
                        className="anuncio_accion"
                        aria-label={`Modificar el anuncio ${anuncio.titulo}`}
                        onClick={() => onModificar(anuncio)}
                    >
                        <LuPencil size={16} />
                        <span>Modificar</span>
                    </button>
                )}

                {onEliminar && (
                    <button
                        type="button"
                        className="anuncio_accion anuncio_accion--peligro"
                        aria-label={`Eliminar el anuncio ${anuncio.titulo}`}
                        onClick={() => onEliminar(anuncio)}
                    >
                        <LuTrash2 size={16} />
                        <span>Eliminar</span>
                    </button>
                )}
            </div>
        </article>
    );
};

/** Listado de anuncios: spinner / vacío / filas + aviso + paginador */
export const ListadoAnuncios = ({
    filas,
    filtros,
    carga,
    contadorPagina,
    error,
    onCambioPagina,
    onModificar,
    onEliminar,
}: ListadoAnunciosProps) => {
    return (
        <section className="listado_anuncios">
            {carga ? (
                <SpinnerTarjeta />
            ) : filas.length === 0 ? (
                /* El 204 (SIN_ANUNCIOS) llega como lista vacía: esto no es un
                   error, es que no hay anuncios para ese filtro. */
                <p className="listado_anuncios_vacio">
                    No hay anuncios para mostrar.
                </p>
            ) : (
                <div className="listado_anuncios_lista">
                    {filas.map((fila) => (
                        <AnuncioItem
                            key={fila.id_anuncio}
                            anuncio={fila}
                            onModificar={onModificar}
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