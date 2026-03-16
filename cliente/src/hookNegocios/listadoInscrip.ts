import { useContext } from "react";

//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";

//Sericios ---------------------------------------------------
import { listadoInscripciones } from "../servicio/inscripciones.fetch";


// Logica -----------------------------------------------------
import { listaInscripcionLogica } from "../hooks/listadoInscrip";

import {  type InputsPropsBuscador } from "../componentes/Buscadores/Buscador"

// inputs para el buscador por ahora etsan en seteo no son los ioriginales

const inputsFiltro: InputsPropsBuscador[] = [
  {
    name: "dni_nombre",
    label: "DNI Alumno",
    type: "number",
    placeholder: "Ingrese DNI",
    value: "",
  },
  {
    name: "nombre_alumno",
    label: "Nombre o Apellido",
    type: "text",
    placeholder: "Ingrese Nombre o apellido",
    value: "",
  },
];



export const setListadoInscripcion = () => {
 const { rol } = useContext( RutasProtegidasContext ); 
 const config = {
    idEscuela: rol?.escuela || 1,

    servicios :{
      listado : listadoInscripciones,  
    },
    
    inputsFiltros : inputsFiltro,

    estados: ["activos", "vencidos", "todos"], 

    inicialFiltros : {
        dni_nombre: "",
        nombre_alumno : "",
        fecha_desde : "",
        fecha_hasta : ""
    },
    paginacion : { 
        pagina : 1,
        limite : 10,
        contadorPagina : 0
    },     
 };   


 return listaInscripcionLogica(config);
};