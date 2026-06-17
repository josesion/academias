import { obtenerIdCaja } from "../servicio/caja.fetch";

export const idCajaFuntion = async () => {
    try {
        const idCajaResult = await obtenerIdCaja(  );

        if (idCajaResult.code === "ID_CAJA_OK" && 'data' in idCajaResult) {
            return idCajaResult.data.id_caja;
        }

        return null;
    } catch (error) {
        //console.error("Error en idCaja:", error);
        return null;
    }
};