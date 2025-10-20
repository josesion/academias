// =================================================================================
// PlanServiceCode: Códigos de Respuesta
// =================================================================================
// Utilizado para estandarizar las respuestas de la API, indicando el resultado
// específico de una operación (éxito, fallo, o estado particular).
export enum PlanServioCode {
    // Éxito y Estados Esperados
    PLAN_ALREADY_EXISTS = "PLAN_EXISTE",           // El plan maestro ya existe (al crear)
    PLAN_ESCHOOL_ALREADY_EXISTS = "PLANESCUELA_EXISTE", // La asignación escuela-plan ya existe
    PLAN_FOUND = "PLAN_ENCONTRADO",                // Búsqueda de plan exitosa
    PLAN_CREATED = "PLANES_CREAR",                 // Creación de plan maestro exitosa
    PLAN_ESCHOOL_CREATED = "PLANESCUELA_CREAR",    // Creación de asignación escuela-plan exitosa
    
    // Fallos (Errores específicos, además de los errores de cliente/BD)
    PLAN_NOT_FOUND = "PLAN_NO_ENCONTRADO",         // El plan maestro no fue encontrado
    CREATION_FAILED = "CREATION_FALLO",            // Fallo genérico en la creación

    // Operación de Usuario/Asignación
    USER_PLAN_UPDATE = "PLANUSUARIO_MODIFICAR"     // Éxito al actualizar el plan de un usuario
}

// =================================================================================
// Definiciones de Tipos Base y Auxiliares
// =================================================================================

// Tipo auxiliar para asegurar consistencia en el formato de fecha de alta.
type Fecha_Alta_Formato = string;

// Interfaz base que define los atributos de un Plan (ya sea maestro o personalizado).
interface PlanesUsuariosBase {
    descripcion : string,
    cantidad_clases : number, 
    cantidad_meses : number, 
    monto : number,
}

// Interfaz que define la estructura de datos al momento de asignar un Plan a una Escuela.
interface PlanesEscuelasUsuarios{
    id_escuela : number,
    id_plan : number,
    cantidad_clases : number, 
    cantidad_meses : number, 
    monto : number,
    fecha_creacion : Fecha_Alta_Formato 
}

// =================================================================================
// Tipos de Request (Entrada de Datos)
// =================================================================================

// Interfaz para la creación o definición de un nuevo Plan Maestro.
export interface CrearPlanesUsuarios extends PlanesUsuariosBase {
    id? : number // Opcional, puede ser autogenerado por la BD
}

// Interfaz para la creación de una nueva asignación de Plan a Escuela (plan_en_escuela).
export interface CrearPlanesEscuelasUsuarios extends PlanesEscuelasUsuarios {}

// =================================================================================
// Tipos de Response (Salida de Datos)
// =================================================================================

// Resultado de una búsqueda simple de planes (ej. para un selector o listado maestro).
export interface ResultBusquedaPlanes {
    descripcion_plan : string,
    id_plan : number
}

// Interfaz para cambiar el estado de un plan en una escuela (activar/inactivar).
export interface estadoPlanesUsuarios {
    estado : string, // 'activos' o 'inactivos'
    id_escuela : number,
    id_plan : number
}

// Resultado esperado después de una modificación exitosa de un plan en la escuela.
export interface ModPlanesUsuariosResult {
    nombre_personalizado : string,
    fecha_creacion : Fecha_Alta_Formato,
    id_escuela : number,
    id_plan : number,
}

// Estructura de datos para el listado paginado de planes ofrecidos por una escuela.
// Coincide con el SELECT SQL del ejemplo anterior (monto renombrado a monto aquí).
export interface ResulListadoPlanesUsuarios {
    id : number, // Corresponde a id_plan
    descripcion : string, // Corresponde a nombre_personalizado (o el maestro si es NULL)
    clases : number, // Corresponde a clases_asignadas
    meses : number, // Corresponde a meses_asignados
    monto : number, // Corresponde a monto_asignado (Nota: corregido de 'montyo')
    total_registros : number // Para la paginación
}