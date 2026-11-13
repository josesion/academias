// tests/database/profesores-escuelas.test.ts
import { method as dataProfesores } from '../../src/data/profesores.data';
import * as BE from '../../src/hooks/buscarExistenteEntidad';
import * as IUD from '../../src/hooks/iudEntidad';

// Mock del módulo completo
jest.mock('../../src/hooks/buscarExistenteEntidad');
jest.mock('../../src/hooks/iudEntidad');

describe('Profesor capa de datos', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Alta de profesores globales', async () => {
        const inputProfesor = {
            dni: "33762577",
            nombre: "Jose",
            apellido: "Lopez",
            celular: "3875043376",
        };

        const mockRespuesta = {
            error: false,
            message: "PROFESORES creada exitosamente.",
            data: inputProfesor,
            code: "PROFESORES_CREAR",
            errorsDetails: undefined,
        };

        (IUD.iudEntidad as jest.Mock).mockResolvedValue(mockRespuesta);

        const resultado = await dataProfesores.altaProfesores(inputProfesor);

        expect(IUD.iudEntidad).toHaveBeenCalledTimes(1);
        expect(resultado).toEqual(mockRespuesta);
    });

    it('Verificar si existe el Profesor en BD - EXISTE', async () => {
        const filtro = { dni: "33762577" };

        const mockRespuesta = {
            error: true,
            message: "PROFESOR ya existe en la base de datos.",
            data: { dni: filtro.dni },
            code: "PROFESOR_EXISTE",
            errorsDetails: undefined,
        };

        (BE.buscarExistenteEntidad as jest.Mock).mockResolvedValue(mockRespuesta);

        const resultado = await dataProfesores.verProfesor(filtro.dni);

        expect(BE.buscarExistenteEntidad).toHaveBeenCalledTimes(1);
        expect(resultado).toEqual(mockRespuesta);
    });

    it('Verificar si existe el Profesor en BD - NO EXISTE', async () => {
        const filtro = { dni: "12345678" };

        const mockRespuesta = {
            error: false,
            message: "Validación exitosa: La entidad PROFESOR no existe.",
            data: [],
            code: "PROFESOR_NO_EXISTE",
            errorsDetails: undefined,
        };

        (BE.buscarExistenteEntidad as jest.Mock).mockResolvedValue(mockRespuesta);

        const resultado = await dataProfesores.verProfesor(filtro.dni);

        expect(BE.buscarExistenteEntidad).toHaveBeenCalledTimes(1);
        expect(resultado).toEqual(mockRespuesta);
    });
});
