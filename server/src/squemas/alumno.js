"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrearAlumnoSchema = void 0;
const zod_1 = require("zod");
exports.CrearAlumnoSchema = zod_1.z.object({
    dni: zod_1.z.number({ message: "El dni es requerido" })
        .min(8, { message: "EL dni esta incompleto" }),
    nombre: zod_1.z.string({ message: "EL nombre debe ser una cadena de texto" })
        .min(4, { message: "El nombre debe tener min. 4 letras" })
        .max(60, { message: "El nombre es muy largo" }),
    apellido: zod_1.z.string({ message: "EL Apellido debe ser una cadena de texto" })
        .min(4, { message: "El Apellido debe tener min. 4 letras" })
        .max(60, { message: "El Apellido es muy largo" }),
    celular: zod_1.z.string()
        .min(10, { message: "El celular debe tener al menos 10 dígitos" })
        .max(15, { message: "El celular no puede tener más de 15 dígitos" })
        .regex(/^\d+$/, { message: "El celular debe contener solo números" })
});
//# sourceMappingURL=alumno.js.map