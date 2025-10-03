import mysql , { Pool }from "mysql2/promise";
import  dotenv from "dotenv";

dotenv.config();

const pool: Pool = mysql.createPool({ // Sin async/await aquí
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

export default pool;