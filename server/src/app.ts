import express, {Express, NextFunction, Response , Request} from "express";
import { z } from "zod";
import cookieParser from "cookie-parser";
import cors from "cors";

import { ClientError } from "./utils/error";
import { enviarResponseError } from "./utils/responseError";

import adminRutas from "./rutas/admin.ruta";
import usuarioRutas from "./rutas/usuario.ruta";
import planesRutas from "./rutas/plan.ruta";
import loginRutas from "./rutas/login.rutas";
import alumnoRutas from "./rutas/alumno.ruta";

import protectRutas from "./rutas/protegida.rutas";



const app : Express = express();

app.use(cors({
    origin : "http://localhost:5173",
    credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use(alumnoRutas);
app.use(protectRutas)
app.use(adminRutas);
app.use(planesRutas);
app.use(usuarioRutas);
app.use(loginRutas);




app.use((err : Error , __req : Request, res : Response , __next : NextFunction)=>{

    let statusCode = 500;
    let message = "Error interno del servidor";
    let code = "INTERNAL_SERVER_ERROR";
    let errorsDetails: any[] | undefined = undefined;

        if (err instanceof ClientError) {
            statusCode = err.statusCode;
            message = err.message;
            code = err.code;
        }else if (err instanceof z.ZodError) {
            statusCode = 400;
            message = "Error de validación de datos";
            code = "VALIDATION_ERROR";

        errorsDetails = (err as z.ZodError).issues.map(zodIssue => ({
            campo: zodIssue.path.join('.'),
            message: zodIssue.message,
            code: zodIssue.code
        }));
        //console.error("Zod Validation Error:", errorsDetails);
        }else{
            console.error("Server Error no manejado:", err);
        }

    enviarResponseError(res, statusCode, message, code, errorsDetails );

});





export default app;