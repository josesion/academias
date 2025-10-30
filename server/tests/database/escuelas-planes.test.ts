import { RowDataPacket } from 'mysql2/promise'; 
// Asumo que 'db.test' es el archivo de configuración con la conexión exportada
import { connection } from './db.test';  

import 'jest';

describe("Creacion de ESCUELAS-PLANES-PLANES_EN_ESCUELAS" , ()=> {

    it("Debe insertar un plan y vincularlo a una escuela (Flujo Completo)" , async()=> {
        // FECHA BASE PARA AMBOS INSERTS
        const fechaCreacion = '2025-10-28';

        // --- 1. Preparación de Datos: ESCUELAS (Padre) ---
        const datosEscuela = {
            id_escuela: 99, 
            dni_propietario: 45678901,
            nombre_propietario: 'María',
            apellido_propietario: 'López',
            razon_social: 'Academia Test S.R.L.',
            direccion: 'Av. Central 500',
            celular: '3874556677',
            fecha_registro: fechaCreacion, 
        };

        const escuelaValues = [
            datosEscuela.id_escuela,
            datosEscuela.dni_propietario,
            datosEscuela.nombre_propietario,
            datosEscuela.apellido_propietario,
            datosEscuela.razon_social,
            datosEscuela.direccion,
            datosEscuela.celular,
            datosEscuela.fecha_registro    
        ];

        // QUITAR ESPACIOS INNECESARIOS AQUÍ
        const insertEscuelaQuery = `
INSERT INTO escuelas (id_escuela, dni_propietario, nombre_propietario, apellido_propietario, razon_social, direccion, celular, fecha_registro)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);
`; 
        await connection.execute(insertEscuelaQuery, escuelaValues);

        // --- 2. Preparación de Datos: PLANES_PAGO (Maestro) ---
        const datosPlan = {
            id_plan: 50, 
            descripcion_plan: 'Plan Mensual Básico',
            cantidad_clases: 4,
            cantidad_meses: 1,
            monto: 15000.00, 
        };

        const planValues = [
            datosPlan.id_plan,
            datosPlan.descripcion_plan,
            datosPlan.cantidad_clases,
            datosPlan.cantidad_meses,
            datosPlan.monto,
        ];

        // QUITAR ESPACIOS INNECESARIOS AQUÍ
        const insertPlanesQuery = `
INSERT INTO planes_pago (id_plan, descripcion_plan, cantidad_clases, cantidad_meses, monto)
VALUES (?, ? , ?, ? , ?);
`;
        await connection.execute(insertPlanesQuery, planValues );

        // --- 3. ACCIÓN CLAVE: Inserción en PLANES_EN_ESCUELA (Unión) ---
        
        // Valores personalizados para el plan en esta escuela específica
        const planesEscuelaValues = [
            datosEscuela.id_escuela,
            datosPlan.id_plan,
            fechaCreacion,                     
            'Plan Personalizado 99',     
            datosPlan.monto * 1.1,       
            datosPlan.cantidad_clases + 1, 
            datosPlan.cantidad_meses       
        ];

       
        const insertPlanesEscuelaQuery = `
                                            INSERT INTO planes_en_escuela (
                                                id_escuela,
                                                id_plan, 
                                                fecha_creacion,
                                                nombre_personalizado, 
                                                monto_asignado,
                                                clases_asignadas,
                                                meses_asignados) 
                                                    VALUES (?, ?, ?, ?, ?, ?, ?); `; 
        
        await connection.execute(insertPlanesEscuelaQuery, planesEscuelaValues );

        // --- 4. VERIFICACIÓN (Aserción) ---
        // Verificamos la existencia y los valores personalizados en la tabla de unión
        const [rows] = await connection.query<RowDataPacket[]>(`
SELECT * FROM planes_en_escuela
WHERE id_escuela = ? AND id_plan = ?;
`, 
            [  datosEscuela.id_escuela , datosPlan.id_plan ]);

        // Aserción 1: Debe haber una fila
        expect(rows.length).toBe(1);

        // Aserción 2: Verificamos que los datos personalizados se guardaron
        const planAsignado = rows[0] as any;
        expect(planAsignado.nombre_personalizado).toBe('Plan Personalizado 99');

        expect(parseFloat(planAsignado.monto_asignado)).toBeCloseTo(16500.00); 

        // Aserción 3: Verificamos el estado de la tabla Padre (planes_pago)
        const [planRow] = await connection.query<RowDataPacket[]>(
            `SELECT estado FROM planes_pago WHERE id_plan = ?`, 
            [datosPlan.id_plan]
        );
        expect((planRow[0] as any).estado).toBe('activos');
    });
} );