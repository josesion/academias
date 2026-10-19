import { method as servicioUsuario } from "../src/Servicio/usuario.servicio";
import { method as dataUsuario } from "../src/data/usuario.data";
import { TipadoData } from "../src/tipados/tipado.data";

const modMiPerfil = servicioUsuario.modMiPerfil;

// Mock de la capa data (sin MySQL)
jest.mock("../src/data/usuario.data", () => ({
  method: {
    obtenerMiPerfil: jest.fn(),
    verificarUsuarioExistente: jest.fn(),
    buscarPorCorreo: jest.fn(),
    verificarAlumnoEmailExistente: jest.fn(),
    obtenerDniAlumnoPorEmail: jest.fn(),
    modMiPerfil: jest.fn(),
  },
}));

const dataUsuarioMock = dataUsuario as jest.Mocked<typeof dataUsuario>;

const baseData: any = {
  usuario_id: 1,
  nuevo_usuario: undefined,
  nueva_contrasena: undefined,
  correo: undefined,
  celular: undefined,
  contrasena_actual: undefined,
};

const perfilAlumno: TipadoData<{
  usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  celular: string;
  rol: string;
  id_escuela: number;
}> = {
  error: false,
  message: "Perfil obtenido correctamente",
  data: {
    usuario: "alumno@mail.com",
    nombre: "Juan",
    apellido: "Perez",
    correo: "alumno@mail.com",
    celular: "1234567890",
    rol: "alumno",
    id_escuela: 1,
  },
  code: "PROFILE_FETCHED",
};

const perfilUsuario: TipadoData<{
  usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  celular: string;
  rol: string;
  id_escuela: number;
}> = {
  error: false,
  message: "Perfil obtenido correctamente",
  data: {
    usuario: "juanp",
    nombre: "Juan",
    apellido: "Perez",
    correo: "juan@mail.com",
    celular: "1234567890",
    rol: "usuario",
    id_escuela: 1,
  },
  code: "PROFILE_FETCHED",
};

const exitoTransaccion: TipadoData<any> = {
  error: false,
  message: "Transacción ejecutada con éxito",
  data: {
    usuario: "alumno@mail.com",
    nombre: "Juan",
    apellido: "Perez",
    correo: "alumno@mail.com",
    celular: "1234567890",
    rol: "alumno",
    id_escuela: 1,
  },
  code: "PROFILE_UPDATED",
};

