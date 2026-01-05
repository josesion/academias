// iudEntidadTransaction.ts
import pool from '../bd';  // tu conexión pool de MySQL
import { TipadoData } from "../tipados/tipado.data";


/**
 * Ejecuta una función callback dentro de una transacción de MySQL.
 *
 * Este helper se encarga de:
 * 1️⃣ Obtener una conexión del pool.
 * 2️⃣ Iniciar una transacción.
 * 3️⃣ Ejecutar la función callback pasando la conexión.
 * 4️⃣ Hacer commit si todo sale bien, o rollback si ocurre un error.
 * 5️⃣ Liberar la conexión al final.
 *
 * @template T - Tipo de datos que devuelve la función callback.
 * 
 * @param {function(conn: any): Promise<T>} callback - Función que recibe la conexión y ejecuta operaciones sobre la base de datos.
 *                                                    Debe retornar una promesa con los datos que quieras devolver al final de la transacción.
 * 
 * @returns {Promise<TipadoData<T>>} - Resultado de la transacción envuelto en TipadoData:
 *    - error: boolean -> indica si hubo un error en la transacción.
 *    - message: string -> mensaje descriptivo de éxito o error.
 *    - data: T -> los datos retornados por la callback si la transacción fue exitosa.
 *    - code: string -> código de estado interno ("TRANSACCION_OK" o "TRANSACCION_FALLIDA").
 *
 * @example
 * // Ejemplo de uso:
 * const resultado = await iudEntidadTransaction(async (conn) => {
 *   const [res] = await conn.execute("INSERT INTO usuarios (nombre) VALUES (?)", ["Juan"]);
 *   return { id_usuario: (res as any).insertId };
 * });
 *
 * if (!resultado.error) {
 *   console.log("ID generado:", resultado.data.id_usuario);
 * }
 */

export const iudEntidadTransaction = async <T>(
  callback: (conn: any) => Promise<T>
): Promise<TipadoData<T>> => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const result = await callback(conn);

    await conn.commit();
    conn.release();

    return {
      error: false,
      message: "Transacción ejecutada con éxito",
      data: result,
      code: "TRANSACCION_OK"
    };
  } catch (error: any) {
    await conn.rollback();
    conn.release();

    return {
      error: true,
      message: error.message || "Error en transacción",
      code: "TRANSACCION_FALLIDA"
    };
  }
};


/*
Ejemplo de uso de iudEntidadTransaction:

import { iudEntidadTransaction } from "../hooks/iudEntidadTransaction";

// Supongamos que tenemos estas variables del frontend
const idEscuela = 107;
const dniAlumno = 40567890;
const idInscripcion = 25;
const idHorarioClase = 12;
const estadoAsistencia = "presente";

(async () => {
  const resultado = await iudEntidadTransaction(async (conn) => {
    // 1️⃣ Insertar la asistencia
    const [resAsistencia] = await conn.execute(
      `INSERT INTO asistencias 
        (id_escuela, dni_alumno, id_inscripcion, id_horario_clase, fecha, estado)
       VALUES (?, ?, ?, ?, CURDATE(), ?)`,
      [idEscuela, dniAlumno, idInscripcion, idHorarioClase, estadoAsistencia]
    );

    // 2️⃣ Calcular cuántas clases le quedan al alumno
    const [resClases] = await conn.execute(
      `SELECT (i.clases_asignadas_inscritas * i.meses_asignados_inscritos) 
              - COUNT(a.id_asistencia) AS clases_restantes
       FROM inscripciones i
       LEFT JOIN asistencias a
         ON a.id_inscripcion = i.id_inscripcion AND a.estado = 'presente'
       WHERE i.id_inscripcion = ?
       GROUP BY i.id_inscripcion`,
      [idInscripcion]
    );

    const clasesRestantes = (resClases as any)[0]?.clases_restantes ?? 0;

    // 3️⃣ Si se acabaron las clases, marcar la inscripción como vencida
    if (clasesRestantes <= 0) {
      await conn.execute(
        `UPDATE inscripciones 
         SET estado = 'vencidos'
         WHERE id_inscripcion = ?`,
        [idInscripcion]
      );
    }

    // Retornar datos útiles
    return {
      idAsistencia: (resAsistencia as any).insertId,
      clasesRestantes
    };
  });

  if (!resultado.error) {
    console.log("Asistencia registrada con éxito:", resultado.data);
  } else {
    console.error("Error al registrar asistencia:", resultado.message);
  }
})();
*/
