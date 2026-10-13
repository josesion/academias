import mysql , { Pool }from "mysql2/promise";
import  dotenv from "dotenv";

dotenv.config();


// 1. Definir el nombre de la base de datos a usar
const DB_NAME_ACTUAL = process.env.NODE_ENV === 'test' 
    ? process.env.TEST_DATABASE // Usará la BD de PRUEBA
    : process.env.DATABASE;    // Usará la BD de DESARROLLO

const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: DB_NAME_ACTUAL,
    port: Number(process.env.DB_PORT) || 3306,
    timezone: '-03:00', // convierte Date objects al leer/escribir
    ssl: {
        rejectUnauthorized: false // Requerido para aceptar el certificado SSL de Aiven
    }
});

// Forzar time_zone en cada conexión para que NOW(), CURDATE(), etc. usen Argentina
pool.on('connection', (conn) => {
    conn.execute("SET time_zone = '-03:00'");
});

export default pool;