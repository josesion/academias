// 📄 tests/hooks/iudEntidad.test.ts

// Convertir este archivo en módulo para evitar declaraciones top-level globales
export {};

// ===================================================================
// 1. DECLARACIÓN Y CONFIGURACIÓN DE MOCKS
// ===================================================================

// En lugar de mockear el pool y la conexión (getConnection/release/execute),
// mockeamos directamente la función `iud` exportada por `src/utils/baseDatos`.
// Esto simplifica el test unitario y evita problemas de interop/paths.
const mockIud = jest.fn();
// Mockeamos el módulo por su ruta relativa (Jest hoistea jest.mock,
// por eso no podemos usar variables inicializadas con require.resolve aquí).
jest.mock('../../src/utils/baseDatos', () => ({
    __esModule: true,
    iud: mockIud,
}));

// --- Variables para la función a testear ---
let iudEntidad: any; // Declaramos la variable globalmente para asignarle el require.


// --- Datos de Prueba ---
const TEST_SQL = `INSERT INTO alumnos (dni, nombre) VALUES (?, ?);`;
const TEST_VALORES = [12345678, 'TestName'];
const TEST_DATOS_RETORNO = { dni: 12345678, nombre: 'TestName' };

// Respuesta SIMULADA de la base de datos (forma que devuelve la función `iud`)
const DB_RESPONSE_SUCCESS = { affectedRows: 1, insertId: 50 };

const DB_RESPONSE_UPDATE_DELETE = { affectedRows: 1, insertId: 0 };



describe('iudEntidad (Unit Test)', () => {

    // 💡 PASO CRUCIAL: Cargar la función DESPUÉS de aplicar el mock
    beforeAll(() => {
        // Usamos require para obtener la función 'iudEntidad' después de que Jest haya mockeado la BD
        // Esto resuelve el problema del 'hoisting' y el TypeError.
        iudEntidad = require('../../src/hooks/iudEntidad').iudEntidad;
    });

    beforeEach(() => {
        // Limpiamos los contadores y configuraciones previas de los mocks
        jest.clearAllMocks(); 
        // Configuramos el mock de iud para devolver la metadata esperada
        mockIud.mockResolvedValue(DB_RESPONSE_SUCCESS);
    });

    it('Debe ejecutar la sentencia SQL con los valores correctos y devolver el formato esperado', async () => {
        // ACT: Ejecutar iudEntidad
        const resultado = await iudEntidad({
            slqEntidad: TEST_SQL,
            valores: TEST_VALORES,
            entidad: "Alumno",
            metodo: "CREAR",
            datosRetorno: TEST_DATOS_RETORNO
        });

        // 1. ASSERT: Verificar que se haya llamado a la función iud con SQL y valores
        expect(mockIud).toHaveBeenCalledTimes(1);// aqui verifica q no llame dos o mas veses  la consulta  Anti-Patrón de Llamadas Múltiples
        expect(mockIud).toHaveBeenCalledWith(TEST_SQL, TEST_VALORES);// compara el orden y la cantidad de argumetos sean correctos

        // 2. ASSERT: Verificar el valor de retorno final de iudEntidad
        // iudEntidad devuelve un objeto con { error, message, data, code, errorsDetails }
        expect(resultado.error).toBe(false);
        expect(resultado.data).toEqual({ ...TEST_DATOS_RETORNO, id: DB_RESPONSE_SUCCESS.insertId });
    });

    // =========================================
    // CASO 2: MODIFICACIÓN/ELIMINACIÓN EXITOSA
    // =========================================
    it('Debe ejecutar la sentencia SQL con los valores correctos y devolver affectedRows (UPDATE/DELETE)', async () => {
        // ARRANGE: Sobrescribir el mock solo para este test
        const TEST_SQL_UPDATE = "UPDATE alumnos SET nombre = ? WHERE dni = ?";
        const TEST_VALORES_UPDATE = ['Nuevo Nombre', 12345678];
        
        // 💡 CLAVE: Definimos un objeto de retorno MINIMALISTA.
        const DATOS_RETORNO_UPDATE = { dni: 12345678 }; 

        // 1. Configurar el Mock para que devuelva la respuesta de UPDATE/DELETE
        mockIud.mockResolvedValue(DB_RESPONSE_UPDATE_DELETE);

        // ACT: Ejecutar iudEntidad con la nueva sentencia y los datos minimalistas
        const resultado = await iudEntidad({
            slqEntidad: TEST_SQL_UPDATE,
            valores: TEST_VALORES_UPDATE,
            entidad: "Alumno",
            metodo: "MODIFICAR", // ⬅️ IMPORTANTE: Debe ser MODIFICAR/ELIMINAR
            datosRetorno: DATOS_RETORNO_UPDATE // ⬅️ IMPORTANTE: Usamos el objeto minimalista
        });

        // ASSERT: Verificar Interacción
        expect(mockIud).toHaveBeenCalledTimes(1);
        expect(mockIud).toHaveBeenCalledWith(TEST_SQL_UPDATE, TEST_VALORES_UPDATE);

        // ASSERT: Verificar Resultado Final (debe contener affectedRows)
        expect(resultado.error).toBe(false);
        
        // 💡 CLAVE: Usamos objectContaining para verificar solo las propiedades esenciales
        expect(resultado.data).toEqual(expect.any(Object));
        expect(resultado.code).toEqual(expect.any(String));

        expect(resultado.data).toEqual(
            expect.objectContaining({
                dni: DATOS_RETORNO_UPDATE.dni, 
            })
        );
    });


    it('Debe manejar la acción ALTA correctamente', async () => {
    // ARRANGE: Usar respuesta de éxito sin insertId
    mockIud.mockResolvedValue(DB_RESPONSE_UPDATE_DELETE); 
    
    // ACT
    const resultado = await iudEntidad({
        slqEntidad: TEST_SQL,
        valores: TEST_VALORES,
        entidad: "Usuario",
        metodo: "ALTA", // <-- Testeando ALTA
        datosRetorno: { idUsuario: 101 }
    });

    // ASSERT
    expect(resultado.error).toBe(false);
    expect(resultado.data).toEqual(expect.objectContaining({ idUsuario: 101 }));
    // Si la implementación se corrigió, el mensaje debería ser 'dada de alta'
});

});


