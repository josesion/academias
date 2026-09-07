import { getCarrucel, postFlayer, getFlayersEscuela, getAllEscuelas, deletFlayerEscuela } from "../servicio/flayer";
import { useFlayer } from "../hooks/flayers";



export const confiFlayer = ()=>{

    const config ={

        servicios : {
            getCarrucel : getCarrucel,
            postFlayer  : postFlayer,
            getAllEscuelas : getAllEscuelas,
            getFlayersEscuela : getFlayersEscuela,
            deletFlayerEscuela : deletFlayerEscuela,
        },
        plan : 4
    };

    return useFlayer(config)

}