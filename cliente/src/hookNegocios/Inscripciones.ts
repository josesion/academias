const data = [
  { id: 1,  plan: "Plan Clásico",        monto: 12000, clases: 8,  meses: 3 },
  { id: 2,  plan: "Plan Premium",        monto: 18000, clases: 12, meses: 1 },
  { id: 3,  plan: "Plan Familiar",       monto: 35000, clases: 20, meses: 1 },
  { id: 4,  plan: "Plan Empresarial",    monto: 90000, clases: 60, meses: 1 },
  { id: 5,  plan: "Plan Avanzado",       monto: 22000, clases: 16, meses: 1 },
  { id: 6,  plan: "Plan Básico Plus",    monto: 15000, clases: 10, meses: 1 },
  { id: 7,  plan: "Plan Profesional",    monto: 28000, clases: 18, meses: 1 },
  { id: 8,  plan: "Plan Full",           monto: 32000, clases: 20, meses: 1 },
  { id: 9,  plan: "Plan Ultra",          monto: 38000, clases: 24, meses: 1 },
  { id: 10, plan: "Plan Oro",            monto: 45000, clases: 30, meses: 1 },
  { id: 11, plan: "Plan Plata",          monto: 30000, clases: 18, meses: 1 },
  { id: 12, plan: "Plan Bronce",         monto: 20000, clases: 12, meses: 1 },
  { id: 13, plan: "Plan Starter",        monto: 10000, clases: 6,  meses: 1 },
  { id: 14, plan: "Plan Flexible",       monto: 16000, clases: 8,  meses: 1 },
  { id: 15, plan: "Plan Limitado",       monto: 12000, clases: 6,  meses: 1 },
  { id: 16, plan: "Plan Ilimitado",      monto: 65000, clases: 0,  meses: 1 }, // 0 = ilimitado
  { id: 17, plan: "Plan Corporativo",    monto: 120000, clases: 80, meses: 1 },
  { id: 18, plan: "Plan Estudiantil",    monto: 8000,  clases: 6,  meses: 1 },
  { id: 19, plan: "Plan Senior",         monto: 9000,  clases: 8,  meses: 1 },
  { id: 20, plan: "Plan Especial",       monto: 25000, clases: 10, meses: 1 }
];


//------------------------------------------------------------------------//
import { useContext } from "react";

//Seccion de contexto---------------------------------------
import { RutasProtegidasContext } from "../contexto/protectRutas";

//Seccion de servicios--------------------------------------
import { useInscipcion } from "../hooks/inscripcion";
import { listadoAlumnos } from "../servicio/alumnos.fetch";
import { listadoPlanesUsuarios } from "../servicio/planes.usuarios";


export const useIncripcionesUsuarios = () =>{
    const { rol } = useContext( RutasProtegidasContext );

    const config = {
        idEscuela: rol?.escuela || 1 ,

        servicios : {
            listaPlanes : data,

            listaAlumnosPaginado : listadoAlumnos,
            listaPlanPaginado    : listadoPlanesUsuarios
        },

        paginacion : { 
            pagina : 1,
            limite : 20,
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