import { Response, Request} from "express";
import { tryCatch } from "../utils/tryCatch";


const postFlayer = async( req : Request, res: Response) =>{

  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  res.status(200).json({
    mensaje: "Llegó la petición",
  });

};

export const method = {
    postFlayer : tryCatch( postFlayer ),

};