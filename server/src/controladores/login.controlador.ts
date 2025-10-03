
import { Response, Request } from "express";

import { tryCatch } from "../utils/tryCatch";
import { enviarResponse } from "../utils/response";
import { generateToken, crearCookie } from "../utils/jwt";
import { method as dataLogin } from "../data/login.data";

import { loginSchema, LoginInputs } from "../squemas/login";


const login = async( req: Request, res: Response ) =>{
    const loginData: LoginInputs = loginSchema.parse(req.body);

    const resultado = await dataLogin.login( loginData );

    if (resultado.code === "LOGIN_SUCCESS" && resultado.data && !Array.isArray(resultado.data)) {  
        
        const token = generateToken({ id: resultado.data.usuario });
        const cookieOptions = crearCookie();
        res.cookie("token", token, cookieOptions);
    }
    return enviarResponse(res, 200, resultado.message, resultado.data, undefined, resultado.code);
}

export const method ={
    login : tryCatch( login )
};