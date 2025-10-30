// tests/db.test.ts

// Importamos el pool de MySQL que acabas de modificar en src/db.ts
import pool from '../../src/bd'; 
// tests/db.test.ts

import { PoolConnection, RowDataPacket } from 'mysql2/promise'; 

export let connection: PoolConnection;

describe('Pruebas de Conexión a la Base de Datos (MySQL)', () => {


    beforeAll(async () => {
        try {
            connection = await pool.getConnection();
        } catch (error) {
            console.error("Error al conectar a la BD de prueba. ¿Existe 'academia_danzas_test_db'?");
            throw error;
        }
    });

    afterAll(() => {
        if (connection) {
            connection.release();
        }
    });


    afterEach(async () => {
        // ESTO EVITA LA CONTAMINACIÓN DE DATOS ENTRE PRUEBAS
 // 1. Tablas de unión (Hijo)
    await connection.query("DELETE FROM alumnos_en_escuela"); 
    await connection.query("DELETE FROM planes_en_escuela"); 
    
    // 2. Tablas Padre
    await connection.query('DELETE FROM alumnos'); 
    await connection.query('DELETE FROM escuelas');
    await connection.query('DELETE FROM planes_pago');

    });


    it('Debería establecer una conexión de prueba funcional y ejecutar un query simple', async () => {
        
        // 1. Aplicar el tipo genérico RowDataPacket[]
        const [rows] = await connection.query<RowDataPacket[]>('SELECT 1 + 1 AS solution'); 
        
        // 2. Usar un cast explícito para acceder a 'solution'
        const result = (rows[0] as { solution: number });

        expect(result.solution).toBe(2); // 👈 El error de TS debe desaparecer
    });

 
});

