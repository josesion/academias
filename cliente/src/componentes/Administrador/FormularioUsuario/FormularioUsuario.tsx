import "./formulariousuario.css";

import { Boton } from "../../generales/Boton/Boton";
import { Inputs } from "../../generales/Inputs/Inputs";
import { CompoError } from "../../generales/Error/Error";
import { SelectorOpt } from "../../generales/CompSelecObt/SelectorOpt";

import type { UsuariosTipado } from "../../../reducers/usuarios.reducers";
import type { EscuelaSelect } from "../../../servicio/suspcripciones.fetch";

/* ==========================================================================
   FORMULARIO DE CUENTAS — ALTA (POST /api/usuario_admin_alta) y
   MODIFICACIÓN (PUT /api/usuario_admin_mod)

   Presentacional: recibe todo por props, no toca el estado. El modo lo dice
   `metodo`: en PUT se deshabilitan academia y rol (el server no los
   modifica), la contraseña queda vacía (= se mantiene) y el botón llama a
   `putUsuario`; en POST todo lo contrario y llama a `postUsuario`.

   Animaciones: se aplica la skill `emil-design-eng` — ease-out fuerte,
   propiedades exactas en cada `transition`, entrada escalonada de los
   campos y `prefers-reduced-motion` respetado.
   ========================================================================== */

/** Opción del select de rol: `valor` es lo que existe en la BD */
interface OpcionRol {
    valor: string;
    etiqueta: string;
}

// Sin `export`: react-refresh/only-export-components solo deja componentes
const OPCIONES_ROL: OpcionRol[] = [
    { valor: "usuario", etiqueta: "Usuario" },
    { valor: "alumno", etiqueta: "Alumno" },
];

interface PropsFormularioUsuario {
    /** Celdas del form en el reducer (`UsuariosTipado["formulario"]`) */
    formulario: UsuariosTipado["formulario"];
    /** Aviso del alta o de las opciones de los selects. Null = sin error */
    error: string | null;
    /** ¿Enviando? → el botón Guardar queda `disable` (muestra spinner) */
    carga: boolean;
    /** Escuelas del `<SelectorOpt>`: salen de `state.opciones` (ya cargadas) */
    escuelas: EscuelaSelect[];
    /** Modo del modal: `"POST"` = alta, `"PUT"` = modificación */
    metodo: UsuariosTipado["metodo"];
    /* Unión de tipos: la pide SelectorOpt (<select>) y Inputs la acepta igual */
    cachearFormulario: (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => void;
    /** Guarda el alta (modo POST) */
    postUsuario: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    /** Guarda la modificación (modo PUT) */
    putUsuario: (event: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
    onCerrar: () => void;
}

export const FormularioUsuario = (props: PropsFormularioUsuario) => {
    const {
        formulario,
        error,
        carga,
        escuelas,
        metodo,
        cachearFormulario,
        postUsuario,
        putUsuario,
        onCerrar,
    } = props;

    // En modificación: academia y rol son solo lectura (el server no los
    // cambia) y el botón llama a la función del PUT
    const esModificacion = metodo === "PUT";

    return (
        <form
            className="form-cuenta"
            onSubmit={(event) => event.preventDefault()}
        >
            <header className="form-cuenta__encabezado">
                <h2 className="form-cuenta__titulo" id="form_cuenta_titulo">
                    {esModificacion ? "Modificar cuenta" : "Nueva cuenta"}
                </h2>

                <p className="form-cuenta__subtitulo">
                    {esModificacion
                        ? "Actualizá los datos de la cuenta. La academia y el rol no se pueden cambiar."
                        : "Cargá los datos de la persona y la academia a la que pertenece."}
                </p>
            </header>

            <div className="form-cuenta__grupo form-cuenta__grupo--datos">
                {/* ---------- Academia (solo lectura en el PUT) ---------- */}
                <div className="form-cuenta__campo">
                    <span className="form-cuenta__label">Academia</span>

                    <SelectorOpt<EscuelaSelect>
                        categorias={escuelas}
                        itemKey="id_escuela"
                        itemLabel="razon_social"
                        name={formulario.id_escuela.name}
                        value={formulario.id_escuela.value}
                        labelDefault="Seleccione una academia..."
                        disabled={esModificacion}
                        onChangeSelector={cachearFormulario}
                    />
                </div>

                {/* ---------- Rol (solo lectura en el PUT) ---------- */}
                <div className="form-cuenta__campo">
                    <span className="form-cuenta__label">Rol</span>

                    <SelectorOpt<OpcionRol>
                        categorias={OPCIONES_ROL}
                        itemKey="valor"
                        itemLabel="etiqueta"
                        name={formulario.rol.name}
                        value={formulario.rol.value}
                        labelDefault="Seleccione un rol..."
                        disabled={esModificacion}
                        onChangeSelector={cachearFormulario}
                    />
                </div>

                <Inputs
                    type="text"
                    label="Usuario"
                    placeholder="ej: maria_gomez"
                    readonly={false}
                    name={formulario.usuario.name}
                    value={formulario.usuario.value}
                    onChange={cachearFormulario}
                />

                {/* La contraseña viaja oculta: la hashea el server (bcrypt).
                    En PUT vacío = no se manda = se mantiene la actual */}
                <Inputs
                    type="password"
                    label={esModificacion ? "Nueva contraseña (opcional)" : "Contraseña"}
                    placeholder={
                        esModificacion
                            ? "Dejar vacío para mantener la actual"
                            : "Mínimo 8 caracteres"
                    }
                    readonly={false}
                    name={formulario.contrasena.name}
                    value={formulario.contrasena.value}
                    onChange={cachearFormulario}
                />

                <Inputs
                    type="text"
                    label="Nombre"
                    placeholder="Nombre"
                    readonly={false}
                    name={formulario.nombre.name}
                    value={formulario.nombre.value}
                    onChange={cachearFormulario}
                />

                <Inputs
                    type="text"
                    label="Apellido"
                    placeholder="Apellido"
                    readonly={false}
                    name={formulario.apellido.name}
                    value={formulario.apellido.value}
                    onChange={cachearFormulario}
                />

                <Inputs
                    type="email"
                    label="Correo"
                    placeholder="nombre@correo.com"
                    readonly={false}
                    name={formulario.correo.name}
                    value={formulario.correo.value}
                    onChange={cachearFormulario}
                />

                {/* Único campo opcional del schema: vacío → undefined */}
                <Inputs
                    type="text"
                    label="Celular (opcional)"
                    placeholder="Sin celular"
                    readonly={false}
                    name={formulario.celular.name}
                    value={formulario.celular.value}
                    onChange={cachearFormulario}
                />
            </div>

            <div className="form-cuenta__acciones">
                {/* El botón elige la función según el método (spec 008) */}
                <Boton
                    disable={carga}
                    clase="agregar"
                    logo={esModificacion ? "Edit" : "Add"}
                    type="button"
                    texto={esModificacion ? "Guardar cambios" : "Guardar"}
                    onClick={esModificacion ? putUsuario : postUsuario}
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
