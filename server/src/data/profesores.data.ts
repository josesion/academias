// ──────────────────────────────────────────────────────────────
// Sección de Hooks
// ──────────────────────────────────────────────────────────────
import { iudEntidad } from "../hooks/iudEntidad";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { tryCatchDatos } from "../utils/tryCatchBD";
import { listarEntidad } from "../hooks/funcionListar";
import { listarEntidadSinPaginacion } from "../hooks/funcionListarSinPag";
import { iudEntidadTransaction } from "../hooks/iudEntidadTRansaccion";

// ──────────────────────────────────────────────────────────────
// Sección de Tipados
// ──────────────────────────────────────────────────────────────
import { TipadoData } from "../tipados/tipado.data";
import { 
  ProfesorInputs, 
  ProfesorEscuelaInputs, 
  ListadoProfeInputs,
  EstadoProfesorInputs, 
} from "../squemas/profesores";

import { 
  ProfesoresGlobales, 
  FiltroProfeEscuela, 
  FiltroProfeEscuelaBaja, 
  ResulListadoProfesoresUsuarios,
  ListadoProfeResults 
} from "../tipados/profesores.data";

// ──────────────────────────────────────────────────────────────
// Funciones principales
// ──────────────────────────────────────────────────────────────

/**
 * Busca un profesor por su DNI en la tabla `profesores`.
 * @async
 * @param {string} dni - Documento del profesor a buscar.
 * @returns {Promise<TipadoData<ProfesoresGlobales>>} Resultado con el profesor si existe o error si no.
 */
const verProfesor = async (dni: string) => {
  const sql = `
    SELECT dni
    FROM profesores
    WHERE dni = ?;
  `;
  const valores: unknown[] = [dni];

  return await buscarExistenteEntidad<ProfesoresGlobales>({
    slqEntidad: sql,
    valores,
    entidad: "Profesor",
  });
};

/**
 * Da de alta un nuevo profesor global (sin escuela asociada todavía).
 * @async
 * @param {ProfesorInputs} datos - Datos básicos del profesor.
 * @returns {Promise<TipadoData<ProfesoresGlobales>>} Resultado con el nuevo profesor creado.
 */
const altaProfesores = async (
  datos: ProfesorInputs
): Promise<TipadoData<ProfesoresGlobales>> => {
  const { dni, nombre, apellido, celular } = datos;

  const sql = `
    INSERT INTO profesores (dni, nombre, apellido, celular)
    VALUES (?, ?, ?, ?);
  `;

  const valores: unknown[] = [dni, nombre, apellido, celular];
  const datosADevolver = { dni, nombre, apellido, celular };

  return await iudEntidad<ProfesoresGlobales>({
    slqEntidad: sql,
    valores,
    entidad: "Profesores",
    metodo: "ALTA",
    datosRetorno: datosADevolver,
  });
};

/**
 * Verifica si un profesor ya está asociado a una escuela.
 * @async
 * @param {FiltroProfeEscuela} filtro - Contiene `dni` y `id_escuela` del profesor.
 * @returns {Promise<TipadoData<FiltroProfeEscuela>>} Resultado indicando si existe o no la relación.
 */
const verProfesorEscuela = async (
  filtro: FiltroProfeEscuela
): Promise<TipadoData<FiltroProfeEscuela>> => {
  const { dni, id_escuela } = filtro;

  const sql = `
    SELECT dni_profesor AS dni, id_escuela
    FROM profesores_en_escuela
    WHERE dni_profesor = ? AND id_escuela = ?;
  `;

  const valores: unknown[] = [dni, id_escuela];

  return await buscarExistenteEntidad<FiltroProfeEscuela>({
    slqEntidad: sql,
    valores,
    entidad: "ProfesorEscuela",
  });
};

/**
 * Asocia un profesor existente a una escuela.
 * @async
 * @param {ProfesorEscuelaInputs} datos - Datos del profesor y la escuela.
 * @returns {Promise<TipadoData<ProfesorEscuelaInputs>>} Resultado con el registro creado.
 */
const altaProfesoresEscuela = async (datos: ProfesorEscuelaInputs) => {
  const { dni, id_escuela, estado, fecha_creacion, fecha_baja } = datos;

  const sql = `
    INSERT INTO profesores_en_escuela (dni_profesor, id_escuela, fecha_creacion)
    VALUES (?, ?, ?);
  `;

  const valores: unknown[] = [dni, id_escuela, fecha_creacion];
  const datosADevolver = { dni, id_escuela, estado, fecha_creacion, fecha_baja };

  return await iudEntidad<ProfesorEscuelaInputs>({
    slqEntidad: sql,
    valores,
    entidad: "ProfesorEscuela",
    metodo: "ALTA",
    datosRetorno: datosADevolver,
  });
};

/**
 * Modifica los datos personales de un profesor.
 * @async
 * @param {ProfesorInputs} datos - Datos actualizados del profesor.
 * @returns {Promise<TipadoData<ProfesoresGlobales>>} Resultado con los nuevos datos del profesor.
 */
