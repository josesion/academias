
//------------------------------------------------------------------------//
import { useContext } from "react";

//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";

//Seccion de servicios--------------------------------------
import { useInscipcion } from "../hooks/inscripcion";
import { listadoAlumnos , listadoAlumnoSinPag } from "../servicio/alumnos.fetch";
import { listadoPlanesUsuarios , listadoPlaneSinPag} from "../servicio/planes.usuarios";
import { incripcion } from "../servicio/inscripciones.fetch";
import { registrarMovimientoCaja, obtenerIdCaja } from "../servicio/caja.fetch";
import { buscarInscripcionCategoria } from "../servicio/categoria.caja.fetch";


export const useIncripcionesUsuarios = () =>{
    const { rol } = useContext( RutasProtegidasContext );

    const config = {
        idEscuela: rol?.escuela || 1 ,
      
        servicios : {
            listaAlumnosPaginado : listadoAlumnos,
            listaPlanPaginado    : listadoPlanesUsuarios,
            listadoAlumnosBusqueda : listadoAlumnoSinPag,
            listadoPlanesBusqueda  : listadoPlaneSinPag,

            metodoInscripcion     : incripcion,
            registroMovimiento    : registrarMovimientoCaja,
            inscripcionCategoriaCaja : buscarInscripcionCategoria,
            obtenerIdCaja :  obtenerIdCaja, 
        },

        paginacion : { 
            pagina : 1,
            limite : 10,
            contadorPagina : 0
        },


        inicialFiltroAlumno : {
            dni      : "",
            apellido : ""
        }, 
        
        inicialFiltroPlan : {
            descripcion      : ""
        }, 

    };

return useInscipcion(config)

};