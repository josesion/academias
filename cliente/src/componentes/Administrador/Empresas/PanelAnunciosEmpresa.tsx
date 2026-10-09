import { LuX, LuVideo } from "react-icons/lu";

import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";
import { CompoError } from "../../generales/Error/Error";

import type { FilaAnuncio } from "../../../servicio/anuncios.fetch";
import type { FilaEmpresa } from "../../../servicio/empresas.fetch";
import "./panelanunciosempresa.css";

/* ==========================================================================
   PANEL DE ANUNCIOS DE UNA EMPRESA

   Es SOLO LECTURA: muestra qué avisos tiene la empresa clickeada, para poder
   verlos de un vistazo. Editarlos o borrarlos es cosa de la pantalla de
   anuncios (`/admin/anuncios`), no de acá.

   El listado del server no trae paginación (por eso esta pantalla no pinta
   `<Paginacion>`): trae todos los anuncios de esa empresa.
   ========================================================================== */

/** Etiqueta legible de cada red (la columna de la empresa tiene la dirección) */
const ETIQUETA_CONTACTO: Record<string, string> = {
    whatsapp: "WhatsApp",
    facebook: "Facebook",
    instagram: "Instagram",
};

/** Fecha a texto legible (acepta `string` de MySQL o `Date`) */
const fechaTexto = (fecha: string | Date) => {
    return typeof fecha === "string" ? fecha.slice(0, 10) : fecha.toLocaleDateString("es-AR");
};

interface PanelAnunciosEmpresaProps {
    /** Empresa de la que se muestran los anuncios (va en el título) */
    empresa: FilaEmpresa;
    /** Anuncios de la empresa */
    filas: FilaAnuncio[];
    /** ¿Cargando? → spinner */
    carga: boolean;
    /** Aviso del listado (server caído…). Null = sin error */
    error?: string | null;
    onCerrar: () => void;
}

export const PanelAnunciosEmpresa = ({
    empresa,
    filas,
    carga,
    error,
    onCerrar,
}: PanelAnunciosEmpresaProps) => {
    return (
        <section className="panel_anuncios">
            <header className="panel_anuncios_encabezado">
                <div className="panel_anuncios_titulos">
                    <span className="panel_anuncios_etiqueta">Anuncios de la empresa</span>
                    <h2 id="panel_anuncios_titulo">{empresa.razon_social}</h2>
                    <p>
                        {filas.length === 1
                            ? "1 anuncio publicado."
                            : `${filas.length} anuncios publicados.`}
                    </p>
                </div>

                <button
                    type="button"
                    className="panel_anuncios_cerrar"
                    aria-label="Cerrar el panel de anuncios"
                    onClick={onCerrar}
                >
                    <LuX size={18} />
                </button>
            </header>

            {carga ? (
                <SpinnerTarjeta />
            ) : filas.length === 0 ? (
                /* El 204 (SIN_ANUNCIOS) del server llega como lista vacía: esto
                   no es un error, es que la empresa no tiene avisos todavía. */
                <p className="panel_anuncios_vacio">
                    Esta empresa todavía no tiene anuncios publicados.
                </p>
            ) : (
                <div className="panel_anuncios_lista">
                    {filas.map((anuncio) => (
                        <article className="panel_anuncios_card" key={anuncio.id_anuncio}>
                            {/* Miniatura: la imagen directa, o el ícono si es video */}
                            <div className="panel_anuncios_media">
                                {anuncio.tipo_media === "video" ? (
                                    <span className="panel_anuncios_media_icono" aria-hidden="true">
                                        <LuVideo size={20} />
                                        <span className="panel_anuncios_media_tipo">Video</span>
                                    </span>
                                ) : (
                                    <img
                                        src={anuncio.media_url}
                                        alt={anuncio.titulo}
                                        className="panel_anuncios_media_img"
                                    />
                                )}
                            </div>

                            <div className="panel_anuncios_datos">
                                <h3 className="panel_anuncios_titulo_card">{anuncio.titulo}</h3>

                                <p className="panel_anuncios_descripcion">{anuncio.descripcion}</p>

                                <div className="panel_anuncios_pie">
                                    <span className="panel_anuncios_contacto">
                                        {ETIQUETA_CONTACTO[anuncio.tipo_contacto] ?? anuncio.tipo_contacto}
                                    </span>

                                    <span className="panel_anuncios_fecha">
                                        {fechaTexto(anuncio.fecha_creacion)}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* Aviso del listado: acá SÍ es un error (el 204 ya se tradujo a
                lista vacía arriba) */}
            {error && <CompoError mensaje={error} />}

            {/* Aviso al pie: el panel es de solo lectura */}
            <p className="panel_anuncios_nota">
                Para modificar o eliminar un anuncio, usá la pantalla de Anuncios.
            </p>
        </section>
    );
};