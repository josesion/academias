// 📄 tests/hooks/funcionListar.test.ts
// ===================================================================
// 1. IMPORTACIONES
// ===================================================================
export {};

// ===================================================================
// 2. DECLARACIÓN Y CONFIGURACIÓN DE MOCKS
// ===================================================================
// En lugar de mockear el pool y la conexión (getConnection/release/execute),
// mockeamos directamente la función `iud` exportada por `src/utils/baseDatos`.
// Esto simplifica el test unitario y evita problemas de interop/paths.
const mockSelect = jest.fn();
// Mockeamos el módulo por su ruta relativa (Jest hoistea jest.mock,
// por eso no podemos usar variables inicializadas con require.resolve aquí).
jest.mock('../../src/utils/baseDatos', () => ({
    __esModule: true,
    // Aquí tienes que usar 'select' para reemplazar la exportación.
    select: mockSelect, 
}));

// Variables de configuración
const LIMIT: number = 6;
const OFFSET: number = 1;
const PAGINA: number = 1;
const ESTADO: string = 'activos';

// Variables del módulo
let funcionListar: any;
let listarEntidad: any;

// Datos de prueba
const TEST_SQL = `select
    alumnos.dni_alumno as Dni,
    alumnos.apellido as Apellido,
    count(*) over() as total_registros
from alumnos
join alumnos_en_escuela on alumnos.dni_alumno = alumnos_en_escuela.dni_alumno
where
    alumnos_en_escuela.estado = ?
    and alumnos.dni_alumno like ?
order by alumnos.dni_alumno
    limit ${LIMIT}
    offset ${OFFSET};`;

const TEST_VALORES = ["activos", 33762577];
// Agregamos total_registros que viene de la consulta SQL count(*) over()
const TEST_DATOS_RETORNO = { 
    Dni: 33762577, 
    Apellido: "lopez",
    total_registros: 15  // Simulamos que hay 15 registros en total
};    

// La respuesta de la BD incluye el total_registros que luego será removido
const DB_RESPONSE_SUCCESS_ARRAY = [TEST_DATOS_RETORNO];

// Calculamos la paginación esperada
const TOTAL_REGISTROS = TEST_DATOS_RETORNO.total_registros;
const TOTAL_PAGINAS = Math.ceil(TOTAL_REGISTROS / LIMIT);



    describe("funcionListar (Unit Test)" , () => {
        beforeAll(() => {
            funcionListar= require('../../src/hooks/funcionListar');
            listarEntidad = funcionListar.listarEntidad;
        });
        beforeEach(() => {
        // Limpiamos los contadores y configuraciones previas de los mocks
            jest.clearAllMocks(); 
        });
    // ===================================================================
    //           BUSQUEDA  DATOS SEGUN FILTRADO OK 
    // ===================================================================
        it('Busqueda de listado exitosa ',async () =>{
            mockSelect.mockResolvedValue(DB_RESPONSE_SUCCESS_ARRAY);

            const resultado = await listarEntidad({
                slqListado : TEST_SQL,  
                valores    : TEST_VALORES,
                limit     : LIMIT,
                pagina    : PAGINA.toString(), // Convertido a string porque el tipo espera string ya q cuando viene del fetch este viene en string
                entidad   : 'Alumno',
                estado    : ESTADO
            });

                // Verificar la llamada al mock
                expect(mockSelect).toHaveBeenCalledTimes(1);
                expect(mockSelect).toHaveBeenCalledWith(TEST_SQL, TEST_VALORES);

                // Verificar la estructura completa de la respuesta
                expect(resultado).toEqual({
                    error: false,
                    message: ' ALUMNO listados activos',  // Note el espacio al principio
                    data: [{
                        Dni: TEST_DATOS_RETORNO.Dni,
                        Apellido: TEST_DATOS_RETORNO.Apellido
                    }],
                    paginacion: {
                        pagina: Number(PAGINA),
                        limite: Number(LIMIT),
                        contadorPagina: TOTAL_PAGINAS,
                        totalRegistros: TOTAL_REGISTROS
                    },
                    code: 'ALUMNO_LISTED',
                    errorsDetails: undefined
                });

                // Verificaciones adicionales
                expect(resultado.data).toHaveLength(1);
                expect(resultado.data[0]).not.toHaveProperty('total_registros');

        });

        // ===================================================================
        //           CUANDO NO HAY DATOS EN EL LISTADO
        // ===================================================================
        it('Debe devolver error cuando no hay resultados', async () => {
            // Configurar el mock para devolver array vacío
            mockSelect.mockResolvedValue([]);

            // El hook devuelve un objeto con error: true en lugar de lanzar excepción
            const resultado = await listarEntidad({
                slqListado: TEST_SQL,
                valores: TEST_VALORES,
                limit: LIMIT,
                pagina: PAGINA.toString(),
                entidad: 'Alumno',
                estado: ESTADO
            });
            
            // Verificar que devuelve error: true
            expect(resultado.error).toBe(true);
            // Verificar el mensaje
            expect(resultado.message).toBe('No hay ALUMNO activos');
            // Verificar el código de error
            expect(resultado.code).toBe('NO_ACTIVE_ALUMNO');
            // Verificar que data es array vacío
            expect(resultado.data).toEqual([]);
        });

    });