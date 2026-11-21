import { useContext } from "react";
import { RutasProtegidasContext } from "../contexto/protectRutas";

import { listadoTipoSinPaginacion } from "../servicio/tipo.fetch";
import { listadoProfesoresSinPag } from "../servicio/profesor.usuarios";
import { listarSalasSinPag } from "../servicio/salas.fetch";
import { calendarioGym, altaHorarioGym, modHorarioGym, eliminarHorarioGym } from "../servicio/horario_gym.fetch";

import { useHorarioGymHook } from "../hooks/horariosGym";

import type { Horas, DiaSemana } from "../tipadosTs/horario_gym";

export const HORARIOS: Horas[] = [
    "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00", "19:00",
    "20:00", "21:00", "22:00", "23:00",
];

export const DIAS_SEMANA: DiaSemana[] = [
    "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo",
];

export const useHorariosGym = () => {
    const { rol } = useContext(RutasProtegidasContext);

    const config = {
        servicios: {
            listadoTipo: listadoTipoSinPaginacion,
            listadoProfesores: listadoProfesoresSinPag,
            listadoSalas: listarSalasSinPag,
            altaHorarioGym,
            modHorarioGym,
            eliminarHorarioGym,
            calendarioGym,
            HORARIOS,
            DIAS_SEMANA,
        },
        inicialFiltroProfesor: { dni: "" },
        inicialFiltroSala: { nombre: "" },
        inicialFiltroTipo: { tipo: "" },
    };

    return useHorarioGymHook(config);
};
