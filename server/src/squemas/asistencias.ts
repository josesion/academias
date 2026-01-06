import { z } from "zod";

//const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const AsistenciaSchema = z.object({
// aca solo tendremos algunos datos ya q los demas estaran en incri de verificacion


    id_horario_clase :  z.coerce.number()
            .int("El ID del id_horario_clase debe ser un número entero.")
            .positive("El ID del id_horario_clase debe ser positivo (mayor que 0)."),      
});

export type AsistenciaInputs = z.infer<typeof AsistenciaSchema>;