import { useState, useEffect } from "react";
import { LuX } from "react-icons/lu";

import { Boton } from "../../generales/Boton/Boton";
import { Inputs } from "../../generales/Inputs/Inputs";
import { CompoError } from "../../generales/Error/Error";

import type { EmpresasTipado } from "../../../reducers/empresas.reducer";
import "./formularioempresa.css";

/* ==========================================================================
   FORMULARIO DE EMPRESAS — ALTA (POST /api/empresa_alta) y MODIFICACIÓN
   (PUT /api/empresa_mod)

   Presentacional: recibe todo por props, no toca el estado. El modo lo dice
   `metodo`: en PUT el botón llama a `putEmpresa` y el logo arranca sin
   cambios (hay que elegir uno nuevo para reemplazarlo).

   El logo se manda como archivo en el campo `logo` del multipart, y el server
   lo valida: solo JPG, PNG o WEBP, y hasta 2 MB.
   ========================================================================== */

/** Formatos que acepta el server, para el `accept` del input de archivo. */
const FORMATOS_LOGO = "image/jpeg,image/png,image/webp";

interface PropsFormularioEmpresa {
    /** Celdas del form en el reducer (`EmpresasTipado["formulario"]`) */
    formulario: EmpresasTipado["formulario"];
    /** Logo nuevo elegido en el form. `null` = se conserva el actual */
    logo: File | null;
    /** Fila de la empresa en edición (solo para mostrar el logo actual) */
    empresaEnEdicion: EmpresasTipado["empresaEnEdicion"];
    /** Aviso del alta o de la modificación. Null = sin error */
    error: string | null;
    /** ¿Enviando? → el botón Guardar queda `disable` (muestra spinner) */
    carga: boolean;
    /** Modo del modal: `"POST"` = alta, `"PUT"` = modificación */
    metodo: EmpresasTipado["metodo"];
    cachearFormulario: (event: React.ChangeEvent<HTMLInputElement>) => void;
    /** Elige el archivo del logo */
    cambiarLogo: (event: React.ChangeEvent<HTMLInputElement>) => void;
    /** Deselecciona el logo nuevo */
    quitarLogo: (event: React.MouseEvent<HTMLButtonElement>) => void;
    /** Guarda el alta (modo POST) */
    postEmpresa: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    /** Guarda la modificación (modo PUT) */
    putEmpresa: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    onCerrar: () => void;
}

export const FormularioEmpresa = (props: PropsFormularioEmpresa) => {
    const {
        formulario,
        logo,
        empresaEnEdicion,
        error,
        carga,
        metodo,
        cachearFormulario,
        cambiarLogo,
        quitarLogo,
        postEmpresa,
        putEmpresa,
        onCerrar,
    } = props;

    const esModificacion = metodo === "PUT";

    // Vista previa del logo. Se arma un blob URL del File elegido y, si no hay
    // ninguno, se usa el `logo_url` de la empresa en edición (que es una URL de
    // R2). El blob se revoca al cambiar o al desmontar para no dejar memoria.
    const [urlPrevia, setUrlPrevia] = useState<string | null>(null);

    useEffect(() => {
        if (!logo) {
            setUrlPrevia(esModificacion ? empresaEnEdicion?.logo_url ?? null : null);
            return;
        }

        const objectUrl = URL.createObjectURL(logo);
        setUrlPrevia(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [logo, esModificacion, empresaEnEdicion?.logo_url]);

    return (
        <form
            className="form-empresa"
            onSubmit={(event) => event.preventDefault()}
        >
            <header className="form-empresa__encabezado">
                <h2 className="form-empresa__titulo" id="form_empresa_titulo">
                    {esModificacion ? "Modificar empresa" : "Nueva empresa"}
                </h2>

                <p className="form-empresa__subtitulo">
                    {esModificacion
                        ? "Actualizá los datos. Si no elegís un logo nuevo, se conserva el actual."
                        : "Cargá los datos de la empresa. El logo y las redes son opcionales."}
                </p>
            </header>

            <div className="form-empresa__grupo form-empresa__grupo--datos">
                <Inputs
                    type="text"
                    label="Razón social"
                    placeholder="ej: ELPIS Comunicación"
                    readonly={false}
                    name={formulario.razon_social.name}
                    value={formulario.razon_social.value}
                    onChange={cachearFormulario}
                />

                <Inputs
                    type="text"
                    label="Domicilio"
                    placeholder="Dirección de la empresa"
                    readonly={false}
                    name={formulario.domicilio.name}
                    value={formulario.domicilio.value}
                    onChange={cachearFormulario}
                />

                {/* ---------- Las 3 redes: todas opcionales ---------- */}
                <Inputs
                    type="text"
                    label="WhatsApp (opcional)"
                    placeholder="+598 99 999 999"
                    readonly={false}
                    name={formulario.whatsapp.name}
                    value={formulario.whatsapp.value}
                    onChange={cachearFormulario}
                />

                <Inputs
                    type="text"
                    label="Instagram (opcional)"
                    placeholder="@usuario"
                    readonly={false}
                    name={formulario.instagram.name}
                    value={formulario.instagram.value}
                    onChange={cachearFormulario}
                />

                <Inputs
                    type="text"
                    label="Facebook (opcional)"
                    placeholder="usuario o página"
                    readonly={false}
                    name={formulario.facebook.name}
                    value={formulario.facebook.value}
                    onChange={cachearFormulario}
                />
            </div>

            {/* ---------- Logo: input de archivo + vista previa ---------- */}
            <div className="form-empresa__grupo form-empresa__grupo--logo">
                <div className="form-empresa__logo-input">
                    <Inputs
                        type="file"
                        label="Logo (opcional)"
                        name="logo"
                        readonly={false}
                        accept={FORMATOS_LOGO}
                        onChange={cambiarLogo}
                    />

                    {logo && (
                        <button
                            type="button"
                            className="form-empresa__logo-quitar"
                            aria-label="Quitar el logo nuevo"
                            onClick={quitarLogo}
                        >
                            <LuX size={14} />
                            Quitar logo nuevo
                        </button>
                    )}
                </div>

                <figure className="form-empresa__logo-panel" aria-live="polite">
                    <div className="form-empresa__logo-marco">
                        {urlPrevia ? (
                            <img
                                src={urlPrevia}
                                alt="Vista previa del logo de la empresa"
                                className="form-empresa__logo-img"
                            />
                        ) : (
                            <span className="form-empresa__logo-vacio">Logo</span>
                        )}
                    </div>

                    <figcaption className="form-empresa__logo-leyenda">
                        {logo
                            ? "Logo nuevo"
                            : urlPrevia
                                ? "Logo actual (sin cambios)"
                                : "Sin logo"}
                    </figcaption>
                </figure>
            </div>

            <div className="form-empresa__acciones">
                {/* El botón elige la función según el método */}
                <Boton
                    disable={carga}
                    clase="agregar"
                    logo={esModificacion ? "Edit" : "Add"}
                    type="button"
                    texto={esModificacion ? "Guardar cambios" : "Guardar"}
                    onClick={esModificacion ? putEmpresa : postEmpresa}
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