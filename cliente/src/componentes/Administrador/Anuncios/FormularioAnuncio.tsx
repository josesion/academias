import { Boton } from "../../generales/Boton/Boton";
import { Inputs } from "../../generales/Inputs/Inputs";
import { CompoError } from "../../generales/Error/Error";
import { SelectorOpt } from "../../generales/CompSelecObt/SelectorOpt";
import { SelectorMedia } from "./SelectorMedia";

import type { AnunciosTipado } from "../../../reducers/anuncios.reducer";
import type { FilaEmpresa } from "../../../servicio/empresas.fetch";
import type { TipoContacto } from "../../../servicio/anuncios.fetch";
import "./formularioanuncio.css";

/* ==========================================================================
   FORMULARIO DE ANUNCIOS — ALTA (POST /api/anuncio_alta) y MODIFICACIÓN
   (PUT /api/anuncio_mod)

   Presentacional: recibe todo por props, no toca el estado. El modo lo dice
   `metodo`.

   Lo particular del anuncio: la **media es obligatoria en el alta** (el server
   responde 400 `MEDIA_AUSENTE`) y **opcional en la modificación** (si no se
   elige una, el `FormData` viaja sin el campo y el server conserva la actual).
   ========================================================================== */

/** Opción del selector de contacto: `valor` es lo que acepta el enum del server */
interface OpcionContacto {
    valor: TipoContacto;
    etiqueta: string;
}

// Sin `export`: react-refresh/only-export-components solo deja componentes
const OPCIONES_CONTACTO: OpcionContacto[] = [
    { valor: "whatsapp", etiqueta: "WhatsApp" },
    { valor: "facebook", etiqueta: "Facebook" },
    { valor: "instagram", etiqueta: "Instagram" },
];

interface PropsFormularioAnuncio {
    /** Celdas del form en el reducer (`AnunciosTipado["formulario"]`) */
    formulario: AnunciosTipado["formulario"];
    /** Media nueva elegida. `null` = se conserva la actual (o es el alta) */
    media: File | null;
    /** Anuncio en edición (solo para mostrar la media actual). Null en el alta */
    anuncioEnEdicion: AnunciosTipado["anuncioEnEdicion"];
    /** Empresas del selector (ya cargadas en el reducer) */
    empresas: FilaEmpresa[];
    /** Aviso del alta o de la modificación. Null = sin error */
    error: string | null;
    /** ¿Enviando? → el botón Guardar y el input de archivo quedan deshabilitados */
    carga: boolean;
    /** Modo del modal: `"POST"` = alta, `"PUT"` = modificación */
    metodo: AnunciosTipado["metodo"];
    /* Unión de tipos: la pide SelectorOpt, el textarea y Inputs la aceptan */
    cachearFormulario: (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => void;
    cambiarMedia: (event: React.ChangeEvent<HTMLInputElement>) => void;
    quitarMedia: (event: React.MouseEvent<HTMLButtonElement>) => void;
    /** Guarda el alta (modo POST) */
    postAnuncio: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    /** Guarda la modificación (modo PUT) */
    putAnuncio: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    onCerrar: () => void;
}

export const FormularioAnuncio = (props: PropsFormularioAnuncio) => {
    const {
        formulario,
        media,
        anuncioEnEdicion,
        empresas,
        error,
        carga,
        metodo,
        cachearFormulario,
        cambiarMedia,
        quitarMedia,
        postAnuncio,
        putAnuncio,
        onCerrar,
    } = props;

    const esModificacion = metodo === "PUT";

    return (
        <form
            className="form-anuncio"
            onSubmit={(event) => event.preventDefault()}
        >
            <header className="form-anuncio__encabezado">
                <h2 className="form-anuncio__titulo" id="form_anuncio_titulo">
                    {esModificacion ? "Modificar anuncio" : "Nuevo anuncio"}
                </h2>

                <p className="form-anuncio__subtitulo">
                    {esModificacion
                        ? "Actualizá los datos. Si no elegís una media nueva, se conserva la actual."
                        : "Cargá el aviso de una empresa con su imagen o video."}
                </p>
            </header>

            <div className="form-anuncio__grupo form-anuncio__grupo--datos">
                {/* ---------- Empresa ---------- */}
                <div className="form-anuncio__campo">
                    <span className="form-anuncio__label">Empresa</span>

                    <SelectorOpt<FilaEmpresa>
                        categorias={empresas}
                        itemKey="id_empresa"
                        itemLabel="razon_social"
                        name={formulario.id_empresa.name}
                        value={formulario.id_empresa.value}
                        labelDefault="Seleccione una empresa..."
                        onChangeSelector={cachearFormulario}
                    />
                </div>

                {/* ---------- Tipo de contacto ---------- */}
                <div className="form-anuncio__campo">
                    <span className="form-anuncio__label">Tipo de contacto</span>

                    <SelectorOpt<OpcionContacto>
                        categorias={OPCIONES_CONTACTO}
                        itemKey="valor"
                        itemLabel="etiqueta"
                        name={formulario.tipo_contacto.name}
                        value={formulario.tipo_contacto.value}
                        labelDefault="Seleccione un contacto..."
                        onChangeSelector={cachearFormulario}
                    />
                </div>

                <Inputs
                    type="text"
                    label="Título"
                    placeholder="Titular del anuncio"
                    readonly={false}
                    name={formulario.titulo.name}
                    value={formulario.titulo.value}
                    onChange={cachearFormulario}
                />

                {/* ---------- Descripción: `Inputs` no tiene textarea ---------- */}
                <div className="form-anuncio__campo form-anuncio__campo--ancho">
                    <label htmlFor="anuncio_descripcion" className="form-anuncio__label">
                        Descripción
                    </label>

                    <textarea
                        id="anuncio_descripcion"
                        className="form-anuncio__textarea"
                        name={formulario.descripcion.name}
                        value={formulario.descripcion.value}
                        placeholder="Contá de qué se trata el aviso…"
                        rows={4}
                        maxLength={1000}
                        disabled={carga}
                        onChange={cachearFormulario}
                    />
                </div>
            </div>

            {/* ---------- Media ---------- */}
            <div className="form-anuncio__grupo form-anuncio__grupo--media">
                <span className="form-anuncio__label">
                    Media {esModificacion ? "(opcional)" : "(obligatoria)"}
                </span>

                <SelectorMedia
                    media={media}
                    anuncioEnEdicion={anuncioEnEdicion}
                    carga={carga}
                    onChange={cambiarMedia}
                    onQuitar={quitarMedia}
                />
            </div>

            <div className="form-anuncio__acciones">
                {/* El botón elige la función según el método */}
                <Boton
                    disable={carga}
                    clase="agregar"
                    logo={esModificacion ? "Edit" : "Add"}
                    type="button"
                    texto={esModificacion ? "Guardar cambios" : "Guardar"}
                    onClick={esModificacion ? putAnuncio : postAnuncio}
                />

                <Boton
                    clase="cancelar"
                    logo="Cancel"
                    type="button"
                    texto="Cancelar"
                    onClick={onCerrar}
                />
            </div>

            {error && <CompoError mensaje={error} />}
        </form>
    );
};