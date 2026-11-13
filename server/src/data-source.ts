// src/data-source.ts

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

// 1. Determinar el nombre de la BD basado en el entorno
const DB_NAME = process.env.NODE_ENV === 'test' ? 
    process.env.TEST_DB_NAME || 'mi_app_test_db' : // Si estás en test
    process.env.DB_NAME || 'mi_app_dev_db';        // Si estás en desarrollo/producción

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: DB_NAME, // <--- Esto cambia según el entorno
    synchronize: true, // Útil en tests, pero NO en producción
    entities: [__dirname + "/entity/*.ts"], 
    // ... otras configuraciones
});