const modProfesores = async (
  datos: ProfesorInputs
): Promise<TipadoData<ProfesoresGlobales>> => {
  const { dni, nombre, apellido, celular } = datos;

  const sql = `
    UPDATE profesores
    SET nombre = ?, apellido = ?, celular = ?
    WHERE dni = ?;
  `;

  const valores: unknown[] = [nombre, apellido, celular, dni];
  const datosADevolver = { dni, nombre, apellido, celular };

  return await iudEntidad<ProfesoresGlobales>({
    slqEntidad: sql,
    valores,
    entidad: "ProfesorEscuela",
    metodo: "MODIFICAR",
    datosRetorno: datosADevolver,
  });
};

/**
 * Cambia el estado de un profesor dentro de una escuela (activos/inactivos).
 * @async
 * @param {FiltroProfeEscuelaBaja} datos - Contiene el `dni`, `id_escuela` y nuevo `estado`.
 * @returns {Promise<TipadoData<FiltroProfeEscuelaBaja>>} Resultado con el cambio aplicado.
 */
const bajaProfesor = async (
  datos: FiltroProfeEscuelaBaja
): Promise<TipadoData<FiltroProfeEscuelaBaja>> => {
  const { dni, id_escuela, estado } = datos;
  const accion: "ALTA" | "ELIMINAR" = estado === "activos" ? "ELIMINAR" : "ALTA";

  const sql = `
    UPDATE profesores_en_escuela
    SET estado = ?
    WHERE id_escuela = ? AND dni_profesor = ?;
  `;

  const valores: unknown[] = [estado, id_escuela, dni];
  const datosADevolver = { dni, id_escuela, estado };

  return await iudEntidad<FiltroProfeEscuelaBaja>({
    slqEntidad: sql,
    valores,
    entidad: "ProfesorEscuela",
    metodo: accion,
    datosRetorno: datosADevolver,
  });
};

/**
 * Lista los profesores asociados a una escuela con filtros y paginación.
 * @async
 * @param {ListadoProfeInputs} datos - Filtros de búsqueda y paginación.
 * @param {string} pagina - Página actual.
 * @returns {Promise<TipadoData<ResulListadoProfesoresUsuarios[]>>} Resultado con datos y metadatos de paginación.
 */
const listadoProfesores = async (datos: ListadoProfeInputs, pagina: string) => {
  const { dni, apellido, estado, id_escuela, limit, offset } = datos;
  const dniFiltro = `%${dni}%`;
  const apellidoFiltro = `%${apellido}%`;
  
  const sql = `
    SELECT 
      p.dni,
      p.nombre,
      p.apellido,
      p.celular,
      COUNT(*) OVER() AS total_registros
    FROM 
      profesores p
    JOIN 
      profesores_en_escuela pe ON p.dni = pe.dni_profesor
    WHERE 
      p.dni LIKE ? 
      AND p.apellido LIKE ? 
      AND pe.estado = ? 
      AND pe.id_escuela = ?
    ORDER BY p.apellido
    LIMIT ${limit}
    OFFSET ${offset};
  `;

  const valores: unknown[] = [dniFiltro, apellidoFiltro, estado, id_escuela];

  return await listarEntidad<ResulListadoProfesoresUsuarios>({
    slqListado: sql,
    limit: limit,
    pagina,
    valores,
    entidad: "ProfesorEscuela",
    estado,
  });
};

/**
 * listaProfesoresSinPaginacion
 * ----------------------------
 * Obtiene un listado de profesores asociados a una escuela específica,
 * sin paginación, aplicando filtros por DNI y estado.
 *
 * La búsqueda:
 *  - Permite filtrar por coincidencia parcial de DNI
 *  - Filtra por el estado del profesor dentro de la escuela
 *  - Limita los resultados a 10 registros
 *
 * Se realiza un JOIN entre:
 *  - profesores
 *  - profesores_en_escuela
 *
 * @async
 *
 * @param {ListadoProfeInputs} datos
 * Objeto de entrada con los criterios de búsqueda.
 *
 * @param {string} datos.dni
 * DNI (o parte del DNI) del profesor a buscar.  
 * Si viene vacío, devuelve todos los profesores.
 *
 * @param {'activos' | 'inactivos' | 'todos'} datos.estado
 * Estado del profesor dentro de la escuela.
 *
 * @param {number} datos.id_escuela
 * Identificador de la escuela sobre la cual se realiza la búsqueda.
 *
 * @returns {Promise<TipadoData<ListadoProfeResults[]>>}
 * Retorna una promesa con:
 *  - `error`: boolean
 *  - `code`: código de operación
 *  - `data`: array de profesores encontrados
 *
 * @throws {Error}
 * Puede lanzar errores relacionados a la base de datos o validaciones.
 */

