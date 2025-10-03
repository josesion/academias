// src/database/utils.ts

import { PoolConnection , ResultSetHeader, RowDataPacket} from 'mysql2/promise'; // Necesitas el tipo PoolConnection
import pool from '../bd'; // <-- Importa tu pool de conexiones definido en src/database/pool.ts

/**
 * Función que envuelve una operación de base de datos,
 * manejando la obtención y liberación de la conexión del pool.
 * Es crucial para asegurar que las conexiones se liberen correctamente.
 *
 * @param operation Una función asíncrona que recibe una conexión y ejecuta la lógica de DB.
 * @returns El resultado de la operación.
 */
export const withDbConnection = async <T>(
    operation: (connection: PoolConnection) => Promise<T>// con
): Promise<T> => {
  let connection: PoolConnection | undefined; // Declara la conexión aquí
try {
    // 1. OBTENER la conexión del pool
    connection = await pool.getConnection(); 
    // 2. Ejecutar la operación de la base de datos que le pasaste como argumento
    const result = await operation(connection); 
    return result;
} catch (error) {
    // Captura cualquier error que ocurra durante la operación de DB
    console.error('Error durante la operación de base de datos:', error);
    throw error; // Relanza el error para que sea manejado por el servicio o el middleware global
} finally {
    // 3. ¡IMPORTANTE! LIBERAR la conexión de vuelta al pool SIEMPRE
    if (connection) { // Solo si la conexión fue obtenida con éxito
        connection.release(); 
    }
}
};



// Para consultas SELECT (retorna un array de los tipos de filas esperados)
export const select = async <T>(sql: string, params?: any[]): Promise<T[]> => {
    return withDbConnection(async (connection) => {
        // `execute` devuelve un array de dos partes: `[rows, fields]`
        // `const [rows]` extrae solo las filas (que son un array de objetos)
        const [rows] = await connection.execute<RowDataPacket[]>(sql, params);
        // Devolvemos las filas como un array del tipo T
        return rows as T[];
    });
};

// Para consultas INSERT, UPDATE, DELETE (retorna ResultSetHeader)
export const iud = async (sql: string, params?: any[]): Promise<ResultSetHeader> => {
    return withDbConnection(async (connection) => {
    // execute para DML devuelve [ResultSetHeader, FieldPacket[]]
        const [result] = await connection.execute<ResultSetHeader>(sql, params);
        return result; // result es ResultSetHeader
    });
};