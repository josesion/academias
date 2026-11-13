"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listaPlanesSchema = exports.modPlanesSchema = exports.crearPlanesSchema = void 0;
const zod_1 = require("zod");
exports.crearPlanesSchema = zod_1.z.object({
    descripcion: zod_1.z.string({ message: "Debe ser una cadena de texto." })
        .min(6, { message: 'la descripcion  debe tener al menos 6 caracteres.' })
        .max(50, { message: 'la descripcion no puede exceder los 50 caracteres.' }),
    limites_cedes: zod_1.z.number({ message: 'Debe ser un valor númerico.' })
        .min(1, { message: 'El limite de cedes debe ser al menos 1.' })
        .max(10, { message: 'El limite de cedes no puede exceder los 10.' }),
    precio_mensual: zod_1.z.number({ message: 'Debe ser un valor númerico.' })
        .min(1, { message: 'El precio debe ser al menos 1$.' })
        .max(1000000, { message: 'El precio no puede exceder los 100000$.' })
        .default(1000),
    estado: zod_1.z.string()
        .min(5, { message: 'El estado debe tener al menos 5 caracteres.' })
        .max(20, { message: 'El estado no puede exceder los 20 caracteres.' })
        .default('activo') // Por defecto el estado es activo           
});
exports.modPlanesSchema = zod_1.z.object({
    // El 'id' es obligatorio para saber qué plan actualizar.
    id: zod_1.z.number({ message: 'El ID debe ser un valor numérico.' })
        .int({ message: 'El ID debe ser un número entero.' })
        .positive({ message: 'El ID debe ser un número positivo.' }),
    // Los campos de actualización son opcionales
    descripcion: zod_1.z.string({ message: "Debe ser una cadena de texto." })
        .min(6, { message: 'la descripcion debe tener al menos 6 caracteres.' })
        .max(50, { message: 'la descripcion no puede exceder los 50 caracteres.' }),
    limites_cedes: zod_1.z.number({ message: 'Debe ser un valor númerico.' })
        .min(1, { message: 'El limite de cedes debe ser al menos 1.' })
        .max(10, { message: 'El limite de cedes no puede exceder los 10.' }),
    precio_mensual: zod_1.z.number({ message: 'Debe ser un valor númerico.' })
        .min(1, { message: 'El precio debe ser al menos 1$.' })
        .max(1000000, { message: 'El precio no puede exceder los 100000$.' }),
    estado: zod_1.z.string()
        .min(5, { message: 'El estado debe tener al menos 5 caracteres.' })
        .max(20, { message: 'El estado no puede exceder los 20 caracteres.' })
});
exports.listaPlanesSchema = zod_1.z.object({
    estado: zod_1.z.string({ message: "El estado debe ser un valor de texto" })
        .min(6, { message: "El estado debe tener al menos  6 caracteres" })
        .max(20, { message: "El estado debe tener menos de 20 caracteres" }),
    orden: zod_1.z.enum(['descripcion', 'precio_mensual'], {
        message: "El orden solo puede ser 'descripcion' o 'precio_mensual'."
    }),
    descripcion: zod_1.z.string({ message: "La descripcion debe ser una cadena de texto" })
        .min(1, { message: "La descripcion no debe ser una cadena vacia" }),
    limit: zod_1.z.number({ message: "Limit debe ser de tipo numerico" })
        .int({ message: 'El limite debe ser un número entero.' })
        .positive({ message: 'El limite debe ser un número positivo.' }),
    offset: zod_1.z.number({ message: "Limit debe ser de tipo numerico" })
        .int({ message: 'El offset debe ser un número entero.' })
        .min(0, { message: 'El offset debe ser un número  mayor a 0.' })
});
//# sourceMappingURL=planes.js.map