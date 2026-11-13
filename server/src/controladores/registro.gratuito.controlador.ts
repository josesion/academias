import { Request, Response } from "express";
import { handleControladores } from "../utils/handleControladores";
import { tryCatch } from "../utils/tryCatch";
import { method as servicioRegistro } from "../Servicio/registro.gratuito.servicio";
import { MAPA_REGISTRO_GRATUITO } from "../respuestas/registro.gratuito";

const disponibilidadUsuario = async (req: Request, res: Response) => {
    const data = { usuario: req.params.usuario };
    await handleControladores(res, data, servicioRegistro.disponibilidadUsuario, MAPA_REGISTRO_GRATUITO);
};

const registroGratuito = async (req: Request, res: Response) => {
    const data = req.body;
    await handleControladores(res, data, servicioRegistro.registroGratuito, MAPA_REGISTRO_GRATUITO);
};

export const method = {
    disponibilidadUsuario: tryCatch(disponibilidadUsuario),
    registroGratuito: tryCatch(registroGratuito),
};
