import { z } from "zod";


export const MetricasAlumnoSchema = z.object({
    // --- Datos propios del Alumno ---
    correo: z.string({ message: "El correo es requerido" })
        .email({ message: "El formato del correo no es válido" }),         
});

export const DataEscuelaSchema = z.object({
    id_escuela: z.number({ message: "id Escuela debe ser numerico" })
        .min(1, { message: "El id debe ser mayor o igual a 1" }), 
    correo: z.string({ message: "El correo es requerido" })
        .email({ message: "El formato del correo no es válido" }),       
        
});

export const IdEscuelaSchema = z.object({
    id_escuela: z.number({ message: "id Escuela debe ser numerico" })
        .min(1, { message: "El id debe ser mayor o igual a 1" }), 
            
});


export type MetricasAlumnosInputs = z.infer<typeof MetricasAlumnoSchema>;
export type DataEscuelaInputs = z.infer<typeof DataEscuelaSchema>;
export type IdEscuelaInputs = z.infer<typeof IdEscuelaSchema>;