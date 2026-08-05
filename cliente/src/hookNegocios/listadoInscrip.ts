import {    useContext } from "react";
import { RutasProtegidasContext } from "../contexto/protectRutas"; 
//Sericios ---------------------------------------------------
import { listadoInscripciones, anularInscripcion } from "../servicio/inscripciones.fetch";
import { listadoTipoCuentas } from "../servicio/caja.fetch";

// Logica -----------------------------------------------------
import { listaInscripcionLogica } from "../hooks/Inscripciones/listadoInscrip";

import {  type InputsPropsBuscador } from "../componentes/generales/Buscadores/Buscador"

// inputs para el buscador por ahora etsan en seteo no son los ioriginales

const inputsFiltro: InputsPropsBuscador[] = [
  {
    name: "dni_alumno",
    label: "Dni del alumno ",
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
    usuario    : rol?.usuario || "Usuario",

    servicios :{
      listado : listadoInscripciones,  
      anulacion : anularInscripcion,
      listadoCuentas : listadoTipoCuentas
    },
    
    inputsFiltros : inputsFiltro,

    estados: ["activos",  "todos", "vencidos", "suspendido"], 

    inicialFiltros : {
        dni_alumno: "",
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