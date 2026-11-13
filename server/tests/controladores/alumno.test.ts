import { Request, Response } from 'express';
// Import del controlador se hará con require DESPUÉS de configurar los mocks
let controladorAlumno: any;
//import { method as dataAlumno } from '../../src/data/alumno.data';

//import { ClientError } from '../../src/utils/error'; // Ajusta la ruta a tu clase de error
//import { listaAlumnosSchema } from '../../src/squemas/alumno'; 
import { CodigoEstadoHTTP } from '../../src/tipados/generico'; 
//import { AlumnoServioCode } from '../../src/tipados/alumno.data'
// Evitar problemas de hoisting de jest.mock creando un objeto de mocks
const mocksData = {
    listaAlumnos          : jest.fn(),
    eliminarAlumno        : jest.fn(),
    modAlumno             : jest.fn(),
    altaAlumno            : jest.fn(),
    verAlumnoExistente    : jest.fn(),
    registarAlumno        : jest.fn(),
    verAlumnoEscuelaExistente: jest.fn(),
};

// Mockeamos el módulo data/alumno.data delegando al mock dentro de 'mocksData'
jest.mock('../../src/data/alumno.data', () => ({
    method: {
        listaAlumnos            : (...args: any[]) => mocksData.listaAlumnos(...args),
        eliminarAlumno          : (...args: any[]) => mocksData.eliminarAlumno(...args),
        modAlumno               : (...args: any[]) => mocksData.modAlumno(...args),
        verAlumnoExistente      : (...args: any[]) => mocksData.verAlumnoExistente(...args),
        registarAlumno          : (...args: any[]) => mocksData.registarAlumno(...args),
        verAlumnoEscuelaExistente: (...args: any[]) => mocksData.verAlumnoEscuelaExistente(...args),
        registroAlumnoEscuela   : (...args: any[]) => mocksData.altaAlumno(...args),
    }
}));

const mockListaAlumnos      = mocksData.listaAlumnos;
const mockEliminarAlumnos   = mocksData.eliminarAlumno;
const mockModAlumnos        = mocksData.modAlumno;
const mockAltaAlumnos       = mocksData.altaAlumno;
const mockVerAlumnoExistente = mocksData.verAlumnoExistente;
const mockRegistarAlumno     = mocksData.registarAlumno;
const mockVerAlumnoEscuelaExistente = mocksData.verAlumnoEscuelaExistente;

const mockNext = jest.fn(); 

// La función 'enviarResponse' está dentro del controlador, así que solo mockeamos req/res.
const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis(); 
    res.json = jest.fn().mockReturnThis();
    return res as Response;
};

// Función para crear un mock de petición (req)
const mockRequest = (query = {}, body = {}, params = {}) => {
    const req: Partial<Request> = {
        query: query,
        body: body,
        params: params,
    };
    return req as Request;
};

