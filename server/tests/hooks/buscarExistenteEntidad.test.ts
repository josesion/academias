// 📄 tests/hooks/iudEntidad.test.ts
// ===================================================================
// 1. DECLARACIÓN Y CONFIGURACIÓN DE MOCKS
// ===================================================================
export {};
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

let buscarExistenteEntidad : any ;

const TEST_SQL = `select dni_alumno from alumnos where alumnos.dni_alumno = ?`;
const TEST_VALORES = [33762577];
const TEST_DATOS_RETORNO = {dni_alumno : 33762577 } ;

const DB_RESPONSE_SUCCESS_ARRAY = [TEST_DATOS_RETORNO];
const DB_NO_SUCCESS_ARRAY :any[]  = [];


describe("buscarExistenteEntidad (Unit Test)" , () => {

    beforeAll(() => {
        buscarExistenteEntidad = require('../../src/hooks/buscarExistenteEntidad').buscarExistenteEntidad;
    } );
    beforeEach(() => {
    // Limpiamos los contadores y configuraciones previas de los mocks
        jest.clearAllMocks(); 
    });


    // ===================================================================
    //           BUSQUEDA SI ENCUENTRA LA ENTIDAD
    // ===================================================================


            it('Sentencia cuando encuentra una entidad',async() =>{

                mockSelect.mockResolvedValue(DB_RESPONSE_SUCCESS_ARRAY);

                const respuesta = await buscarExistenteEntidad({
                    slqEntidad : TEST_SQL,
                    valores    : TEST_VALORES,
                    entidad : 'Alumno'
                });

                const mensajeEsperado = `ALUMNO ya existe en la base de datos.`;

                expect(mockSelect).toHaveBeenCalledTimes(1);
                expect(mockSelect).toHaveBeenCalledWith(TEST_SQL, TEST_VALORES);

                expect(respuesta.error).toBe(true);
                expect(respuesta.message).toEqual(mensajeEsperado);
                expect(respuesta.data).toEqual(TEST_DATOS_RETORNO);
            } );

    // ===================================================================
    //           BUSQUEDA SI NO SE ENCUENTRA LA ENTIDAD
    // ===================================================================
        it('Sentencia si NO se cuando encuentra una entidad',async() =>{

                mockSelect.mockResolvedValue(DB_NO_SUCCESS_ARRAY);

                const respuesta = await buscarExistenteEntidad({
                    slqEntidad : TEST_SQL,
                    valores    : TEST_VALORES,
                    entidad : 'Alumno'
                });

                const mensajeEsperado = `Validación exitosa: La entidad ALUMNO no existe.`;

                expect(mockSelect).toHaveBeenCalledTimes(1);
                expect(mockSelect).toHaveBeenCalledWith(TEST_SQL, TEST_VALORES);

                expect(respuesta.error).toBe(false);
                expect(respuesta.message).toEqual(mensajeEsperado);
                expect(respuesta.data).toEqual([]);
            } );


});