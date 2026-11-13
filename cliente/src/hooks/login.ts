import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
// Funciones
import { RutasProtegidasContext } from "../contexto/protectRutas";
import { LoginFetch } from "../servicio/login.fetch";
import { transformErrores } from "./erroresZod";
import { useNotificaciones } from "../contexto/notificaciones.context";

// typados
import type { InputsPropsFormulario } from "../componentes/generales/Formulario/Formulario";
import type { ErrorBackend } from "./erroresZod";


interface LoginLogicaReturn {
    errorGenerico: string | null;
    errorsZod: Record<string, string | null>;
    dataLogin: any; // O mejor aún, una interfaz de tus credenciales
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    handleCancelar: (e: React.MouseEvent<HTMLButtonElement>) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    inputsLogin: InputsPropsFormulario[];
}

const inputsLogin: InputsPropsFormulario[] = [
  {
    name: "usuario",
    label: "Usuario",
    type: "text",
    placeholder: "Ingrese su usuario",
    value: "",
    readonly: false,
  },
  {
    name: "contrasena",
    label: "Contraseña",
    type: "password",
    placeholder: "Ingrese su contraseña",
    value: "",
    readonly: false,
  },
];



/**
 * Lógica del formulario de login: estado, validación, envío y notificaciones.
 * Emite toasts (spec 052, D4/R2) conservando el feedback inline del formulario.
 *
 * @returns Estado y handlers del login.
 */
export const useLoginLogica = () : LoginLogicaReturn =>{

    const navegar = useNavigate();      
    const { setRol } = useContext(RutasProtegidasContext);
    const { exito, error, info } = useNotificaciones();


    const [errorsZod, setErrorsZod] = useState<Record<string, string | null>>({});
    const [errorGenerico] = useState<string | null>(null);
    const [dataLogin, setDataLogin] = useState<any>({
        usuario: "",
        contrasena: "",
    });

    const handleCancelar = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        navegar("/");
    };

    /**
     * Envía las credenciales y gestiona errores inline + toasts.
     * @param e - Evento de submit del formulario.
     */
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const respuesta = await LoginFetch(dataLogin);

        if (
          respuesta.error === true &&
          respuesta.code === "VALIDATION_ERROR" &&
          respuesta.errorsDetails
        ) {
          const erroresTransformados = transformErrores(
            respuesta.errorsDetails as ErrorBackend[],
          );
          setErrorsZod(erroresTransformados);
          // R2: Zod/validación solo inline, sin toast.
          return;
        }
        if (respuesta.error === true) {
          //setErrorGenerico(respuesta.message);
          setErrorsZod({ null: null });
          // R2: credenciales inválidas / rechazo de auth -> info; resto -> error.
          const esRechazoAuth =
            respuesta.code === "VERIFICAR_USUARIO" ||
            respuesta.code === "USUARIO_NO_EXISTE" ||
            respuesta.statusCode === 401 ||
            respuesta.statusCode === 403;
          if (esRechazoAuth) {
            info(respuesta.message || "Verificá tus credenciales.");
          } else {
            error(respuesta.message || "Ocurrió un error al iniciar sesión.");
          }
          return;
        }
        if (respuesta.error === false) {
          exito("Sesión iniciada correctamente.");
          setRol({
            rol: respuesta.data.rol,
            usuario : respuesta.data.usuario,
            razon_social : respuesta.data.razon_social,
            rubro : respuesta.data.rubro,
            tipo : respuesta.data.tipo ,
            estado_suscripcion : respuesta.data.estado_suscripcion
          });
          setDataLogin({
            usuario: "",
            contrasena: "",
          });
          if (respuesta.data.rol === "administrador")
            return navegar("/assistant_manager_priv");
          if (respuesta.data.rol === "usuario")
            return navegar("/user_manager_priv");
          if ( respuesta.data.rol === "alumno")
            return navegar("/alumno_principal")
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const usuario = e.target.value.trim();
        setDataLogin({
        ...dataLogin,
        [e.target.name]: usuario,
        });
    };

    return {
        errorGenerico,
        errorsZod,
        dataLogin,

        handleSubmit,
        handleCancelar,
        handleChange,

        inputsLogin
    };

};