// ----------------------------------------------------------------------
// 3. TESTS DEL CONTROLADOR
// ----------------------------------------------------------------------
describe('AlumnoController - listaAlumnos , borrarAlumno , registarAlumno', () => { 

    let req: Request;
    let res: Response;

        beforeEach(() => {
            req = mockRequest(); 
            res = mockResponse();
            mockNext.mockClear();
            jest.clearAllMocks(); // Limpia el historial de llamadas de todos los mocks y spies
        });

        beforeAll(() => {
            // Cargamos el controlador después de que jest.mock haya sido procesado
            controladorAlumno = require('../../src/controladores/alumno.controlador').method;
        });


        it('Debe calcular offset, validar, llamar a la lógica de negocio y devolver status 200 -- listado alumnos', async () => {
            // Datos simulados de respuesta de la Capa de Datos (que es listaAlumnos)
            const mockData = {
                error: false,
                message: 'ALUMNO listados activos',
                data: [{ Dni: 123, Apellido: 'Perez' }],
                paginacion: { pagina: 1, limite: 10, contadorPagina: 5 },
                code: 'ALUMNO_LISTED',
                errorsDetails: undefined
            };

            //  Configurar el Mock para devolver éxito
            mockListaAlumnos.mockResolvedValue(mockData);

            // Simulamos el Request con datos de filtrado/paginación
            // (Simulamos: pagina=2, limit=10 -> offset=10)
            const limit = '10';
            const pagina = '2';
            req = mockRequest({ 
                estado: 'activos', 
                dni: '123', 
                apellido: '', 
                limit: limit, // String
                pagina: pagina, // String
                escuela: '1' // ahora en query (controller lee req.query)
            });

            await controladorAlumno.listarAlumno( req , res , mockNext);

            // ASSERT: el servicio de data debe haberse llamado
            expect(mockListaAlumnos).toHaveBeenCalledTimes(1);
            // verificar que se devolvió status 200 y se llamó json
            expect(res.json).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(CodigoEstadoHTTP.OK); 
                

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    error: false,
                    message: mockData.message,
                    data: mockData.data,
                    paginacion: mockData.paginacion,
                    code: mockData.code
                })
            );

                // Verificamos que next NO fue llamado
            expect(mockNext).not.toHaveBeenCalled();
        
        });


        it('Debe cambiar el estado del alumno  y devolver un status 200' ,async () => {
            
            const mockData = {
                error: false,
                message: 'ALUMNO eliminada exitosamente',
                data: { dni: 123 ,  id : 1},
                code: 'ALUMNO_ELIMINAR',
                errorsDetails: undefined
            };

            // El controlador espera los valores en req.params
            // dni debe cumplir con el schema (min 8 chars)
            req = mockRequest({}, {}, {
                dni: '12345678',
                id_escuela: '1',
                estado: 'inactivos'
            });

            mockEliminarAlumnos.mockResolvedValue(mockData);

            await controladorAlumno.borrarAlumno(req, res, mockNext);

            expect(mockEliminarAlumnos).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalled();
          // verificar que se devolvió status 200 y se llamó jso
            expect(res.status).toHaveBeenCalledWith(CodigoEstadoHTTP.OK); 
            
             expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    error: false,
                    message: mockData.message,
                    data: mockData.data,
                    code: mockData.code
                })
            );

        });

        it ('Debe cambiar cualquier campo de la entidad Alumno y devolver un status 200' , async( ) => {

            const mockData = {
                error: false,
                message: 'ALUMNO modificada exitosamente',
                data: { dni: 123 , apellido : "lopez" , nombre : "jose manuel"},
                code: 'ALUMNO_MODIFICAR',
                errorsDetails: undefined
            };

            // params: dni and id_escuela; body: fields to modify
            req = mockRequest(
                {}, // query
                { // body
                    nombre: 'jose manuel',
                    apellido: 'lopez',
                    celular: '3874043376'
                },
                { // params
                    dni: '33762577',
                    id_escuela: '1'
                }
            );

            mockModAlumnos.mockResolvedValue(mockData);

            await controladorAlumno.modAlumno( req , res , mockNext) ;

            expect(res.status).toHaveBeenCalledWith(CodigoEstadoHTTP.OK); 
            expect(mockModAlumnos).toHaveBeenCalledTimes(1);
            expect(res.json).toHaveBeenCalled();

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ 
                    error: false,
                    message: mockData.message,
                    data: mockData.data,
                    code: mockData.code
                })
            );
        });

        it ('Debe hacer el alta de un alumno y deolver un status 200', async()=> {
            const mockData = {
                error: false,
                message: 'ALUMNO creada exitosamente',
                data: { dni: 123 , apellido : "lopez" , nombre : "jose manuel"},
                code: 'ALUMNO_ALTA',
                errorsDetails: undefined
            };

            req = mockRequest(
                {}, // query
                { // body
                    nombre: 'jose manuel',
                    apellido: 'lopez',
                    celular: '3874043376',
                    dni: '33762577',
                    id_escuela : 1 ,
                },
                { }// params
            );

            // Mock the data-layer flow the controller calls:
            // 1) verAlumnoExistente -> not found (so controller will create)
            mockVerAlumnoExistente.mockImplementation(async (...args: any[]) => {
                console.log('MOCK CALL verAlumnoExistente', args);
                return { error: false, message: 'no existe', data: [], code: 'ALUMNO_NO_EXISTE' };
            });
            // 2) registarAlumno -> created (returns dni)
            // Nota: el controller compara el código con AlumnoServioCode.ALUMNO_CREATED cuyo valor es 'ALUMNO_CREAR'
            mockRegistarAlumno.mockImplementation(async (...args: any[]) => {
                console.log('MOCK CALL registarAlumno', args);
                return { error: false, message: 'creado', data: { dni: '33762577' }, code: 'ALUMNO_CREAR' };
            });
            // 3) verAlumnoEscuelaExistente -> not found
            mockVerAlumnoEscuelaExistente.mockImplementation(async (...args: any[]) => {
                console.log('MOCK CALL verAlumnoEscuelaExistente', args);
                return { error: false, message: 'no inscrito', data: [], code: 'ALUMNO_ESCHOOL_NO_EXISTE' };
            });
            // 4) registroAlumnoEscuela -> inscripción creada
            mockAltaAlumnos.mockImplementation(async (...args: any[]) => {
                console.log('MOCK CALL registroAlumnoEscuela', args);
                return mockData;
            });

            await controladorAlumno.altaAlumno( req , res , mockNext);

            // Verificaciones intermedias para localizar en qué punto se detuvo el flujo
            expect(mockVerAlumnoExistente).toHaveBeenCalledTimes(1);
            expect(mockRegistarAlumno).toHaveBeenCalledTimes(1);
            expect(mockVerAlumnoEscuelaExistente).toHaveBeenCalledTimes(1);
            expect(mockAltaAlumnos).toHaveBeenCalledTimes(1);
            // Aseguramos que no se haya llamado next(err)
            expect(mockNext).not.toHaveBeenCalled();

            // El controlador devuelve CodigoEstadoHTTP.CREADO (201) cuando la inscripción fue creada
            expect(res.status).toHaveBeenCalledWith(CodigoEstadoHTTP.CREADO);
        });


  
} );
