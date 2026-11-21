import { Request, Response } from 'express';
import { CodigoEstadoHTTP } from '../../src/tipados/generico';


export {};

const mocksServicio = {
    listadoPlanes   : jest.fn(),
    estadoPlan      : jest.fn(),
    modPlanesUsuarios: jest.fn(),
    altaPlanes      : jest.fn(),
    listadoPlanesSinPag: jest.fn(),
};

let controladorPlanesUsuarios : any ;

jest.mock("../../src/Servicio/planes.usuario" , () => ({
    method : {
        listadoPlanes           : (...args: any[]) => mocksServicio.listadoPlanes(...args),
        estadoPlan              : (...args: any[]) => mocksServicio.estadoPlan(...args),
        modPlanesUsuarios       : (...args: any[]) => mocksServicio.modPlanesUsuarios(...args),
        altaPlanes              : (...args: any[]) => mocksServicio.altaPlanes(...args),
        listadoPlanesSinPag     : (...args: any[]) => mocksServicio.listadoPlanesSinPag(...args),
    }
}));

const mocksListaPlanesUsuario    = mocksServicio.listadoPlanes;
const mocksEstadoPlanesUsuario   = mocksServicio.estadoPlan;
const mockModPlanesUsuarios      = mocksServicio.modPlanesUsuarios;
const mockAltaPlanes             = mocksServicio.altaPlanes;



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
            message: 'Plan creado exitosamente',
            data: {
                id_escuela: 1,
                id_plan: 10,
                descripcion: 'Plan libre modificado',
                cantidad_clases: 10,
                cantidad_meses: 1,
                monto: 337
            },
            code: 'PLAN_ALTA_OK',
            errorsDetails: undefined
        };

        req = mockRequest(
            {}, // query
            {   // body
                descripcion: 'Plan libre modificado',
                cantidad_clases: '10',
                cantidad_meses: '1',
                monto: '337',
            },
            {} // params
        );

        // El controlador llama al servicio altaPlanes directamente
        mockAltaPlanes.mockResolvedValue(mockData);

        await controladorPlanesUsuarios.altaPlanes_usuarios(req, res, mockNext);

        expect(mockAltaPlanes).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(CodigoEstadoHTTP.OK);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("Debe usar un plan global existente y registrar el plan para la escuela, devolviendo 200", async () => {
        const mockDataExito = {
            error: false,
            message: "Plan creado exitosamente",
            data: {
                id_escuela: 1,
                id_plan: 55,
                descripcion: "Plan existente",
                cantidad_clases: 10,
                cantidad_meses: 1,
                monto: 337,
            },
            code: "PLAN_ALTA_OK"
        };
        mockAltaPlanes.mockResolvedValue(mockDataExito);

        req = mockRequest(
            {},
            {
                descripcion: "Plan existente",
                cantidad_clases: "10",
                cantidad_meses: "1",
                monto: "337",
            },
            {}
        );

        await controladorPlanesUsuarios.altaPlanes_usuarios(req, res, mockNext);

        expect(mockAltaPlanes).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(CodigoEstadoHTTP.OK);
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

        it("Debe decir q el plan ya existe en la escuela y devolver un estado 409", async () => {
            const mockData = {
                error: true,
                message: 'El plan ya existe en la escuela.',
                code: 'PLANUSUARIO_EXISTE'
            };

            req = mockRequest(
                {}, // query
                {   // body
                    descripcion: 'Plan libre modificado',
                    cantidad_clases: '10',
                    cantidad_meses: '1',
                    monto: '337',
                },
                {} // params
            );

            mockAltaPlanes.mockResolvedValue(mockData);

            await controladorPlanesUsuarios.altaPlanes_usuarios(req, res, mockNext);

            expect(mockAltaPlanes).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(CodigoEstadoHTTP.CONFLICTO);
            expect(mockNext).not.toHaveBeenCalled();
        });


        it("Error en el servidor al Crear Plan", async () => {
            req = mockRequest(
                {}, 
                { descripcion: "Plan de prueba", cantidad_clases: 10, cantidad_meses: 1, monto: 337 },
                {}
            );
            res = mockResponse();

            mockAltaPlanes.mockResolvedValue({
                error: true,
                message: 'Error en el servidor',
                code: 'ERROR_SERVIDOR'
            });

            await controladorPlanesUsuarios.altaPlanes_usuarios(req, res, mockNext);

            expect(res.status).toHaveBeenCalledWith(CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR);
            expect(mockNext).not.toHaveBeenCalled();
        });

} ) ;



