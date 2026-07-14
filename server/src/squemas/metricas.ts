import { z } from "zod";


export const MetricasSchema =  z.object({
     id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),  
});

export type MetricaInputs =  z.infer<typeof MetricasSchema>;