import { z } from 'zod';

export const CuentaEscuelaSchema = z.object({
  // .positive() asegura que el ID sea mayor a 0
  id_cuenta: z.number().positive("ID inválido").optional(),
  
  // El ID de escuela siempre debe ser un número positivo
  id_escuela: z.number().positive("ID de escuela requerido"),

  // Mínimo 4 caracteres para el nombre de la cuenta
  nombre_cuenta: z.string().min(4, "Mínimo 4 caracteres"),

  // Enums limpios para MySQL
  tipo_cuenta: z.enum(['fisico', 'virtual']),
  
  // Tu regla de oro: 'activos' o 'inactivos'
  estado: z.enum(['activos', 'inactivos']).default('activos'),
});

export type CuentaEscuelaInput = z.infer<typeof CuentaEscuelaSchema>;