import { Request, Response } from "express";

import { enviarResponseError } from "../utils/responseError";
//import { enviarResponse } from "../utils/response";
import { tryCatch } from "../utils/tryCatch";

const ping = async(__req: Request, res: Response) => {
    enviarResponseError(res, 500, "Pong");
    console.log("Pong");
    //enviarResponse(res , 200 ,"mensaje de prueba", { message: "Pong" }, "PING_SUCCESS");
};

const crearEscuela = async (__req: Request, res: Response) =>{
    
};


export const method = {
    ping: tryCatch(ping),
    crearEscuela : tryCatch(crearEscuela),
}; 