import { z } from "zod";

/**
 * Validaciones auxiliares
 */

export const DiaSemanaEnum = z.enum([
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
]);
export const EstadoEnum = z.enum(["activos", "inactivos", "suspendido"]);
//const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const AsistenciaSchema = z.object({
// aca solo tendremos algunos datos ya q los demas estaran en incri de verificacion


    id_horario_clase :  z.coerce.number()
            .int("El ID del id_horario_clase debe ser un número entero.")
            .positive("El ID del id_horario_clase debe ser positivo (mayor que 0)."),      
});

export const ClaseActualSchema = z.object({
    id_escuela: z.number().int().positive(),    
    estado : EstadoEnum,
    dia : DiaSemanaEnum 
});

export const ClaseProximaSchema = z.object({
    id_escuela: z.number().int().positive(),    
    estado : EstadoEnum, 
    dia : DiaSemanaEnum
});



export type AsistenciaInputs = z.infer<typeof AsistenciaSchema>;
export type ClasesActualInputs = z.infer<typeof ClaseActualSchema>;
export type ClasesProximaInputs = z.infer<typeof ClaseProximaSchema>;