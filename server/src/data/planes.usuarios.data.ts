
// Seccion de Hooks
import { tryCatchDatos } from "../utils/tryCatchBD";
import { iudEntidad } from "../hooks/iudEntidad";
import { listarEntidad } from "../hooks/funcionListar";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";

//Seccion Typados
import { TipadoData } from "../tipados/tipado.data";
import { PlanesPagoInputs , 
         PlanesEscuelasInputs, 
         ModPlanesUsuariosInputs,
         ListaPlanesUsuariosInputs
        } from "../squemas/planes.usuarios";

import { CrearPlanesUsuarios, CrearPlanesEscuelasUsuarios,
         ResultBusquedaPlanes, ModPlanesUsuariosResult, 
         estadoPlanesUsuarios, ResulListadoPlanesUsuarios
        } from "../tipados/planes.usuarios"  ;






const existenciaPlan = async( descripcion : string ) =>{
    const sql   = ` select 
                            planes_pago.id_plan  
                    from 
                            planes_pago 
                    where 
	                        planes_pago.descripcion_plan = ? ;`;
    const valor = [descripcion];
   
    return await buscarExistenteEntidad<ResultBusquedaPlanes>({
        slqEntidad : sql ,
        valores    : valor,
        entidad    : "Plan",
    });
   
}

const existenciaPlanEscuela = async( id_escuela : number , id_plan : number ) 
 : Promise<TipadoData<ResultBusquedaPlanes>>=>{
    const sql : string  =`select 	id_plan as plan,
		                  id_escuela as escuela	
                from 
		                 planes_en_escuela
                where
		                 planes_en_escuela.id_escuela = ? 
                and
                         planes_en_escuela.id_plan  = ? ;`;

    const valor : unknown[]= [id_escuela , id_plan];

    return await buscarExistenteEntidad({
        slqEntidad : sql ,
        valores    : valor,
        entidad    : "PlanEscuela",
    });

}


const altaPlanes_usuariosData = async( planes : PlanesPagoInputs) 
 : Promise<TipadoData<CrearPlanesUsuarios>> =>{
    const {descripcion , cantidad_clases ,cantidad_meses , estado , monto} = planes ;
    const sql: string  = `INSERT INTO planes_pago (descripcion_plan, cantidad_clases, cantidad_meses, monto, estado) VALUES
                ( ? , ? , ? , ? , ? )` ;
    const valores : unknown[]  = [descripcion, cantidad_clases , cantidad_meses, monto , estado];  

    const datosADevolver  = { descripcion , cantidad_clases , cantidad_meses, monto };
    
    return await iudEntidad<CrearPlanesUsuarios>({
        slqEntidad : sql ,
        valores    : valores,
        entidad    :"Planes",
        metodo     : "CREAR",
        datosRetorno : datosADevolver
    })
};

const altaPlanesEscuelas = async( planesEscuelas : PlanesEscuelasInputs) 
: Promise<TipadoData<CrearPlanesEscuelasUsuarios>>=>{
    const { id_escuela , id_plan , estado , fecha_creacion, monto , cantidad_clases, cantidad_meses , nombre_personalizado} = planesEscuelas;
    const sql : string = `INSERT INTO planes_en_escuela ( id_escuela,
                                                 id_plan, 
                                                 estado, 
                                                 fecha_creacion,
                                                 nombre_personalizado, 
                                                 monto_asignado,
                                                 clases_asignadas,
                                                 meses_asignados) 
                VALUES
                ( ? , ? , ? , ? , ? , ? , ? , ? )` ;
    const valores = [id_escuela , id_plan , estado , fecha_creacion,nombre_personalizado ,monto , cantidad_clases, cantidad_meses];

    const datosADevolver    = { id_escuela , id_plan , fecha_creacion, nombre_personalizado ,cantidad_clases, cantidad_meses, monto }; 

    return  await iudEntidad<CrearPlanesEscuelasUsuarios>({
        slqEntidad : sql ,
        valores    : valores,
        entidad    : "PlanEscuela",
        metodo     : "CREAR",
        datosRetorno : datosADevolver
    });

};


