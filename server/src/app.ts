import express, {Express, NextFunction, Response , Request} from "express";
import { z } from "zod";
import cookieParser from "cookie-parser";
import cors from "cors";


import { ClientError } from "./utils/error";
import { enviarResponseError } from "./utils/responseError";
import { registroPeticion, obtenerRuta } from "./middleware/registroPeticion";


/**  RUTAS PARA EL ADMINISTRATIVO DE LA APP */

import planesUsuariosRuta from "./rutas/planes.usuarios";
import adminRutas from "./rutas/admin.ruta";
import usuarioRutas from "./rutas/usuario.ruta";
import planesRutas from "./rutas/plan.ruta";
import loginRutas from "./rutas/login.rutas";
import alumnoRutas from "./rutas/alumno.ruta";
import profesorRutas from "./rutas/profesores.ruta";
import nivelRutas from "./rutas/nivel.ruta";
import tipoRutas from  "./rutas/tipo.ruta";
import categoriasCajasRutas from "./rutas/categorias.cajas";
import cuentasCajaRutas  from "./rutas/cuentas.escuelas";

import cajasRutas from "./rutas/caja.rutas"

import inscripciones from "./rutas/inscripciones";
import horarios from "./rutas/horarios.ruta";
import asistencias  from "./rutas/asistencias";
import metricas  from "./rutas/metricas.ruta";
import listaCajas from "./rutas/listaCaja.ruta";

import historial from "./rutas/historial.ruta";
import flayer   from "./rutas/flayer.ruta";
import logEventosRutas from "./rutas/log.ruta";


import protectRutas from "./rutas/protegida.rutas";
/** RUTAS PARA EL ALUMNO  */

import  principalAlumnos from "./rutas/metricas.alumnos.principal.rutas";

/** RUTAS ADMINISTRADOR */

import  administradorPlanes from "./rutas/planes_saas.ruta";
import  subcripciones from "./rutas/supcripcion.escuelas";
import  usuarioAdmin from "./rutas/usuarioAdmin.ruta";


const app : Express = express();

// Sin ETag: el de Express (weak) hace que el navegador cachee los GET y
// revalide con `If-None-Match`, y el server le conteste 304 SIN CUERPO. El
// `apiFetch` del cliente ve `!response.ok` y lo trata como error, así que las
// métricas y los listados se vaciaban al azar con un "Error HTTP 304". Sin
// ETag no hay revalidación y el `logs_eventos` registra el status real (200).
app.disable("etag");

// Y sin caché, para que el browser no reintente nunca contra el servidor.
// Se aplica a TODO (incluido el 204 de "sin eventos"), que no tiene ETag igual.
app.use(( _req , res , next )=>{
    res.setHeader("Cache-Control", "no-store");
    next();
});



import logger from "./utils/logger";

 
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://192.168.0.26:5173"
    ],
    credentials: true
}));

/** 
app.use(cors({
    origin: "https://academias-client-production.up.railway.app",
    credentials: true,
}));
*/

app.use(express.json());
app.use(cookieParser());

// Registra TODA petición en `logs_eventos` (sale de acá solo el método, la ruta,
// el estado y la duración; nunca headers, cookies ni body)
app.use(registroPeticion);

app.use(alumnoRutas);
app.use(profesorRutas)
app.use(adminRutas);
app.use(planesRutas);
app.use(usuarioRutas);
app.use(loginRutas);    
app.use(planesUsuariosRuta);
app.use(nivelRutas);
app.use(tipoRutas);
app.use(asistencias);
app.use(categoriasCajasRutas);
app.use(cuentasCajaRutas);

app.use(cajasRutas);

app.use(inscripciones);
app.use(horarios);
app.use(metricas);
app.use(protectRutas);
app.use(listaCajas)
app.use(historial);
app.use(flayer);

// RUTAS ALUMNOS

app.use(principalAlumnos);

// RUTAS ADMINISTRADOR

app.use(administradorPlanes);
app.use(subcripciones);
app.use(usuarioAdmin);

// RUTA DE EVENTOS DEL SISTEMA (logs)
app.use(logEventosRutas);

app.use((err : Error , __req : Request, res : Response , __next : NextFunction)=>{

    let statusCode = 500;
    let message = "Error interno del servidor";
    let code = "INTERNAL_SERVER_ERROR";
    let errorsDetails: any[] | undefined = undefined;

    
        if (err instanceof ClientError) {
            statusCode = err.statusCode;
            message = err.message;
            code = err.code;
        }
        else if (err instanceof z.ZodError) {
            statusCode = 400;
            message = "Error de validación de datos";
            code = "VALIDATION_ERROR";

        errorsDetails = (err as z.ZodError).issues.map(zodIssue => ({
            campo: zodIssue.path.join('.'),
            message: zodIssue.message,
            code: zodIssue.code
        }))
        //  intercepta errores de parseo JSON. del body (ej: `{ "id_plan" : , }`)
        }
        else if (err instanceof SyntaxError && (err as any).status === 400 && 'body' in err) {
             statusCode = 400 ,
             message    =  "Error de sintaxis JSON: El cuerpo de la solicitud no es un JSON válido.", 
             code = "INVALID_JSON_SYNTAX"          
        }else{
            // 1. La identidad sale SIEMPRE del token (`req.usuario`, que completa
                //    `permisos.validarPermiso`), nunca del body ni del query: esos
                //    los manda el cliente y en un GET no existen. Sin sesión
                //    (rutas públicas: login, /api/verificar) queda N/A + Anónimo.
                const id_escuela = __req.usuario?.id_escuela ?? null;
                const id_usuario = __req.usuario?.id ?? null;

                // Snapshot del login: así el evento conserva el nombre aunque la
                // cuenta se renombre o se borre después (la tabla no tiene FK)
                const usuarioNom = __req.usuario?.usuario ?? null;

                // 2. Para el texto del mensaje los ausentes se leen mejor así
                const escuelaTexto = id_escuela ?? "N/A";
                const usuarioTexto = usuarioNom ?? "Anónimo";

                // 3. El logger ahora guarda todo el "ADN" del error
                const rutaError = obtenerRuta(__req);

                logger.error(`[${__req.method}] ${rutaError} | Escuela: ${escuelaTexto} | User: ${usuarioTexto}`, { 
                    origen: "peticion",
                    metodo_http: __req.method,
                    ruta: rutaError,
                    id_escuela,
                    id_usuario,
                    usuario_nom: usuarioNom,
                    mensaje: err.message,
                    stack: err.stack 
                });
        };

    enviarResponseError(res, statusCode, message, code, errorsDetails );

});

export default app;