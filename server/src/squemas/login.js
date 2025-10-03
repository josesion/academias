"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    usuario: zod_1.z.string({ message: "El usuario es requerido" })
        .min(6, { message: "El usuario debe tener al menos 6 caracteres" })
        .max(100, { message: "El usuario debe tener como máximo 100 caracteres" }),
    contrasena: zod_1.z.string({ message: "La contraseña es requerida" })
        .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
        .max(100, { message: "La contraseña debe tener como máximo 100 caracteres" })
});
//# sourceMappingURL=login.js.map