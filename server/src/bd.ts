import mysql , { Pool }from "mysql2/promise";
import  dotenv from "dotenv";

dotenv.config();


// 1. Definir el nombre de la base de datos a usar
const DB_NAME_ACTUAL = process.env.NODE_ENV === 'test' 
    ? process.env.TEST_DATABASE // Usará la BD de PRUEBA
    : process.env.DATABASE;    // Usará la BD de DESARROLLO

const pool: Pool = mysql.createPool({ // Sin async/await aquí
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: DB_NAME_ACTUAL ,
});

export default pool;