const modPlanesUsuarios = async( parametros :  ModPlanesUsuariosInputs )
 : Promise<TipadoData<ModPlanesUsuariosResult>> =>{
    const { id_escuela, id_plan , nombre_personalizado, monto , cantidad_clases, cantidad_meses , fecha_creacion, estado } = parametros ;

    const sql  : string = ` UPDATE planes_en_escuela
                            SET
	                            nombre_personalizado = ? ,
	                            monto_asignado      = ? ,      
	                            clases_asignadas    = ? ,      
	                            meses_asignados     = ? ,       
	                            estado              =  ? ,
                                fecha_creacion      = ?      
                            WHERE
	                            planes_en_escuela.id_escuela  =   ?    
                                and
	                            planes_en_escuela.id_plan     =  ? ;  `;
    const valores : unknown[] = [ nombre_personalizado , monto ,cantidad_clases , cantidad_meses, estado , fecha_creacion, id_escuela, id_plan ];

    const datosADevolver    = { id_escuela , id_plan , fecha_creacion, nombre_personalizado }; 

    return await iudEntidad<ModPlanesUsuariosResult>({
        slqEntidad : sql ,
        valores    : valores,
        entidad    : "PlanUsuario",
        metodo     : "MODIFICAR",
        datosRetorno : datosADevolver
    })
    
};

const estadoPlanes_usuarios = async( parametros : estadoPlanesUsuarios )
: Promise<TipadoData<estadoPlanesUsuarios>> =>{
    const { estado , id_escuela, id_plan } = parametros ;
    const accion : "ALTA" | "ELIMINAR"  = estado === 'activos' ? 'ELIMINAR' : 'ALTA' ;
    const sql : string = `UPDATE planes_en_escuela
                            SET
	                            estado  = ?
                            WHERE
	                            planes_en_escuela.id_escuela  = ?    
                            and
	                            planes_en_escuela.id_plan     = ? ; `;
    const valores : unknown[] = [estado , id_escuela, id_plan ];
    const datosADevolver    = { id_escuela , id_plan , estado };

    return await iudEntidad<estadoPlanesUsuarios>({
        slqEntidad : sql ,
        valores    : valores,
        entidad    : "PlanUsuario",
        metodo     : accion,
        datosRetorno : datosADevolver
    });
};


const listadoPlanesUsuarios = async( parametros : ListaPlanesUsuariosInputs,pagina : string ) 
: Promise<TipadoData<ResulListadoPlanesUsuarios[]>> =>{
    const { descripcion , estado , limite , offset , id_escuela } = parametros ;
    const nombreFiltro = `%${descripcion}%`;
// nombrar uno por uno los campos  para q estos se  muestren segun el filtro en el forntend
    const sql : string =    `SELECT 
                           	        id_plan as id,
                                    nombre_personalizado as descripcion,
                                    clases_asignadas as clases,
                                    meses_asignados as meses ,
                                    monto_asignado as monto ,
                                    count(*) over() as total_registros
                            FROM
                                    planes_en_escuela
                            WHERE
                                    nombre_personalizado LIKE ?
                            and 
                                    estado = ? 
                            and 
		                            id_escuela = ?        
                            order by 
	                                nombre_personalizado
                            limit  ${limite}
                            offset ${offset};`;
    const valores : unknown[] = [ nombreFiltro , estado , id_escuela ];

    return await listarEntidad<ResulListadoPlanesUsuarios>({
        slqListado  : sql,
        limit       : limite,
        pagina      : pagina,
        valores     : valores,
        entidad     : "PlanUsuario",
        estado      : estado
    });
                          
};

export const method = {
    existenciaPlan          : tryCatchDatos( existenciaPlan ),
    existenciaPlanEscuela   : tryCatchDatos( existenciaPlanEscuela ),
    altaPlanes_usuariosData : tryCatchDatos( altaPlanes_usuariosData ),
    altaPlanesEscuelas      : tryCatchDatos( altaPlanesEscuelas, "Plan", "masculino" ),
    modPlanesUsuarios       : tryCatchDatos( modPlanesUsuarios ),
    estadoPlanes_usuarios   : tryCatchDatos( estadoPlanes_usuarios ),
    listadoPlanesUsuarios   : tryCatchDatos( listadoPlanesUsuarios )
} 

