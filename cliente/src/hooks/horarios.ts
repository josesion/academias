import { useState , useEffect} from "react";

import { peticiones } from "./peticiones";
import { generarRangoUnaHora } from "./setHora";
import { fechaHoy } from "./fecha"; 
import { mensajeErrorTemporal } from "./mensajeTemporales";

/**
 * @typedef {function(data: any, signal?: AbortSignal): Promise<any>} ServicioCrud
 * Define el contrato para las funciones de servicio CRUD (asíncronas).
 */
type ServicioCrud = (data: any, signal?: AbortSignal) => Promise<any>;
import type * as TipadoHorario from "../tipadosTs/horario";
import { type ClaseHorario  } from "../componentes/ClasesAsignadas/ClasesAsiganadas";
import { type MensajeCelda } from "../componentes/CeldaVacia/CeldaVacia";
import { type ResultHoras } from "./setHora";
import { set } from "zod";



interface HorarioConfig {
    idEscuela : number,

    servicios : {
        listadoProfesores : ServicioCrud,
        listadoNivel : ServicioCrud,
        listadoTipo : ServicioCrud,
        horarioEscuela : ServicioCrud,
        altaHorario   : ServicioCrud,
        modHorario   : ServicioCrud,
        eliminarHorario : ServicioCrud,
        HORARIOS  :  TipadoHorario.Horas[], 
        DIAS_SEMANA : TipadoHorario.DiaSemana[],

    },
    inicialFiltroProfesor : { dni : string },
    inicialFiltroNivel : { nivel : string },
    inicialFiltroTipo : { tipo : string },

};


