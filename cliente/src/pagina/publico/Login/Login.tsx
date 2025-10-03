//Seccion de Bibliotecas
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

//Seccion de compónentes
import { Formulario } from "../../../componentes/Formulario/Formulario";

// Seccion Providers
import { RutasProtegidasContext } from "../../../contexto/protectRutas";

//Servicios Fetch
import { LoginFetch } from "../../../servicio/login.fetch";

// Seccion hooks
import { transformErrores } from "../../../hooks/erroresZod";

//seccion de Stilos
import "../Login/login.css";

//Seccion tipado
// !!IMPORTATE !!  typado para los inputs del formulario 
import type{ InputsPropsFormulario } from "../../../componentes/Formulario/Formulario";
import type { ErrorBackend }  from "../../../hooks/erroresZod"


const inputsLogin: InputsPropsFormulario[] = [
    {
        name: "usuario",
        label: "Usuario",
        type: "text",
        placeholder: "Ingrese su usuario",
        value: ""
    },
    {
        name: "contrasena",
        label: "Contraseña",
        type: "password",
        placeholder: "Ingrese su contraseña",
        value: ""
    }
];

export const Login = () => {
const navegar = useNavigate();
const { setRol } = useContext(RutasProtegidasContext )

// Estados 
const [errorsZod, setErrorsZod] = useState<Record<string, string | null>>({ }); 
const [errorGenerico, setErrorGenerico] = useState<string | null>(null);
const [dataLogin, setDataLogin] = useState<any>({
    usuario: '',
    contrasena: ''
});


// Manejadores
const handleCancelar = (e: React.MouseEvent<HTMLButtonElement>) => { 
    e.preventDefault();
    navegar('/');
}

const handleSubmit =async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const respuesta = await LoginFetch(dataLogin);

    
    if (respuesta.error === true && respuesta.code === "VALIDATION_ERROR" && respuesta.errorsDetails ) {
        const erroresTransformados = transformErrores(respuesta.errorsDetails as ErrorBackend[]);
        setErrorsZod(erroresTransformados);
        setErrorGenerico(respuesta.message);
        return;
    }
    if (respuesta.error === true) {
        setErrorGenerico(respuesta.message);
        setErrorsZod({null: null});
        return;
    }
    if (respuesta.error === false) {
        setRol({ 
            usuario : respuesta.data.usuario,
            escuela : respuesta.data.id_escuela,
            rol     : respuesta.data.rol
        });
        
        if (respuesta.data.rol === "administrador") return navegar("/assistant_manager_priv");
        if (respuesta.data.rol === "usuario") return navegar("/user_manager_priv");
    }

};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDataLogin({
        ...dataLogin,
        [e.target.name]: e.target.value
    });

};

    return (
        <div className="login_pagina_contenedor">
            <Formulario data={inputsLogin}
                        textoSubmit="Iniciar Sesión"
                        tituloFormulario="Iniciar Sesión"
                        formData={dataLogin}
                        onCancelar={handleCancelar}
                        onSubmit={handleSubmit}
                        onChange={handleChange}
                        errorsZod={errorsZod}
                        errorGenerico={errorGenerico}
            />
        </div>
    );
};
