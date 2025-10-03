// Seccion Bibliotecas
import { useState } from "react";
//Seccion importComponentes
import { Boton } from "../../../componentes/Boton/Boton";

import { ListadoMolde } from "../../../componentes/ListaMolde/Listado";
import { Formulario } from "../../../componentes/Formulario/Formulario";
import { Paginacion  } from "../../../componentes/Paginacion/Paginacion";

//Seccion Contextos

//Seccion Estilos
import "../Admin/admin.css";

import  type { InputsPropsFormulario } from "../../../componentes/Formulario/Formulario";
// esto serviria para validar el tipo de dato q mandaria al fommulario 


interface UsuarioEjemplo {
  usuario: string; // 'joses', 'anita'
  nombre_completo: string; // 'José Sánchez', 'Ana Gómez'
  correo_electronico: string; // 'jose@ejemplo.com', 'ana@ejemplo.com'
  estado: 'activo' | 'inactivo'; // El estado tiene valores fijos, por lo que podemos usar un "union type"
  fecha: string; // '13221312'
}


const usuariosEjemplo2: UsuarioEjemplo[] = [
    { usuario: 'jose', nombre_completo: 'José Sánchez', correo_electronico: 'josssssse@ejemplo.com', estado: 'activo',  fecha : "13221312" },
    {  usuario: 'anita', nombre_completo: 'Ana Gómez', correo_electronico: 'anasssssssssssssssaskjhdakjhdss@ejemplo.com', estado: 'inactivo' , fecha : "13221312" },
];

const formularioDeRegistro: InputsPropsFormulario[]  = [
    { name: 'nombre', label: 'Nombre', type: 'text', placeholder: 'Ingrese su nombre' , value : ''},
    { name: 'correo', label: 'Correo Electrónicoa', type: 'text', placeholder: 'Ingrese su correo electrónico' , value : ''},
    { name: 'password', label: 'Contraseña', type: 'password', placeholder: 'Ingrese su contraseña' , value : ''},
    { name: 'fecha', label: 'fecha registro', type: 'date', placeholder: 'Ingrese la fecha de registro' , value : ''},
];

const paginacion = {
    "pagina": 1,
    "limite": 10,
    "contadorPagina": 30
    }

export const Admin = () =>{

const [formData, setFormData] = useState<Record<string, string | number >>({
        nombre: '',
        correo: '',
        password: '',
        fecha: '2025-01-01'
});

const [errorsZod, setErrorsZod] = useState<Record<string, string | null>>({ }); 
const [errorGenerico, setErrorGenerico] = useState<string | null>(null);
const [ paginaActual , SetPaginaActual] = useState(1)


const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value,
    });
    console.log(formData);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const data = { correo: 'El correo ya existe', fecha: 'La fecha ya existe' , nombre: 'tomas ya existe ' }
    e.preventDefault();
        setErrorsZod(data);
        setErrorGenerico('Error genérico de ejemplo');
    console.log('Datos enviados:', formData);
};

const handleCancelar = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('Formulario cancelado');
}



    return(

        <div className="admin_page">
            < Paginacion    contadorPagina={paginacion.contadorPagina}
                            paginaActual={ paginaActual }
                            onPaginaCambiada={ (pagina) =>{  SetPaginaActual(pagina) }  }  />

            <Formulario data={formularioDeRegistro}  
                        textoSubmit="Registrar"
                        formData={formData}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        onCancelar={handleCancelar}
                        errorsZod={errorsZod}
                        errorGenerico={errorGenerico}
                        tituloFormulario="Formulario TOMAZAUROS"
            />



            <Boton  texto="Aceptar" logo="Add" size={25}  clase="aceptar"/>
            <Boton  texto="Cancelar" logo="Cancel" size={25}  clase="cancelar"/>
            <Boton  texto="Listar" logo="List" size={25}  clase="listar"/>
            <Boton  texto="Eliminar" logo="Delete" size={25}  clase="eliminar"/>
            <Boton  texto="Volver" logo="Back" size={25}  clase="flechas"/>
            <Boton  texto="Ir" logo="Go" size={25}  clase="flechas"/>
            <Boton  texto="Check" logo="Check" size={25}  clase="aceptar"/>

            <Boton  texto="tomas" logo="Edit" size={25}  clase="editar"/>


            <ListadoMolde<UsuarioEjemplo>   
                            items={usuariosEjemplo2}
                            carga={false}
                            statusCode={200}
                            error={false}
                            onEditar={(data1) => { console.log("Editar", data1.usuario); }}
                            onEliminar={(data) => { console.log("Eliminar", data.estado); }}
            />



        </div>
    )
};