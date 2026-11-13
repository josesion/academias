
import { RowDataPacket } from 'mysql2/promise'; 
import { connection } from './db.test';   
   
describe( "Creacion ESCUELA-ALUMNOS-ALUMNOS_EN_ESCUELA" , ()=> {

  it('Debe insertar un alumno y vincularlo a una escuela (Flujo Completo)', async () => {
        // --- 1. Preparación de Datos Escuelas ---
    const datosEscuela = {
        // Usamos '99' para el test porque es PRIMARY KEY, y aunque tiene AUTO_INCREMENT,
        // es más fácil de referenciar y limpiar si le damos un valor fijo para las pruebas.
        id_escuela: 99, 
    
        dni_propietario: 45678901,
        nombre_propietario: 'María',
        apellido_propietario: 'López',
        razon_social: 'Academia Test S.R.L.',
        direccion: 'Av. Central 500',
        celular: '3874556677',
        fecha_registro: '2025-10-28', // Usamos el formato 'YYYY-MM-DD' para MySQL DATE
    // 'baja' tiene un valor por defecto ('activos'), así que podemos omitirlo si no lo cambiamos.
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

    const insertEscuelaQuery = `INSERT INTO escuelas (id_escuela ,dni_propietario, nombre_propietario, apellido_propietario, razon_social, direccion, celular, fecha_registro)
                                    VALUES ( ? , ?, ?, ?, ?, ?, ?, ?); ` ;
        
    await connection.execute(insertEscuelaQuery, escuelaValues);

     // --- 2. Preparación de Alumnos ---
    const datosAlumno = {
        dni_alumno: 45123789,
        nombre: 'Juan',
        apellido: 'Pérez',
        numero_celular: 3875551234,
    };

    const alumnosValues = [
        datosAlumno.dni_alumno,
        datosAlumno.nombre,
        datosAlumno.apellido,
        datosAlumno.numero_celular
    // estado es por defecto activos    
    ];

    const insertAlumnoQuery = `INSERT INTO alumnos (dni_alumno, nombre, apellido, numero_celular)
                                VALUES ( ? , ? , ? , ? );`;

    await connection.execute(insertAlumnoQuery, alumnosValues );

     // --- 3. Preparación de Datos Escuelas/Alumnos ---
     const dataEscuelaAlumnos = [
        datosAlumno.dni_alumno,
        datosEscuela.id_escuela,
        datosEscuela.fecha_registro,
        // denuevo estado es por defecto activos
     ];

     const insertAlumnosEscuelas =` INSERT INTO alumnos_en_escuela (dni_alumno, id_escuela, fecha_alta_escuela) 
                                    VALUE ( ? , ? , ? );` ;

     await connection.execute(insertAlumnosEscuelas, dataEscuelaAlumnos );

        // --- 4. VERIFICACIÓN (Aserción) ---
        // Revisar si el vínculo se creó en la tabla de unión
        const [rows] = await connection.query<RowDataPacket[]>(`
                                    select 
	                                        * 
                                    from 
	                                    alumnos_en_escuela
                                    where
	                                    dni_alumno = ?
                                    and
	                                    id_escuela = ? ;`, 
            [ datosAlumno.dni_alumno , datosEscuela.id_escuela]);

        // Aserciones
        expect(rows.length).toBe(1);
        expect((rows[0] as any).estado).toBe('activos');
        
        //  Recordatorio: Necesitas añadir la limpieza de  a tu afterEach.
    });

});
   
   
   
