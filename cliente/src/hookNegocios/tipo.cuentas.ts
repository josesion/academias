import { useContext } from "react";

//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";

//Seccion de tipado-----------------------------------------
import type { InputsPropsBuscador } from "../componentes/Buscadores/Buscador";
import type { InputsPropsFormulario } from "../componentes/Formulario/Formulario";
import type { DataTipoCuentas } from "../tipadosTs/tipo.cuents";

//Seccion de servicios--------------------------------------
import { altaTipoCuenta, estadoTipoCuenta, modTipoCuenta, listaTipoCuentas} from "../servicio/tipo.cuentas";
import { useAbmGenerico } from "../hooks/useAbmGenerico";

// Datos para el filtro de busqueda
const inputsFiltro : InputsPropsBuscador[] = [

     {
        name        : "nombre_cuenta",
        label       : "Ingresar Tipo Cuenta",
        type        : "text", 
        placeholder : "Ingrese Tipo Cuenta",
        value       : "",
    } ,  
    {
        name: "tipo_cuenta", 
        label: "Tipo",
        type: "text",
        options: ["todos", "fisico", "virtual"],
    } 
];

const inputsCategoriaCaja : InputsPropsFormulario[] = [

     {
        name        : "nombre_cuenta",
        label       : "Ingresar Tipo Cuenta",
        type        : "text",
        placeholder : "Ingrese Tipo Cuenta",
        value       : "",
        readonly    : false,
    }, 

    {
        name        : "tipo_cuenta",
        label       : "Ingresar Tipo Cuenta",
        type        : "text",
        placeholder : "Ingrese Tipo Cuenta",
        value       : "",
        readonly    : true,
    },  
 
   

];

const mapTipoCuenta= ( dataM : any) => ({
    id_cuenta :  dataM.id_cuenta,
    nombre_cuenta : dataM.nombre_cuenta,
    tipo_cuenta : dataM.tipo_cuenta
});

const mapEstadoTipoCuenta = ( dataE : any) => ({
    id_cuenta : dataE.id_cuenta,
    estado : dataE.estado 
});

const mapTextoEliminar = (dataE: any) => ` El estado Tipo Cuenta : ${dataE.id_cuenta} cambiara`;

export const setAbmTipoCuentas = () => {
  
    const { rol } = useContext( RutasProtegidasContext );   

    const config = {
        recursoSingular : "Tipos Cuenta", 
        
        idEscuela: rol?.escuela || 1 ,  

        servicios : {
            registro : altaTipoCuenta,
            modificar : modTipoCuenta,
            eliminar  : estadoTipoCuenta,
            listado   : listaTipoCuentas
        },        

        inputsFormulario : inputsCategoriaCaja,
        inputsFiltro : inputsFiltro,
        
        estados: ["activos", "inactivos"],

        paginacion : { 
            pagina : 1,
            limite : 6,
            contadorPagina : 0
        },
        
        inicialFormData : {
            nombre_cuenta  : "",
            tipo_cuenta   : "fisico"
        },   
        
        inicialFiltros : {
            nombre_cuenta : "",
            tipo_cuenta   : "todos"
        },        

        mapDeFormulario : mapTipoCuenta, 
        mapDataEliminar : mapEstadoTipoCuenta, 
        mapTextoEliminar: mapTextoEliminar,         
    };

     return useAbmGenerico<DataTipoCuentas>(config); 
};