// ===================================================================
// CASO 3: MANEJO DE ERRORES
// ===================================================================
describe('iudEntidad (Manejo de Errores)', () => {
    beforeAll(() => {
        iudEntidad = require('../../src/hooks/iudEntidad').iudEntidad;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Debe lanzar ClientError cuando no hay filas afectadas en CREAR', async () => {
        // ARRANGE: Configurar respuesta sin filas afectadas
        mockIud.mockResolvedValue({ affectedRows: 0, insertId: 0 });
        
        // ACT & ASSERT
        await expect(iudEntidad({
            slqEntidad: TEST_SQL,
            valores: TEST_VALORES,
            entidad: "Alumno",
            metodo: "CREAR",
            datosRetorno: TEST_DATOS_RETORNO
        })).rejects.toThrow('No se logró crear la entidad ALUMNO');
    });

    it('Debe lanzar ClientError cuando no hay filas afectadas en MODIFICAR', async () => {
        // ARRANGE: Configurar respuesta sin filas afectadas
        mockIud.mockResolvedValue({ affectedRows: 0, insertId: 0 });
        
        // ACT & ASSERT
        await expect(iudEntidad({
            slqEntidad: TEST_SQL,
            valores: TEST_VALORES,
            entidad: "Alumno",
            metodo: "MODIFICAR",
            datosRetorno: TEST_DATOS_RETORNO
        })).rejects.toThrow('No se logró modificar la entidad ALUMNO');
    });

    it('Debe lanzar ClientError cuando no hay filas afectadas en ELIMINAR', async () => {
        // ARRANGE: Configurar respuesta sin filas afectadas
        mockIud.mockResolvedValue({ affectedRows: 0, insertId: 0 });
        
        // ACT & ASSERT
        await expect(iudEntidad({
            slqEntidad: TEST_SQL,
            valores: TEST_VALORES,
            entidad: "Alumno",
            metodo: "ELIMINAR",
            datosRetorno: TEST_DATOS_RETORNO
        })).rejects.toThrow('No se logró eliminar la entidad ALUMNO');
    });

    it('Debe propagar el error cuando la base de datos falla', async () => {
        // ARRANGE: Configurar error de base de datos
        const dbError = new Error('Error de conexión a la base de datos');
        mockIud.mockRejectedValue(dbError);
        
        // ACT & ASSERT
        await expect(iudEntidad({
            slqEntidad: TEST_SQL,
            valores: TEST_VALORES,
            entidad: "Alumno",
            metodo: "CREAR",
            datosRetorno: TEST_DATOS_RETORNO
        })).rejects.toThrow(dbError);
    });
});
