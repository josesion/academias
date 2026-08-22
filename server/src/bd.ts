import mysql, { Pool } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const DB_NAME_ACTUAL = process.env.NODE_ENV === 'test' 
    ? process.env.TEST_DATABASE 
    : process.env.DATABASE;    

const pool: Pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: DB_NAME_ACTUAL,
  port: Number(process.env.DB_PORT) || 11858,
  ssl: { 
    rejectUnauthorized: false 
  }
});

console.log("CONECTANDO A:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: DB_NAME_ACTUAL,
  port: process.env.DB_PORT
});

export default pool;