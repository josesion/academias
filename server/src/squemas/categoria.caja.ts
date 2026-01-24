import { z } from "zod";

const EstadoEnum = z.enum(["activos", "inactivos"]);
const TipoMovimientoEnum = z.enum(["ingreso", "egreso" ]);

export const CategoriaCajaSchema = z.object({
    id_escuela : z.number().int().positive(),
    nombre_categoria: z.string().min(1),
    tipo_movimiento: TipoMovimientoEnum,
    estado: EstadoEnum.default("activos"),
});

export const ModCategoriaCajaSchema = z.object({
    id_escuela : z.number().int().positive(),
    id_categoria : z.number().int().positive(),
    nombre_categoria: z.string().min(1),
    tipo_movimiento: TipoMovimientoEnum,
    estado: EstadoEnum
});

export const  BajaCategoriaCajaSchema = z.object({
    id_escuela : z.number().int().positive(), 
    id_categoria : z.number().int().positive(),
    estado: EstadoEnum,
});

export const ListaCategoriaCajaSchema = z.object({

        nombre_categoria   : z.string().optional().default(''),
        tipo_movimiento:  z.enum(["ingreso", "egreso", "%" ]),
        estado     : EstadoEnum,  

        id_escuela :    z.number({message : "Ident. Escuela debe ser numerico"})
                    .int({message : "Ident. Escuela debe ser entero"})
                    .positive({ message : "Ident. Escuela debe ser positivo"}),

        limit: z.coerce.number().int().min(1).default(10), 
        pagina : z.coerce.number().int().min(1).default(10), 
        offset: z.coerce.number().int().min(0).default(0),     
});


export type CategoriaCajaInpurts = z.infer<typeof CategoriaCajaSchema>;
export type ModCategoriaCajaInputs = z.infer<typeof ModCategoriaCajaSchema>; 
export type BajaCategoriCajaInputs  = z.infer<typeof BajaCategoriaCajaSchema>; 
export type ListadoCategoriaCajaInputs  = z.infer<typeof ListaCategoriaCajaSchema>;