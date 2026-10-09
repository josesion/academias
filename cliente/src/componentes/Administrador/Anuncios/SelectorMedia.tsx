import { useState, useEffect } from "react";
import { LuX, LuImagePlus } from "react-icons/lu";

import type { FilaAnuncio } from "../../../servicio/anuncios.fetch";
import "./selectormedia.css";

/* ==========================================================================
   SELECTOR DE MEDIA DEL ANUNCIO

   El server acepta una imagen (JPG/PNG/WEBP hasta 2 MB) o un video
   (MP4/WEBM/MOV hasta 50 MB), y **deduce el tipo del `mimetype`**: por eso
   este componente no le pregunta al usuario si es imagen o video, solo le
   deja elegir el archivo y muestra la vista previa que corresponda.

   En MODIFICACIÓN, si no se elige nada, se muestra la media que ya tiene el
   anuncio y la leyenda aclara que se conserva (el `FormData` viaja sin el
   campo `media` y el server no la toca).
   ========================================================================== */

/** Filtro del input de archivo: lo mismo que acepta el Servicio. */
const FORMATOS_MEDIA =
    "image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime";

/** Tope del aviso, solo para el texto (el que manda es el del server) */
const TOPE_IMAGEN_MB = 2;
const TOPE_VIDEO_MB = 50;

/** El `File` elegido es un video si su tipo empieza con "video/". */
const esVideo = (archivo: File) => archivo.type.startsWith("video/");

interface SelectorMediaProps {
    /** Archivo nuevo elegido. `null` = se conserva el actual */
    media: File | null;
    /** Anuncio en edición (solo para mostrar la media actual). Null en el alta */
    anuncioEnEdicion: FilaAnuncio | null;
    /** ¿El formulario está guardando? → el input se deshabilita */
    carga: boolean;
    /** Elige el archivo */
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    /** Deselecciona el archivo nuevo */
    onQuitar: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const SelectorMedia = ({
    media,
    anuncioEnEdicion,
    carga,
    onChange,
    onQuitar,
}: SelectorMediaProps) => {
    // Blob URL del archivo elegido; si no hay, se usa la `media_url` de R2 del
    // anuncio en edición. El blob se revoca al cambiar o al desmontar.
    const [urlPrevia, setUrlPrevia] = useState<string | null>(null);

    // Si el archivo nuevo es video, la previa tiene que ser un <video>; si es
    // de la edición, el tipo lo trae el propio anuncio.
    const [esVideoPrevio, setEsVideoPrevio] = useState(false);

    useEffect(() => {
        if (!media) {
            setUrlPrevia(anuncioEnEdicion?.media_url ?? null);
            setEsVideoPrevio(anuncioEnEdicion?.tipo_media === "video");
            return;
        }

        const objectUrl = URL.createObjectURL(media);
        setUrlPrevia(objectUrl);
        setEsVideoPrevio(esVideo(media));

        return () => URL.revokeObjectURL(objectUrl);
    }, [media, anuncioEnEdicion?.media_url, anuncioEnEdicion?.tipo_media]);

    // El texto de ayuda cambia según el tipo del archivo elegido
    const ayuda = media
        ? `${media.name} · ${(media.size / (1024 * 1024)).toFixed(2)} MB`
        : "En el alta es obligatorio. JPG, PNG o WEBP hasta 2 MB. MP4, WEBM o MOV hasta 50 MB.";

    return (
        <div className="selector_media">
            {/* El input real está oculto (no con `display:none`, que lo sacaría
                del tabulador y del lector de voz): lo dispara el `<label>` de
                abajo, que es el botón que ve el usuario. */}
            <input
                id="anuncio_media"
                type="file"
                className="selector_media_input"
                name="media"
                accept={FORMATOS_MEDIA}
                disabled={carga}
                onChange={onChange}
            />

            <label htmlFor="anuncio_media" className="selector_media_boton">
                Elegir imagen o video
            </label>

            {/* ---------- Vista previa ---------- */}
            <figure className="selector_media_panel" aria-live="polite">
                <div className="selector_media_marco">
                    {urlPrevia ? (
                        esVideoPrevio ? (
                            <video
                                src={urlPrevia}
                                className="selector_media_video"
                                controls
                                // Sin audio: es una vista previa de un aviso
                                muted
                                playsInline
                            />
                        ) : (
                            <img
                                src={urlPrevia}
                                alt="Vista previa de la media del anuncio"
                                className="selector_media_img"
                            />
                        )
                    ) : (
                        <span className="selector_media_vacio">
                            <LuImagePlus size={26} />
                        </span>
                    )}
                </div>

                <figcaption className="selector_media_leyenda">
                    {media
                        ? "Media nueva"
                        : urlPrevia
                            ? "Media actual (sin cambios)"
                            : "Sin media"}
                </figcaption>

                <p className="selector_media_ayuda">
                    {media && esVideo(media)
                        ? `Video · hasta ${TOPE_VIDEO_MB} MB`
                        : media
                            ? `Imagen · hasta ${TOPE_IMAGEN_MB} MB`
                            : ayuda}
                </p>
            </figure>

            {/* ---------- Quitar el archivo nuevo ---------- */}
            {media && (
                <button
                    type="button"
                    className="selector_media_quitar"
                    aria-label="Quitar la media nueva"
                    onClick={onQuitar}
                >
                    <LuX size={14} />
                    Quitar
                </button>
            )}
        </div>
    );
};