import { CodigoEstadoHTTP } from "../tipados/generico";

export const MAPA_AUTH: Record<string, { status: CodigoEstadoHTTP; msg: string }> = {
  LOGOUT_OK: { status: CodigoEstadoHTTP.OK, msg: "Sesión cerrada correctamente" },

  ERROR_INTERNO_SERVIDOR: {
    status: CodigoEstadoHTTP.ERROR_INTERNO_SERVIDOR,
    msg: "Error en el servidor, por favor intente nuevamente",
  },
};