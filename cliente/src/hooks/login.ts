import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
// Funciones
import { RutasProtegidasContext } from "../contexto/protectRutas";
import { LoginFetch } from "../servicio/login.fetch";
import { transformErrores } from "./erroresZod";

// typados
import type { InputsPropsFormulario } from "../componentes/Formulario/Formulario";
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

export const loginLogica = () : LoginLogicaReturn =>{
    const navegar = useNavigate();      
    const { setRol } = useContext(RutasProtegidasContext);

    const [errorsZod, setErrorsZod] = useState<Record<string, string | null>>({});
    const [errorGenerico, setErrorGenerico] = useState<string | null>(null);
    const [dataLogin, setDataLogin] = useState<any>({
        usuario: "",
        contrasena: "",
    });

    const handleCancelar = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        navegar("/");
    };

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
          // setErrorGenerico(respuesta.message);
          return;
        }
        if (respuesta.error === true) {
          setErrorGenerico(respuesta.message);
          setErrorsZod({ null: null });
          return;
        }
        if (respuesta.error === false) {
          setRol({
            escuela: respuesta.data.id_escuela,
            rol: respuesta.data.rol,
            id_usuario: respuesta.data.id_usuario,
          });
    
          if (respuesta.data.rol === "administrador")
            return navegar("/assistant_manager_priv");
          if (respuesta.data.rol === "usuario")
            return navegar("/user_manager_priv");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDataLogin({
        ...dataLogin,
        [e.target.name]: e.target.value,
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