export const listaProfesoresSinPaginacion = async ( datos: ListadoProfeInputs ) 
: Promise<TipadoData<ListadoProfeResults[]>> => {

  const { dni, estado, id_escuela } = datos;
  const dniFiltro = `%${dni}%`;
  const sql : string = `SELECT 
                          p.dni AS Dni,
                          p.nombre as Nombre,
                          p.apellido as Apellido
                        FROM 
                          profesores p
                        JOIN 
                          profesores_en_escuela pe ON p.dni = pe.dni_profesor
                        WHERE 
                          p.dni LIKE ?  
                          AND pe.estado = ? 
                          AND pe.id_escuela = ?
                        ORDER BY p.apellido
                        LIMIT 10;`;
  const valores : unknown[] = [dniFiltro, estado, id_escuela ];

  return await listarEntidadSinPaginacion<ListadoProfeResults>({
    slqListado : sql,
    valores,
    entidad : "ProfesorEscuela",
    estado
  });

};


/**
 * Da de baja lógica a un profesor en una escuela específica y desactiva todos sus horarios asociados.
 * Utiliza una transacción para asegurar la atomicidad de la operación.
 *
 * @async
 * @function eliminarProfe_Horario
 * @param {EstadoProfesorInputs} data - Objeto con los datos de entrada necesarios.
 * @param {number} data.id_escuela - Identificador único de la escuela.
 * @param {string} data.dni - DNI del profesor a dar de baja.
 * @returns {Promise<TipadoData<{}>>} Retorna un objeto estándar con el estado de la transacción, mensaje y datos resultantes.
 * 
 * @throws {Error} Si el profesor no se encuentra registrado en la escuela o falla la ejecución de la consulta.
 * 
 * @example
 * const respuesta = await eliminarProfe_Horario({
 *     id_escuela: 1,
 *     dni: "35123456"
 * });
 */
const eliminarProfe_Horario = async (data: EstadoProfesorInputs): Promise<TipadoData<{}>> => {
    const { id_escuela, dni } = data;

    const sqlLocalizarHorarios: string = `SELECT 
                                            h.id AS id_horario 
                                        FROM 
                                            profesores_en_escuela p
                                        JOIN 
                                            horarios_clases h ON p.dni_profesor = h.dni_profesor      
                                        WHERE p.id_escuela = ? AND p.dni_profesor = ?;`;
                                             
    const sqlBorrarHorario: string = `UPDATE horarios_clases 
                                      SET estado = 'inactivos', 
                                          vigente = FALSE 
                                      WHERE id = ?;`;

    const sqlBajaProfesor: string = `UPDATE profesores_en_escuela 
                                     SET estado = 'inactivos'
                                     WHERE dni_profesor = ? 
                                       AND id_escuela = ?;`;                            
         
    const resultado = await iudEntidadTransaction(async (conn) => {
        // 1. Buscamos los horarios asociados
        const [rows] = await conn.execute(sqlLocalizarHorarios, [id_escuela, dni]);
        const resHorarios = rows as Array<{ id_horario: number }>;
        
    
        // 2. Desactivamos los horarios solo si existen
        let desactivadosCount = 0;
        if (resHorarios && resHorarios.length > 0) {
            for (const horario of resHorarios) {
                await conn.execute(sqlBorrarHorario, [horario.id_horario]);
                desactivadosCount++;
            }
        }

        // 3. Damos de baja al profesor en la relación con la escuela
        const [resProfesor]: any = await conn.execute(sqlBajaProfesor, [dni, id_escuela]);

        if (resProfesor.affectedRows === 0) {
            throw new Error("No se logró dar de baja al profesor en la escuela");
        } 

        return { 
            message: "Profesor y horarios dados de baja con éxito", 
            desactivados: desactivadosCount 
        };
    });

    if (resultado.error === false) {
        return {
            error: false,
            message: "Profesor y sus horarios dados de baja",
            data: resultado.data,
            code: "TRANSACCION_OK"
        };
    }

    return {
        error: true,
        message: resultado.message || "Error en la transacción",
        code: "TRANSACCION_FALLIDA"
    };    
};



// ──────────────────────────────────────────────────────────────
// Export de métodos con tryCatchDatos
// ──────────────────────────────────────────────────────────────
export const method = {
  verProfesor: tryCatchDatos(verProfesor),
  altaProfesores: tryCatchDatos(altaProfesores),
  verProfesorEscuela: tryCatchDatos(verProfesorEscuela),
  altaProfesoresEscuela: tryCatchDatos(altaProfesoresEscuela),
  modProfesores: tryCatchDatos(modProfesores),
  estadoProfesor: tryCatchDatos(bajaProfesor),
  listadoProfesores: tryCatchDatos(listadoProfesores),
  listaProfesoresSinPaginacion: tryCatchDatos( listaProfesoresSinPaginacion ),
  eliminarProfe_Horario : tryCatchDatos(eliminarProfe_Horario),
};
