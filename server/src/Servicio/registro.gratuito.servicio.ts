import { tryCatchDatos } from "../utils/tryCatchBD";
import { method as dataRegistro } from "../data/registro.gratuito.data";
import { registroGratuitoSchema, RegistroGratuitoInputs } from "../squemas/registro.gratuito";
import { TipadoData } from "../tipados/tipado.data";
import bcrypt from "bcryptjs";
import { enviarCorreo, generarPlantillaBienvenida, generarTextoBienvenida } from "../utils/emailService";
import { RegistroGratuitoResult } from "../data/registro.gratuito.data";

const generarContrasenaAleatoria = (): string => {
    let pass = "";
    for (let i = 0; i < 8; i++) {
        pass += Math.floor(Math.random() * 10).toString();
    }
    return pass;
};

/**
 * Verifica si un nombre de usuario ya está tomado.
 *
 * Devuelve siempre un 200 (el mapa traduce ambos códigos a `OK`); el cliente
 * decide según `data.disponible`. Antes los códigos no estaban mapeados y
 * `handleControladores` respondía 500 en todos los casos.
 */
const disponibilidadUsuario = async (params: { usuario: string }): Promise<TipadoData<{ disponible: boolean; usuario: string }>> => {
    const { usuario } = params;
    const res = await dataRegistro.buscarUsuarioExistente(usuario);
    if (res.code === "USUARIO_EXISTE") {
        return {
            error: false,
            message: "Usuario no disponible",
            data: { disponible: false, usuario },
            code: "USUARIO_NO_DISPONIBLE"
        };
    }
    return {
        error: false,
        message: "Usuario disponible",
        data: { disponible: true, usuario },
        code: "USUARIO_DISPONIBLE"
    };
};

const registroGratuito = async (data: RegistroGratuitoInputs): Promise<TipadoData<RegistroGratuitoResult>> => {
    const inputs = registroGratuitoSchema.parse(data);

    const [resUsuario, resDni, resCorreo, resPlan] = await Promise.all([
        dataRegistro.buscarUsuarioExistente(inputs.usuario),
        dataRegistro.buscarDniExistente(inputs.dni_propietario),
        dataRegistro.buscarCorreoExistente(inputs.correo),
        dataRegistro.buscarPlanGratuito()
    ]);

    if (resUsuario.code === "USUARIO_EXISTE") {
        return { error: true, message: "El usuario ya existe", code: "USUARIO_EXISTE" };
    }
    if (resDni.code === "DNI_EXISTE") {
        return { error: true, message: "El DNI ya está registrado", code: "DNI_YA_REGISTRADO" };
    }
    if (resCorreo.code === "CORREO_EXISTE") {
        return { error: true, message: "El correo ya está registrado", code: "CORREO_YA_REGISTRADO" };
    }
    if (resPlan.code === "PLAN_NO_ENCONTRADO") {
        return { error: true, message: "Plan gratuito no encontrado", code: "PLAN_NO_ENCONTRADO" };
    }

    const contrasenaAleatoria = generarContrasenaAleatoria();
    const hash = await bcrypt.hash(contrasenaAleatoria, 10);

    const resRegistro = await dataRegistro.registrarEscuelaGratuita({ ...inputs, contrasena: hash } as any);
    if (resRegistro.code !== "REGISTRO_GRATUITO_OK" || !resRegistro.data) {
        return resRegistro;
    }

    await dataRegistro.crearSuscripcionGratuita(resRegistro.data.id_escuela, resPlan.data.id_plan);

    try {
        const html = generarPlantillaBienvenida(inputs.nombre_propietario + " " + inputs.apellido_propietario, inputs.usuario, contrasenaAleatoria, inputs.razon_social);
        const text = generarTextoBienvenida(inputs.nombre_propietario + " " + inputs.apellido_propietario, inputs.usuario, contrasenaAleatoria, inputs.razon_social);
        await enviarCorreo({ to: inputs.correo, subject: "Acceso a tu academia - Plan Gratuito", html, text });
    } catch (e) {
        console.error("Error enviando correo de registro gratuito", e);
    }

    return resRegistro;
};

export const method = {
    disponibilidadUsuario: tryCatchDatos(disponibilidadUsuario),
    registroGratuito: tryCatchDatos(registroGratuito),
};