describe("modMiPerfil - casos de validación y transacción", () => {
  beforeEach(() => {
    // resetAllMocks limpia implementaciones y llamadas entre tests
    jest.resetAllMocks();
    // Por defecto, obtenerMiPerfil retorna alumno y modMiPerfil retorna éxito
    dataUsuarioMock.obtenerMiPerfil.mockResolvedValue(perfilAlumno);
    dataUsuarioMock.modMiPerfil.mockResolvedValue(exitoTransaccion);
  });

  it("CASO 1: solo cambiar celular (sin contraseña, sin otros campos) -> 200", async () => {
    const resultado = await modMiPerfil({
      ...baseData,
      celular: "9876543210",
    });

    expect(resultado.code).toBe("PROFILE_UPDATED");
    expect(resultado.error).toBe(false);
    expect(dataUsuarioMock.modMiPerfil).toHaveBeenCalledWith(
      expect.objectContaining({ celular: "9876543210", dni_alumno: undefined })
    );
    // No debe llamar a obtenerDniAlumnoPorEmail (solo cambió celular)
    expect(dataUsuarioMock.obtenerDniAlumnoPorEmail).not.toHaveBeenCalled();
  });

  it("CASO 2: alumno, correo repetido en alumnos.email -> 409 ALUMNO_EMAIL_EXISTE", async () => {
    dataUsuarioMock.obtenerDniAlumnoPorEmail.mockResolvedValue({
      error: false,
      message: "Alumno encontrado",
      data: { dni_alumno: 123 },
      code: "USER_FOUND",
    } as any);
    dataUsuarioMock.buscarPorCorreo.mockResolvedValue({
      error: false,
      message: "Correo disponible",
      code: "EMAIL_AVAILABLE",
    } as any);
    dataUsuarioMock.verificarAlumnoEmailExistente.mockResolvedValue({
      error: true,
      message: "El correo ya está registrado para otro alumno",
      code: "ALUMNO_EMAIL_EXISTE",
    } as any);

    const resultado = await modMiPerfil({
      ...baseData,
      correo: "otroalumno@mail.com",
    });

    expect(resultado.code).toBe("ALUMNO_EMAIL_EXISTE");
    expect(resultado.error).toBe(true);
    expect(dataUsuarioMock.verificarAlumnoEmailExistente).toHaveBeenCalledWith(
      "otroalumno@mail.com",
      123
    );
    expect(dataUsuarioMock.modMiPerfil).not.toHaveBeenCalled();
  });

  it("CASO 3: alumno, nuevo_usuario repetido en usuarios.usuario -> 409 USERNAME_TAKEN", async () => {
    // nuevo_usuario debe ser email válido para alumno
    dataUsuarioMock.verificarUsuarioExistente.mockResolvedValue({
      error: true,
      message: "El nombre de usuario ya está en uso",
      code: "USERNAME_TAKEN",
    } as any);

    const resultado = await modMiPerfil({
      ...baseData,
      nuevo_usuario: "otroalumno@mail.com",
    });

    expect(resultado.code).toBe("USERNAME_TAKEN");
    expect(resultado.error).toBe(true);
    expect(dataUsuarioMock.verificarUsuarioExistente).toHaveBeenCalledWith(
      "otroalumno@mail.com",
      1
    );
    expect(dataUsuarioMock.modMiPerfil).not.toHaveBeenCalled();
  });

  it("CASO 4: alumno, nuevo_usuario repetido en usuarios.email -> 409 EMAIL_TAKEN", async () => {
    dataUsuarioMock.verificarUsuarioExistente.mockResolvedValue({
      error: false,
      message: "Usuario disponible",
      code: "USER_AVAILABLE",
    } as any);
    dataUsuarioMock.buscarPorCorreo.mockResolvedValue({
      error: true,
      message: "El correo ya esta en uso",
      code: "EMAIL_TAKEN",
    } as any);

    const resultado = await modMiPerfil({
      ...baseData,
      nuevo_usuario: "otro@mail.com",
    });

    expect(resultado.code).toBe("EMAIL_TAKEN");
    expect(resultado.error).toBe(true);
    expect(dataUsuarioMock.buscarPorCorreo).toHaveBeenCalledWith("otro@mail.com", 1);
    expect(dataUsuarioMock.modMiPerfil).not.toHaveBeenCalled();
  });

  it("CASO 5: cualquier rol, correo repetido en usuarios.email -> 409 EMAIL_TAKEN", async () => {
    dataUsuarioMock.buscarPorCorreo.mockResolvedValue({
      error: true,
      message: "El correo ya esta en uso",
      code: "EMAIL_TAKEN",
    } as any);

    const resultado = await modMiPerfil({
      ...baseData,
      correo: "otro@mail.com",
    });

    expect(resultado.code).toBe("EMAIL_TAKEN");
    expect(resultado.error).toBe(true);
    expect(dataUsuarioMock.modMiPerfil).not.toHaveBeenCalled();
  });

  it("CASO 6: rol usuario (no alumno), cambiar nuevo_usuario a email valido -> 200", async () => {
    dataUsuarioMock.obtenerMiPerfil.mockResolvedValue(perfilUsuario);
    dataUsuarioMock.verificarUsuarioExistente.mockResolvedValue({
      error: false,
      message: "Usuario disponible",
      code: "USER_AVAILABLE",
    } as any);
    dataUsuarioMock.buscarPorCorreo.mockResolvedValue({
      error: false,
      message: "Correo disponible",
      code: "EMAIL_AVAILABLE",
    } as any);

    const resultado = await modMiPerfil({
      ...baseData,
      nuevo_usuario: "cualquier@mail.com",
    });

    expect(resultado.code).toBe("PROFILE_UPDATED");
    expect(resultado.error).toBe(false);
    expect(dataUsuarioMock.verificarAlumnoEmailExistente).not.toHaveBeenCalled();
    expect(dataUsuarioMock.obtenerDniAlumnoPorEmail).not.toHaveBeenCalled();
  });

  it("CASO 7: alumno, cambio exitoso de correo y usuario -> 200 transaccional con dni_alumno", async () => {
    dataUsuarioMock.obtenerDniAlumnoPorEmail.mockResolvedValue({
      error: false,
      message: "Alumno encontrado",
      data: { dni_alumno: 123 },
      code: "USER_FOUND",
    } as any);
    dataUsuarioMock.verificarAlumnoEmailExistente.mockResolvedValue({
      error: false,
      message: "Email de alumno disponible",
      code: "ALUMNO_EMAIL_AVAILABLE",
    } as any);
    dataUsuarioMock.verificarUsuarioExistente.mockResolvedValue({
      error: false,
      message: "Usuario disponible",
      code: "USER_AVAILABLE",
    } as any);
    dataUsuarioMock.buscarPorCorreo.mockResolvedValue({
      error: false,
      message: "Correo disponible",
      code: "EMAIL_AVAILABLE",
    } as any);

    const resultado = await modMiPerfil({
      ...baseData,
      nuevo_usuario: "nuevo@mail.com",
      correo: "nuevo@mail.com",
    });

    expect(resultado.code).toBe("PROFILE_UPDATED");
    expect(resultado.error).toBe(false);
    expect(dataUsuarioMock.modMiPerfil).toHaveBeenCalledWith(
      expect.objectContaining({ dni_alumno: 123 })
    );
  });

  it("CASO 8: alumno, solo cambiar nuevo_usuario (email valido) -> 200 con dni_alumno resuelto", async () => {
    dataUsuarioMock.obtenerDniAlumnoPorEmail.mockResolvedValue({
      error: false,
      message: "Alumno encontrado",
      data: { dni_alumno: 123 },
      code: "USER_FOUND",
    } as any);
    dataUsuarioMock.verificarUsuarioExistente.mockResolvedValue({
      error: false,
      message: "Usuario disponible",
      code: "USER_AVAILABLE",
    } as any);
    dataUsuarioMock.buscarPorCorreo.mockResolvedValue({
      error: false,
      message: "Correo disponible",
      code: "EMAIL_AVAILABLE",
    } as any);

    const resultado = await modMiPerfil({
      ...baseData,
      nuevo_usuario: "nuevo@mail.com",
    });

    expect(resultado.code).toBe("PROFILE_UPDATED");
    expect(resultado.error).toBe(false);
    expect(dataUsuarioMock.modMiPerfil).toHaveBeenCalledWith(
      expect.objectContaining({ dni_alumno: 123 })
    );
  });
});
