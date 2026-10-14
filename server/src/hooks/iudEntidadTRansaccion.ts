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

    // LOG DETALLADO para diagnosticar errores de transacción (FK, deadlock, constraints, etc.)
    console.error("[TRANSACCION_FALLIDA]", {
      message: error.message,
      code: error.code,           // ej: 'ER_NO_REFERENCED_ROW_2'
      errno: error.errno,         // ej: 1452
      sqlState: error.sqlState,   // ej: '23000'
      sqlMessage: error.sqlMessage,
      stack: error.stack
    });

    return {
      error: true,
      message: error.message || "Error en transacción",
      code: "TRANSACCION_FALLIDA",
      // metadata para que el servicio pueda actuar distinto según el error MySQL
      detail: {
        mysqlCode: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage,
        sqlState: error.sqlState
      }
    };
  }
};


