import { Request, Response } from 'express';
import { CodigoEstadoHTTP } from '../../src/tipados/generico';


export {};

const mocksData = {
    // nombre de las funciones de las q depende la funcion a testear en este caso de la capa de dato IMPORTANTE
    listadoPlanesUsuarios   : jest.fn(),
    estadoPlanes_usuarios   : jest.fn(),
    modPlanesusuarios       : jest.fn(), 

    existenciaPlan          : jest.fn(), 
    existenciaPlanEscuela   : jest.fn(),
    altaPlanesEscuelas      : jest.fn(),
    altaPlanes_usuariosData : jest.fn(),
};


let controladorPlanesUsuarios : any ;


jest.mock("../../src/data/planes.usuarios.data" , () => ({
    method : {
        listadoPlanesUsuarios           : (...args: any[]) => mocksData.listadoPlanesUsuarios(...args),
        estadoPlanes_usuarios           : (...args: any[]) => mocksData.estadoPlanes_usuarios(...args),
        modPlanesUsuarios               : (...args: any[]) => mocksData.modPlanesusuarios(...args), 

        existenciaPlan                  : (...args: any[]) => mocksData.existenciaPlan(...args),
        existenciaPlanEscuela           : (...args: any[]) => mocksData.existenciaPlanEscuela(...args), 
        altaPlanesEscuelas              : (...args: any[]) => mocksData.altaPlanesEscuelas(...args), 
        altaPlanes_usuariosData         : (...args: any[]) => mocksData.altaPlanes_usuariosData(...args),  
    }
}));

const mocksListaPlanesUsuario    = mocksData.listadoPlanesUsuarios;
const mocksEstadoPlanesUsuario   = mocksData.estadoPlanes_usuarios;
const mockModPlanesUsuarios      = mocksData.modPlanesusuarios;

const mockExistenciaPlanesUsuarios = mocksData.existenciaPlan ;
const mockExistenciaPlanesEscuelasUsuarios = mocksData.existenciaPlanEscuela ;
const mockPlanesGlobales         = mocksData.altaPlanes_usuariosData ;
const mockPlanesEscuelas         = mocksData.altaPlanesEscuelas  ;



const mockNext = jest.fn();

const mockResponse = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res as Response;
};

const mockRequest = (query = {}, body = {}, params = {}) => {
    const req: Partial<Request> = {
        query: query,
        body: body,
        params: params,
    };
    return req as Request;
};