export const useHorarioHook = ( config : HorarioConfig ) =>{

    const [errorGenericoHorario , setErrorGenerico] =  useState< string | null >("Completar los campos Profesor , Nivel y Tipo");
    const [listoEnviar , setListoEnviar]  = useState<boolean>(false);
    const [actualizar , setActualizar]  = useState<boolean>(false);
    const [carga , setCarga] = useState<boolean>(true);

    const [ modalInterno , setModalInterno ] = useState<boolean>(false);
    const [ metodo , setMetodo] = useState<TipadoHorario.metodo | null>(null);
// ──────────────────────────────────────────────────────────────
// Seccion para el filtrado de Profesores , Tipos y Niveles
// ──────────────────────────────────────────────────────────────  
    const [profesores , setProfesores] = useState<TipadoHorario.DataProfesor | null>(null);
    const [listaProfe , setListaProfe ] = useState<TipadoHorario.DataProfesor[]>([]);
   
    const [niveles , setNiveles ] = useState<TipadoHorario.DataNivel | null>( null);
    const [listaNiveles , setListaNiveles ] = useState<TipadoHorario.DataNivel[]>([]);

    const [tipo , setTipo ] = useState<TipadoHorario.DataTipo | null>( null);
    const [listaTipo , setListaTipo ] = useState<TipadoHorario.DataTipo[]>([]);

// ──────────────────────────────────────────────────────────────
//  Estados q usa el  Calendarrio
// ──────────────────────────────────────────────────────────────  
    const horarios : TipadoHorario.Horas[] = config.servicios.HORARIOS;
    const diasSemana : TipadoHorario.DiaSemana[] = config.servicios.DIAS_SEMANA;
    const [calendario , setCalendario] = useState<TipadoHorario.ClaseHorarioData[]>();
   
// ──────────────────────────────────────────────────────────────
// Estados para la Tarjeta que muestra la ingo del nuevo horaro
// ──────────────────────────────────────────────────────────────  
    const [ horaInicioFin , setHoraInicioFin] = useState<ResultHoras | null >(null);
    const [ diaHorario , setDiaHorario] = useState<TipadoHorario.DiaSemana | null >(null);
    
// ──────────────────────────────────────────────────────────────
// Estados el alta del Horario
// ──────────────────────────────────────────────────────────────  
    const [dataFormHorario , setDataFormHorario] = useState<TipadoHorario.DataHorario >({ 
            id_escuela : config.idEscuela,
            dni_profesor : null,
            id_nivel :  null,
            id_tipo_clase  :  null,
            hora_inicio : null,
            hora_fin   : null,
            dia_semana : null,
            fecha_creacion : fechaHoy(),
            estado : "activos"
    });

    const [ dataModHorario, setDataModHorario] = useState<TipadoHorario.ModHorario>({
        id_escuela : config.idEscuela,
        dni_profesor : null,
        id_nivel     : null,
        id_tipo_clase: null,
        id           : null
    });

    const [dataEliminarHorario , setDataEliminarHorario] =useState<TipadoHorario.EliminarHorario>({
        id_escuela : config.idEscuela,
        id : null,
        estado : "inactivos",
        vigente : false
    });

    const [conjuntoIDHorario  , setConjuntoIDHorario ] = useState<TipadoHorario.ConjuntoIDHorario >({
        dni_profe : null ,
        id_tipo_clase  : null,
        id_nivel  : null,
        id_horario : null
    }); 
    

// ──────────────────────────────────────────────────────────────
//Reseteo de los estados luego de Atla y modificacion
// ────────────────────────────────────────────────────────────── 

const resetFormulario = () => {
  // Selectores
  setProfesores(null);
  setTipo(null);
  setNiveles(null);

  // Calendario / tarjeta
  setHoraInicioFin(null);
  setDiaHorario(null);

  // Estados de datos
  setConjuntoIDHorario({
        dni_profe : null ,
        id_tipo_clase  : null,
        id_nivel  : null,
        id_horario : null
    });
  setDataFormHorario({ 
        id_escuela : config.idEscuela,
        dni_profesor : null,
        id_nivel :  null,
        id_tipo_clase  :  null,
        hora_inicio : null,
        hora_fin   : null,
        dia_semana : null,
        fecha_creacion : fechaHoy(),
        estado : "activos"
    });
  setDataModHorario({
        id_escuela : config.idEscuela,
        dni_profesor : null,
        id_nivel     : null,
        id_tipo_clase: null,
        id           : null
    });
  setDataEliminarHorario({
        id_escuela : config.idEscuela,
        id : null,
        estado : "inactivos",
        vigente : false
    }); 
    

  // Filtros de búsqueda
  setFiltroBusquedaProfesor(prev => ({ ...prev, dni: "" }));
  setFiltroBusquedaNivel(prev => ({ ...prev, nivel: "" }));
  setFiltroBusquedaTipo(prev => ({ ...prev, tipo: "" }));

  // Mensaje base
  setErrorGenerico("Completar los campos Profesor , Nivel y Tipo");

  // Estado de envío
  setListoEnviar(false);
};


// ──────────────────────────────────────────────────────────────
// Estados de Filtros en general 
// ──────────────────────────────────────────────────────────────  
    const [filtroCalendario , setFiltroCalendario] = useState<TipadoHorario.Calendario >({
        estado : "activos",
        id_escuela : config.idEscuela
    });


    const [filtroBusquedaProfesor , setFiltroBusquedaProfesor] = useState<TipadoHorario.FiltroProfesor>({
        ...config.inicialFiltroProfesor ,
        estado : "activos" ,
        id_escuela : config.idEscuela
    });
    const [filtroBusquedaNivel , setFiltroBusquedaNivel] = useState<TipadoHorario.FiltroNivel>({
        ...config.inicialFiltroNivel,
        estado : "activos",
        id_escuela : config.idEscuela,
    });
    const [ filtroBusquedaTipo , setFiltroBusquedaTipo ] = useState<TipadoHorario.FiltroTipo>({
        ...config.inicialFiltroTipo,
        estado : "activos",
        id_escuela : config.idEscuela,
    });

// ──────────────────────────────────────────────────────────────
// Funciones Handle para la Seccion de Horarios de las escuelas
// ──────────────────────────────────────────────────────────────  

    const handleCachearProfesores = ( e: React.ChangeEvent<HTMLInputElement> ) =>{

       setFiltroBusquedaProfesor({
            ...filtroBusquedaProfesor,
            [ e.target.name ] : e.target.value
       });
       const dniProfesor = e.target.value;
       const profeSeleccionado = listaProfe.find( profe => profe.Dni === dniProfesor);
       if( profeSeleccionado ){
            setProfesores( profeSeleccionado );
            setConjuntoIDHorario( prev => ({...prev , dni_profe : profeSeleccionado.Dni}));
            setDataFormHorario({
                ...dataFormHorario,
                dni_profesor : profeSeleccionado.Dni
            });

           // seteo para la modificacion del horario     
           setDataModHorario({
                ...dataModHorario,
                dni_profesor : profeSeleccionado.Dni
           }); 

       } else {
            setProfesores( null );
            setConjuntoIDHorario({
                ...conjuntoIDHorario,
                dni_profe : null
            });     
            setDataFormHorario({
                ...dataFormHorario,
                dni_profesor : null
            });     
            
            setDataModHorario({
                ...dataModHorario,
                dni_profesor : null
            });
       }
    };


    const handleCachearNiveles = ( e: React.ChangeEvent<HTMLInputElement> ) =>{
        setFiltroBusquedaNivel({
             ...filtroBusquedaNivel,
             [ e.target.name ] : e.target.value 
        });
        const nivelSeleccionado = listaNiveles.find( nivel => nivel.nivel === e.target.value);
        console.log(nivelSeleccionado)
        if( nivelSeleccionado ){
             setNiveles( nivelSeleccionado );
             setConjuntoIDHorario( prev => ({...prev, id_nivel : nivelSeleccionado.id}));     
             setDataFormHorario({
                ...dataFormHorario,
                id_nivel : nivelSeleccionado.id
             });   
             
             setDataModHorario({
                ...dataModHorario,
                id_nivel : nivelSeleccionado.id
             });
             
        } else {
            setNiveles( null );
            setConjuntoIDHorario({
                ...conjuntoIDHorario,
                id_nivel  : null
            });  
            setDataFormHorario({
                ...dataFormHorario,
                id_nivel : null
             });
            setDataModHorario({
                ...dataModHorario,
                id_nivel : null
            });              
        };
    };
    
   const handleCachearTipos = (e :  React.ChangeEvent<HTMLInputElement> ) =>{
        setFiltroBusquedaTipo({
            ...filtroBusquedaTipo,
            [ e.target.name ] : e.target.value  
         });
         
         const tipoSeleccionado = listaTipo.find( tipo => tipo.tipo === e.target.value);   
         if( tipoSeleccionado ){
            setTipo( tipoSeleccionado );
            setConjuntoIDHorario( prev => ({...prev , id_tipo_clase : tipoSeleccionado.id}));
            setDataFormHorario({
                ...dataFormHorario,
                id_tipo_clase : tipoSeleccionado.id
            }); 
            setDataModHorario({
                ...dataModHorario,
                id_tipo_clase : tipoSeleccionado.id
            });

         } else {
            setTipo( null );
            setConjuntoIDHorario({
                ...conjuntoIDHorario,
                id_tipo_clase  : null
            }); 
            setDataFormHorario({
                ...dataFormHorario,
                id_tipo_clase : null
            }); 
            setDataModHorario({
                ...dataModHorario,
                id_tipo_clase : null
            });            
         };      
   };

// ──────────────────────────────────────────────────────────────
// Handles para abrir formulario de horarios y cerrarlos
// ────────────────────────────────────────────────────────────── 

   const handleAbrirModificarHorario = ( clase : ClaseHorario) =>{
        setModalInterno(true);
        setMetodo("MOD");
        setTipo({id: clase.id_clase ,tipo : clase.tipo_clase});
        setNiveles({id : clase.id_nivel , nivel : clase.nivel});
        setProfesores({Dni : clase.dni_profe, Apellido : clase.profesor , Nombre : clase.nombre });
        setHoraInicioFin({ hora_inicio : clase.hora_inicio as TipadoHorario.Horas , 
                            hora_fin : clase.hora_fin as TipadoHorario.Horas });
        setDiaHorario(clase.dia);    
        setDataModHorario({
            ... dataModHorario,
                id : clase.id_horario,
                dni_profesor : clase.dni_profe,
                id_nivel     : clase.id_nivel,
                id_tipo_clase: clase.id_clase 
        });
        setDataEliminarHorario({
            ...dataEliminarHorario, id : clase.id_horario
        });
   };

   const handleAbirModalHoarios = ( mensaje : MensajeCelda) =>{
        
        if (mensaje.mensaje === "Disponible"){
           const {hora_fin , hora_inicio} = generarRangoUnaHora(mensaje.hora);
           setModalInterno(true)
           setHoraInicioFin(generarRangoUnaHora(mensaje.hora));
           setDiaHorario( mensaje.dia )
           setMetodo("ALTA");
           setDataFormHorario({
            ...dataFormHorario,
            dia_semana : mensaje.dia,
            hora_inicio : hora_inicio,
            hora_fin    : hora_fin
           });
        };   
   };
   
   const handleCerrarModalHoarios =  () =>{
        setModalInterno(false);
        setProfesores(null);
        setTipo(null);
        setNiveles(null);
        setConjuntoIDHorario({
            dni_profe : null,
            id_tipo_clase  : null,
            id_nivel  : null,
            id_horario : null
        });
   };    
   
// ──────────────────────────────────────────────────────────────
// Handles de supcripciones Alta, Modificacion y Eliminar Horarios
// ──────────────────────────────────────────────────────────────   
   const handleAltaHorario = async() =>{
        if (!listoEnviar){
            const mensajeBase = errorGenericoHorario as string;
            return    mensajeErrorTemporal({ 
                        tiempo : 3 ,
                        mensajeError:"Faltan campos verificar",
                        mensajeEspera: mensajeBase , 
                        setErrorGenerico});
        };

        const servicioApiFetch =   config.servicios.altaHorario;
        const resultadoAlta  = await servicioApiFetch(dataFormHorario);
       // console.log( resultadoAlta )
        if (resultadoAlta.error === true){
            setErrorGenerico(resultadoAlta.message)
           // console.log(resultadoAlta.message)
           return;
        };

        setActualizar(!actualizar);
        resetFormulario();
        setModalInterno(false);

   };

   const handleModHorario =async( ) =>{
    
        if (!listoEnviar){
            const mensajeBase = errorGenericoHorario as string;
            return  mensajeErrorTemporal({ 
                    tiempo : 3 ,
                    mensajeError:"Faltan campos verificar",
                    mensajeEspera: mensajeBase , 
                    setErrorGenerico});
        };
        const servicioApiFetch = config.servicios.modHorario;
        const resultadoMod   = await servicioApiFetch(dataModHorario);
        if ( resultadoMod.error === true){
            setErrorGenerico(resultadoMod.message);
            return;
        }; 
        setActualizar(!actualizar); 
        resetFormulario();
        setModalInterno(false);
 
   }; 
   

   const handleEliminarHorario = async() =>{
        const servicioApiFetch = config.servicios.eliminarHorario;
        const resultadoEliminar = await servicioApiFetch(dataEliminarHorario);
        if (resultadoEliminar.error === true) {
            setErrorGenerico(resultadoEliminar.message);
            return;
        };
        setActualizar(!actualizar);
        resetFormulario();
        setModalInterno(false);
   };


// ──────────────────────────────────────────────────────────────
// Listado de profesores sin paginacion
// ──────────────────────────────────────────────────────────────    
useEffect(()=>{
    const {controlador , signal , timeoutId} = peticiones({
        tiempo : 5,
         setErrorGenerico,
        setCarga
    });

    const listadoProfesoreCompleto = async () => {
        const servicioApiFetch = config.servicios.listadoProfesores;
        try {
            const respuesta = await servicioApiFetch( filtroBusquedaProfesor , signal );
    
            if ( respuesta.error === false ) {
                setListaProfe( respuesta.data );
            };
        }catch(error) {
            setErrorGenerico('Ocurrió un error inesperado al cargar los datos Profesores.');  
        }finally{
            clearTimeout( timeoutId );
            setCarga( false );
        };

    };

    listadoProfesoreCompleto();

    return () => {
        clearTimeout( timeoutId );
        controlador.abort();
    };
}, [filtroBusquedaProfesor] );

// ──────────────────────────────────────────────────────────────
// Listado de niveles sin paginacion
// ──────────────────────────────────────────────────────────────    
useEffect(()=>{

    const {controlador , signal , timeoutId} = peticiones({
        tiempo : 5,
        setErrorGenerico,
        setCarga
    });

    const listadoNivelCompleto = async () => {
        const servicioApiFetch = config.servicios.listadoNivel;
        try {
            const respuesta = await servicioApiFetch( filtroBusquedaNivel , signal );

            if ( respuesta.error === false ) {
                setListaNiveles( respuesta.data );
            };
        }catch(error) {
            setErrorGenerico('Ocurrió un error inesperado al cargar los datos Profesores.');  
        }finally{
            clearTimeout( timeoutId );
            setCarga( false );
        };

    };

    listadoNivelCompleto();

    return () => {
        clearTimeout( timeoutId );
        controlador.abort();
    };
}, [filtroBusquedaNivel] );

// ──────────────────────────────────────────────────────────────
// Listado de Tipos sin paginacion
// ──────────────────────────────────────────────────────────────    
useEffect(()=>{

    const {controlador , signal , timeoutId} = peticiones({
        tiempo : 5,
         setErrorGenerico,
        setCarga
    });

    const listadoTiposCompleto = async () => {
        const servicioApiFetch = config.servicios.listadoTipo;
        try {
            const respuesta = await servicioApiFetch( filtroBusquedaTipo , signal );
        
            if ( respuesta.error === false ) {
                setListaTipo( respuesta.data );
            };
        }catch(error) {
            setErrorGenerico('Ocurrió un error inesperado al cargar los datos Profesores.');  
        }finally{
            clearTimeout( timeoutId );
            setCarga( false );
        };

    };

    listadoTiposCompleto();

    return () => {
        clearTimeout( timeoutId );
        controlador.abort();
    };
}, [filtroBusquedaTipo] );

// ──────────────────────────────────────────────────────────────
// Listado de Calendario sin paginacion
// ──────────────────────────────────────────────────────────────  
useEffect( ()=>{
    const {controlador , signal , timeoutId} = peticiones({
        tiempo : 5,
        setErrorGenerico,
        setCarga
    });
    const calendario = async() =>{
        try{
            const servicioApiFetch = config.servicios.horarioEscuela;
            const listadoCalendario = await servicioApiFetch( filtroCalendario, signal )
            
            if (listadoCalendario.error === false) {
                setCalendario(listadoCalendario.data);
            };
        }catch(error){
            console.error('Ocurrió un error inesperado al cargar los datos del Calendario.')
        }finally{
            clearTimeout( timeoutId );
            setCarga( false );
        }
    };
  
    calendario();

    return () => {
        clearTimeout( timeoutId );
        controlador.abort();
    };

},[actualizar]);
// ──────────────────────────────────────────────────────────────
// Para manejar el estado q el cliente
// ──────────────────────────────────────────────────────────────  
useEffect(() => {


  if (metodo === "MOD") {
    setErrorGenerico("Puede modificar los datos o guardar");
    setListoEnviar(true);
    return;
  }


  if (
    !conjuntoIDHorario.dni_profe ||
    !conjuntoIDHorario.id_tipo_clase ||
    !conjuntoIDHorario.id_nivel
  ) {
    const faltantes: string[] = [];

    if (!conjuntoIDHorario.dni_profe) faltantes.push("Profesor");
    if (!conjuntoIDHorario.id_nivel) faltantes.push("Nivel");
    if (!conjuntoIDHorario.id_tipo_clase) faltantes.push("Tipo");

    setErrorGenerico(
      `Falta seleccionar: ${faltantes.join(" , ")}`
    );
    setListoEnviar(false);
  } else {
    setErrorGenerico("Listo para Guardar");
    setListoEnviar(true);
  }

}, [conjuntoIDHorario, metodo]);



return {
    profesores,
    niveles,
    tipo,

    metodo,

    listaProfe,
    listaNiveles,
    listaTipo,
    calendario,
    
    horarios, diasSemana, horaInicioFin, diaHorario,


    handleCachearProfesores,
    handleCachearNiveles,
    handleCachearTipos,

    handleModHorario,
    handleAbirModalHoarios,
    handleAbrirModificarHorario,
    handleCerrarModalHoarios,
    handleAltaHorario,
    handleEliminarHorario,

    modalInterno,
    errorGenericoHorario
};

};