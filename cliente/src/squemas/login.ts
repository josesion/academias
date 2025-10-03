import { z } from "zod";

export const loginSchema = z.object({
    usuario : z.string({ message: "El usuario es requerido" })
                .min(6, { message: "El usuario debe tener al menos 6 caracteres" })
                .max(100, { message: "El usuario debe tener como máximo 100 caracteres" }),
    contrasena: z.string({ message: "La contraseña es requerida" })
                .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
                .max(100, { message: "La contraseña debe tener como máximo 100 caracteres" })
});

export type LoginInputs = z.infer<typeof loginSchema>;