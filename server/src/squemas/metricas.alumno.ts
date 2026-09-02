import { z } from "zod";


export const MetricasAlumnoSchema = z.object({
    // --- Datos propios del Alumno ---
    correo: z.string({ message: "El correo es requerido" })
        .email({ message: "El formato del correo no es válido" }),         
});


export type MetricasAlumnosInputs = z.infer<typeof MetricasAlumnoSchema>;