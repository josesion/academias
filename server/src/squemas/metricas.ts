import { z } from "zod";


export const MetricasSchema = z.object({
    id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),
        tipo: z.string().min(1, "El tipo no puede estar vacío.")
});

export const IdEscuelaSchema = z.object({
    id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0).")
});

export type MetricaInputs =  z.infer<typeof MetricasSchema>;
export type IdEscuelaInputs =  z.infer<typeof IdEscuelaSchema>;