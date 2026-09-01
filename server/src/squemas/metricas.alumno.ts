import { z } from "zod";


export const MetricasAlumnoSchema   = z.object({
// --- Datos propios del Alumno ---
    dni_alumno: z.number({ message: "El dni es requerido" })
        .min(8, { message: "EL dni esta incompleto" }),          
});


export type MetricasAlumnosInputs = z.infer<typeof MetricasAlumnoSchema>;