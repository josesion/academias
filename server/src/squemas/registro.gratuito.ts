import { z } from "zod";

export const registroGratuitoSchema = z.object({
    razon_social: z.string({ message: "La razón social es obligatoria" }).min(1, "La razón social es obligatoria"),
    direccion: z.string({ message: "La dirección es obligatoria" }).min(1, "La dirección es obligatoria"),
    celular: z.string({ message: "El celular es obligatorio" }).min(1, "El celular es obligatorio"),
    correo: z.string({ message: "El correo es obligatorio" }).email("El correo no es válido"),
    rubro: z.enum(["baile", "gym"], { message: "El rubro es obligatorio" }),
    dni_propietario: z.coerce.number({ message: "El DNI es obligatorio" }).int("El DNI debe ser numérico"),
    nombre_propietario: z.string({ message: "El nombre es obligatorio" }).min(1, "El nombre es obligatorio"),
    apellido_propietario: z.string({ message: "El apellido es obligatorio" }).min(1, "El apellido es obligatorio"),
    usuario: z.string({ message: "El usuario es obligatorio" }).min(1, "El usuario es obligatorio"),
});

export type RegistroGratuitoInputs = z.infer<typeof registroGratuitoSchema>;