describe('AlumnoController - listaPlanes , borraPlanes , registrarPlanes , modPlanes', () => {

    let req: Request;
    let res: Response;

    beforeEach(() => {
        controladorPlanesUsuarios = require('../../src/controladores/planes.usuarios.controlador').method;
        req = mockRequest();
        res = mockResponse();
        mockNext.mockClear();
        jest.clearAllMocks();
    });

    it('Debe calcular offset, validar, llamar a la lógica de negocio y devolver status 200 -- listado Planes usuarios', async () => {
        const mockData = {
            error: false,
            message: 'PLANUSUARIO listados activos',
            data: [{ id: 123, descripcion: 'Plan libre', clases: 12, meses: 1 }],
            paginacion: { pagina: 1, limite: 10, contadorPagina: 5 },
            code: 'PLANUSUARIO_LISTED',
            errorsDetails: undefined
        };

        mocksListaPlanesUsuario.mockResolvedValue(mockData);

        const limit = '10';
        const pagina = '2';
        req = mockRequest(
            { estado: 'activos', descripcion: 'Plan libre', limit: limit, pagina: pagina, escuela: '1' },
            {},
            {}
        );

        await controladorPlanesUsuarios.listadoPlanesUsuarios(req, res, mockNext);

        expect(mocksListaPlanesUsuario).toHaveBeenCalledTimes(1);
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
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('Debe cambiar EL estado del plan y devolver un status 200', async () => {
        const mockData = {
            error: false,
            message: 'PLANUSUARIO elimanda exitosamente',
            data: { id: 123, descripcion: 'Plan libre' },
            code: 'PLANUSUARIO_ELIMIMAR',
            errorsDetails: undefined
        };

        req = mockRequest({}, {}, {
            id_plan: '1',
            id_escuela: '1',
            estado: 'inactivos'
        });

        mocksEstadoPlanesUsuario.mockResolvedValue(mockData);

        await controladorPlanesUsuarios.estadoPlanes_usuarios(req, res, mockNext);

        expect(mocksEstadoPlanesUsuario).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalled();
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

    it('Debe cambiar los datos en planes Usuarios y devolver un status 200', async () => {
        const mockData = {
            error: false,
            message: 'PLANUSUARIO modificada exitosamente.',
            data: {
                id_escuela: 1,
                nombre_personalizado: 'Plan libre modificado',
                id_plan: 100,
                fecha_creacion: "2025-05-10"
            },
            code: 'PLANUSUARIO_MODIFICAR',
            errorsDetails: undefined
        };

        mockModPlanesUsuarios.mockResolvedValue(mockData);

        req = mockRequest(
            {},
            {
                descripcion: 'Plan libre modificado',
                fecha_creacion: "2025-05-10",
                cantidad_clases: '12',
                cantidad_meses: '1',
                monto: '7000'
            },
            {
                id_plan: "100",
                id_escuela: "1"
            }
        );

        await controladorPlanesUsuarios.modPlanes_usuarios(req, res, mockNext);

        expect(mockModPlanesUsuarios).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalled();
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

    it("Debe registrar un plan para la escuela y devolver un 200", async () => {
        const mockData = {
            error: false,
            message: 'PLANUSUARIO creada exitosamente',
            data: {
                id_escuela: 1,
                id_plan: 10, // <- Este id debe coincidir con el que devuelve el plan global
                descripcion: 'Plan libre modificado',
                fecha_creacion: "2025-05-10",
                cantidad_clases: 10,
                cantidad_meses: 1,
                monto: 7000
            },
            code: 'PLANUSUARIO_ALTA',
            errorsDetails: undefined
        };

        // Construimos el request simulado
        req = mockRequest(
            {}, // query
            {   // body
                descripcion: 'Plan libre modificado',
                cantidad_clases: '10',
                cantidad_meses: '1',
                monto: '337',
                estado: 'activos',
                fecha_creacion: '2025-09-10',
                id_escuela: 1
            },
            {} // params
        );

        // 1️⃣ Verificar existencia del plan global
        mockExistenciaPlanesUsuarios.mockResolvedValue({
            error: false,
            message: 'Validación exitosa: La entidad PLAN no existe.',
            data: [], // simulamos que no existe
            code: 'PLAN_NO_EXISTE'
        });

        // 2️⃣ Crear plan global si no existe
        mockPlanesGlobales.mockResolvedValue({
            error: false,
            message: 'PLANES creada exitosamente',
            data: { id: 10 }, // <- CORRECCIÓN CRUCIAL: debe devolver id numérico
            code: 'PLANES_CREAR'
        });

        // 3️⃣ Verificar si ya existe relación plan-escuela
        mockExistenciaPlanesEscuelasUsuarios.mockResolvedValue({
            error: false,
            message: 'Validación exitosa: La entidad PLANUSUARIO no existe.',
            data: [],
            code: 'PLANUSUARIO_NO_EXISTE'
        });

        // 4️⃣ Crear relación plan-escuela
        mockPlanesEscuelas.mockResolvedValue(mockData);

        // Llamada al controlador
        await controladorPlanesUsuarios.altaPlanes_usuarios(req, res, mockNext);

        //  Expect: cada función de la capa de datos fue llamada correctamente
        expect(mockExistenciaPlanesUsuarios).toHaveBeenCalledTimes(1);
        expect(mockPlanesGlobales).toHaveBeenCalledTimes(1);
        expect(mockExistenciaPlanesEscuelasUsuarios).toHaveBeenCalledTimes(1);
        expect(mockPlanesEscuelas).toHaveBeenCalledTimes(1);

        // respuesta enviada correctamente
        expect(res.status).toHaveBeenCalledWith(CodigoEstadoHTTP.CREADO);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: false,
                message: mockData.message,
                data: mockData.data,
                code: mockData.code
            })
        );

        // Expect: no se llamó next (no hubo error)
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("Debe usar un plan global existente y registrar el plan para la escuela, devolviendo 201", async () => {
        const id_plan_existente = 55;

        // 🧠 Simulamos que el plan global YA EXISTE
        mockExistenciaPlanesUsuarios.mockResolvedValue({
            error: true, // ⚠️ En tu código, EXISTENTE => error === true
            message: "PLAN ya existe en la base de datos.",
            data: { id_plan: id_plan_existente },
            code: "PLAN_EXISTE"
        });

        // 🚫 No debe intentar crear un plan global nuevo
        mockPlanesGlobales.mockResolvedValue({
            error: false,
            message: "PLAN creado (no debería llamarse)",
            data: { id: 999 },
            code: "PLAN_CREAR"
        });

        // 🧩 Simulamos que la relación plan-escuela NO EXISTE
        mockExistenciaPlanesEscuelasUsuarios.mockResolvedValue({
            error: false,
            message: "Validación exitosa: La entidad PLANUSUARIO no existe.",
            data: [],
            code: "PLANUSUARIO_NO_EXISTE"
        });

        // ✅ Mock de alta de plan en escuela
        const mockDataExito = {
            error: false,
            message: "PLANUSUARIO creada exitosamente",
            data: {
                id_escuela: 1,
                id_plan: id_plan_existente,
                descripcion: "Plan existente",
                cantidad_clases: 10,
                cantidad_meses: 1,
                monto: 337,
            },
            code: "PLANUSUARIO_ALTA"
        };
        mockPlanesEscuelas.mockResolvedValue(mockDataExito);

        // 🧾 Request simulado
        req = mockRequest(
            {},
            {
                descripcion: "Plan existente",
                cantidad_clases: "10",
                cantidad_meses: "1",
                monto: "337",
                estado: "activos",
                fecha_creacion: "2025-09-10",
                id_escuela: 1
            },
            {}
        );

        // 🚀 Ejecutar el controlador
        await controladorPlanesUsuarios.altaPlanes_usuarios(req, res, mockNext);

        // ✅ Verificaciones internas
        expect(mockExistenciaPlanesUsuarios).toHaveBeenCalledTimes(1);
        expect(mockPlanesGlobales).not.toHaveBeenCalled(); // ❌ No crea plan global nuevo
        expect(mockExistenciaPlanesEscuelasUsuarios).toHaveBeenCalledTimes(1);
        expect(mockPlanesEscuelas).toHaveBeenCalledTimes(1);

        // ✅ Verificar respuesta HTTP
        expect(res.status).toHaveBeenCalledWith(CodigoEstadoHTTP.CREADO);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: false,
                message: mockDataExito.message,
                data: expect.objectContaining({
                    id_escuela: 1,
                    id_plan: id_plan_existente
                }),
                code: "PLANUSUARIO_ALTA"
            })
        );

        // ✅ No debe llamar next()
        expect(mockNext).not.toHaveBeenCalled();
    });
   
});


describe('Errores de negocios - listaPlanes , borraPlanes , registrarPlanes , modPlanes',() => {
    
    let req: Request;
    let res: Response;

    beforeEach(() => {
        controladorPlanesUsuarios = require('../../src/controladores/planes.usuarios.controlador').method;
        req = mockRequest();
        res = mockResponse();
        mockNext.mockClear();
        jest.clearAllMocks();
    });

        it("Debe decir q el plan ya existe en la escuela  y devolver  un estado  409 ", async () => {

            const mockData = {
                error: true,
                message: 'PLANUSUARIO ya existe en la base de datos.',
                code: 'PLANUSUARIO_EXISTE'
            };

            // Construimos el request simulado
            req = mockRequest(
                {}, // query
                {   // body
                    descripcion: 'Plan libre modificado',
                    cantidad_clases: '10',
                    cantidad_meses: '1',
                    monto: '337',
                    estado: 'activos',
                    fecha_creacion: '2025-09-10',
                    id_escuela: 1
                },
                {} // params
            );

            // 1️⃣ Verificar existencia del plan global
            mockExistenciaPlanesUsuarios.mockResolvedValue({
                error: false,
                message: 'Validación exitosa: La entidad PLAN no existe.',
                data: [], // simulamos que no existe
                code: 'PLAN_NO_EXISTE'
            });

            // 2️⃣ Crear plan global si no existe
            mockPlanesGlobales.mockResolvedValue({
                error: false,
                message: 'PLANES creada exitosamente',
                data: { id: 10 }, // <- CORRECCIÓN CRUCIAL: debe devolver id numérico
                code: 'PLANES_CREAR'
            });




            mockExistenciaPlanesEscuelasUsuarios.mockResolvedValue(mockData);

            // Llamada al controlador
            await controladorPlanesUsuarios.altaPlanes_usuarios(req, res, mockNext);

            //  Expect: cada función de la capa de datos fue llamada correctamente
            expect(mockExistenciaPlanesUsuarios).toHaveBeenCalledTimes(1);
            expect(mockPlanesGlobales).toHaveBeenCalledTimes(1);
            expect(mockExistenciaPlanesEscuelasUsuarios).toHaveBeenCalledTimes(1);
            

            // respuesta enviada correctamente
            expect(res.status).toHaveBeenCalledWith(CodigoEstadoHTTP.CONFLICTO);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error  : mockData.error,    
                    message: mockData.message,
                    code: mockData.code
                })
            );

            // Expect: no se llamó next (no hubo error)
            expect(mockNext).not.toHaveBeenCalled();
        });


        it("Error en el servidor al Crear Plan Global", async () => {
            req = mockRequest(
                {}, 
                { descripcion: "Plan de prueba", id_escuela: 1, cantidad_clases: 10, cantidad_meses: 1, monto: 337 },
                {}
            );
            res = mockResponse();

            // Mockear la existencia del plan global -> no existe, así que intenta crearlo
            mockExistenciaPlanesUsuarios.mockResolvedValue({
                error: false,
                message: 'PLAN no existe',
                data: [],
                code: 'PLAN_NO_EXISTE'
            });

            // Mockear que la creación del plan global falle
            mockPlanesGlobales.mockResolvedValue({
                error: true,
                message: 'No se logró crear la entidad PLAN. Filas afectadas: 0',
                data: null,
                code: 'CREATION_FAILED'
            });

            // Mock para la existencia del plan-escuela (no llega a ejecutarse)
            mockExistenciaPlanesEscuelasUsuarios.mockResolvedValue({
                error: false,
                message: 'No existe plan en escuela',
                data: [],
                code: 'PLAN_ESC_NO_EXISTE'
            });

            await controladorPlanesUsuarios.altaPlanes_usuarios(req, res, mockNext);

            // ✅ Verificar que respondió con error 500
            expect(res.status).toHaveBeenCalledWith(CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR);

            // ✅ Verificar que devolvió mensaje de error correcto
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: true,
                    message: expect.stringContaining("No se logró crear la entidad PLAN"),
                    code: "CREATION_FALLO" 
                })
            );

            // ✅ No debería llamar next()
            expect(mockNext).not.toHaveBeenCalled();
        });

} ) ;



