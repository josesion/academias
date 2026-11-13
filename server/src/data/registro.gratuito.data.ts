import { tryCatchDatos } from "../utils/tryCatchBD";
import { TipadoData } from "../tipados/tipado.data";
import { buscarExistenteEntidad } from "../hooks/buscarExistenteEntidad";
import { iudEntidadTransaction } from "../hooks/iudEntidadTRansaccion";
import pool from "../bd";
import { RegistroGratuitoInputs } from "../squemas/registro.gratuito";

export interface RegistroGratuitoResult {
    id_escuela: number;
    id_usuario: number;
    usuario: string;
}

const buscarUsuarioExistente = async (usuario: string): Promise<TipadoData<number>> => {
    const sql = `SELECT 1 FROM usuarios WHERE usuario = ? LIMIT 1;`;
    return await buscarExistenteEntidad<number>({
        slqEntidad: sql,
        valores: [usuario],
        entidad: "usuario"
    });
};

const buscarDniExistente = async (dni_propietario: number): Promise<TipadoData<number>> => {
    const sql = `SELECT 1 FROM escuelas WHERE dni_propietario = ? LIMIT 1;`;
    return await buscarExistenteEntidad<number>({
        slqEntidad: sql,
        valores: [dni_propietario],
        entidad: "dni"
    });
};

const buscarCorreoExistente = async (correo: string): Promise<TipadoData<number>> => {
    const sql = `SELECT 1 FROM escuelas WHERE correo = ? LIMIT 1;`;
    return await buscarExistenteEntidad<number>({
        slqEntidad: sql,
        valores: [correo],
        entidad: "correo"
    });
};

const buscarPlanGratuito = async (): Promise<TipadoData<any>> => {
    const sql = `SELECT * FROM planes_saas WHERE (descripcion LIKE '%Plan Gratuito%' OR descripcion LIKE '%acceso completo al Plan Intermedio%') LIMIT 1;`;
    const [rows] = await pool.execute(sql);
    const data = (rows as any[])[0];
    if (!data) {
        return { error: true, message: "Plan no encontrado", code: "PLAN_NO_ENCONTRADO" };
    }
    return { error: false, message: "Plan encontrado", data, code: "PLAN_ENCONTRADO" };
};

const registrarEscuelaGratuita = async (data: RegistroGratuitoInputs & { contrasena: string }): Promise<TipadoData<RegistroGratuitoResult>> => {
    const { razon_social, direccion, celular, correo, rubro, dni_propietario, nombre_propietario, apellido_propietario, usuario, contrasena } = data;

    const sqlInsertEscuela = `INSERT INTO escuelas (dni_propietario, nombre_propietario, apellido_propietario, razon_social, direccion, celular, correo, fecha_registro, baja, rubro) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), 'activos', ?);`;
    const sqlInsertUsuario = `INSERT INTO usuarios (usuario, contrasena, nombre, apellido, celular, rol, correo, estado, id_escuela) VALUES (?, ?, ?, ?, ?, 'usuario', ?, 'activos', ?);`;
    
    const resultado = await iudEntidadTransaction(async (conn) => {
        const [resEscuela] = await conn.execute(sqlInsertEscuela, [dni_propietario, nombre_propietario, apellido_propietario, razon_social, direccion, celular, correo, rubro]);
        const id_escuela = (resEscuela as any).insertId;
        
        const [resUsuario] = await conn.execute(sqlInsertUsuario, [usuario, contrasena, nombre_propietario, apellido_propietario, celular, correo, id_escuela]);
        const id_usuario = (resUsuario as any).insertId;
        
        return { id_escuela, id_usuario, usuario };
    });

    if (resultado.code === "TRANSACCION_OK") {
        return {
            error: false,
            message: "Registro creado correctamente",
            data: resultado.data,
            code: "REGISTRO_GRATUITO_OK"
        };
    }

    return {
        error: true,
        message: "Transaccion fallida",
        code: "TRANSACCION_FALLIDA"
    };
};

const crearSuscripcionGratuita = async (id_escuela: number, id_plan_saas: number): Promise<TipadoData<any>> => {
    const sql = `INSERT INTO suscripciones_escuelas (id_escuela, id_plan_saas, fecha_inscripcion, fecha_vencimiento, estado) VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'activo');`;
    await pool.execute(sql, [id_escuela, id_plan_saas]);
    return { error: false, message: "Suscripción creada", code: "SUSCRIPCION_CREADA" };
};

export const method = {
    buscarUsuarioExistente: tryCatchDatos(buscarUsuarioExistente),
    buscarDniExistente: tryCatchDatos(buscarDniExistente),
    buscarCorreoExistente: tryCatchDatos(buscarCorreoExistente),
    buscarPlanGratuito: tryCatchDatos(buscarPlanGratuito),
    registrarEscuelaGratuita: tryCatchDatos(registrarEscuelaGratuita),
    crearSuscripcionGratuita: tryCatchDatos(crearSuscripcionGratuita),
};
