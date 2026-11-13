import { SpinnerTarjeta } from "../../Metricas/SipinnerMetricas/SpinnerTajetas";
import { Paginacion } from "../../generales/Paginacion/Paginacion";
import { CompoError } from "../../generales/Error/Error";
import { Boton } from "../../generales/Boton/Boton";
import {
    type FiltrosListadoUsuarioAdminInputs,
    type FilaUsuarioAdmin,
} from "../../../servicio/usuarios.admin.fetch";
import "./listadousuario.css";

/** Fila pintable: viaja COMPLETA (con `rol` e `id_escuela`) porque la
 *  modificación (spec 008) precarga el formulario con esos campos. */
type FilaListadoUsuario = FilaUsuarioAdmin;

/** Props del listado de usuarios (compartido por los 2 listados: usuarios y alumnos) */
interface ListadoUsuarioProps {
    /** Título visible del listado: "Usuarios" o "Alumnos" */
    titulo: string;
    /** Filtros vigentes: pagina / limit / id_escuela */
    filtros: FiltrosListadoUsuarioAdminInputs;
    /** Filas a pintar */
    filas: FilaListadoUsuario[];
    /** ¿Cargando? → spinner */
    carga: boolean;
    /** Total de páginas del paginador (lo manda el server en `paginacion`) */
    contadorPagina: number;
    /** Aviso de este listado (server caído, sesión vencida…). Null = sin error */
    error?: string | null;
    /** Al cambiar de página del paginador */
    onCambioPagina?: (pagina: number) => void;
    /** Al clickear "Modificar" en una fila: abre el modal con esos datos */
    onModificar?: (fila: FilaListadoUsuario) => void;
}

/** Props de la fila individual de usuario */
interface UsuarioItemProps {
    usuario: FilaListadoUsuario;
    /** Mismo callback que la lista: si no llega, la fila no pinta botón */
    onModificar?: (fila: FilaListadoUsuario) => void;
}

/** Clase del badge de estado: activo → éxito, inactivo → error, resto → ámbar.
 *  Acepta singular y plural: la BD escribe `'activos'` / `'inactivos'`
 *  (DEFAULT de la tabla `usuarios`) — spec 007. */
const claseEstado = (estado: string) => {
    const e = estado.toLowerCase();
    if (["activo", "activa", "activos", "activas"].includes(e)) return "usuario_estado--activo";
    if (["inactivo", "inactiva", "inactivos", "inactivas"].includes(e)) return "usuario_estado--inactivo";
    return "usuario_estado--otro";
};

/** Fecha a texto legible (acepta `string` o `Date`) */
const fechaTexto = (fecha: string | Date) => {
    return typeof fecha === "string" ? fecha : fecha.toLocaleDateString("es-AR");
};

/** Fila individual: principal (usuario + nombre y apellido) + datos + estado
 *  + botón de modificación (spec 008) */
const UsuarioItem = ({ usuario, onModificar }: UsuarioItemProps) => {
    return (
        <article className="usuario_row">
            <div className="usuario_principal">
                <h3 className="usuario_nombre">{usuario.usuario}</h3>
                <p className="usuario_persona">
                    {usuario.nombre} {usuario.apellido}
                </p>
            </div>

            <div className="usuario_dato">
                <span className="usuario_label">Correo</span>
                <span className="usuario_valor">{usuario.correo}</span>
            </div>

            <div className="usuario_dato">
                <span className="usuario_label">Celular</span>
                <span className="usuario_valor">{usuario.celular ?? "—"}</span>
            </div>

            <div className="usuario_dato">
                <span className="usuario_label">Alta</span>
                <span className="usuario_valor">{fechaTexto(usuario.fecha_alta)}</span>
            </div>

            <span className={`usuario_estado ${claseEstado(usuario.estado)}`}>
                {usuario.estado}
            </span>

            {/* Modificar: abre el modal precargado con esta fila */}
            {onModificar && (
                <div className="usuario_accion">
                    <Boton
                        clase="editar"
                        logo="Edit"
                        texto="Modificar"
                        type="button"
                        onClick={() => onModificar(usuario)}
                    />
                </div>
            )}
        </article>
    );
};

/** Listado de usuarios Admin: spinner / vacío / filas + aviso + paginador */
export const ListadoUsuario = ({
    titulo,
    filtros,
    filas,
    carga,
    contadorPagina,
    error,
    onCambioPagina,
    onModificar,
}: ListadoUsuarioProps) => {
    return (
        <section className="listado_usuarios">
            <h2 className="listado_usuarios_titulo">{titulo}</h2>

            {carga ? (
                <SpinnerTarjeta />
            ) : filas.length === 0 ? (
                <p className="listado_usuarios_vacio">No hay usuarios para mostrar.</p>
            ) : (
                <div className="listado_usuarios_lista">
                    {filas.map((fila) => (
                        <UsuarioItem
                            key={fila.id_usuario}
                            usuario={fila}
                            onModificar={onModificar}
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
