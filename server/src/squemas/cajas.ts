import { z } from "zod";

export const EstadoEnum = z.enum(["abierta" , "cerrada"]);
export const Tipo_movimiento = z.enum(["ingreso" , "egreso"]);
export const VerificarCajaSchema  = z.object({
    id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."), 
        
    estado : EstadoEnum    
});

export const AbrirCajaSchema = z.object({
    id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."), 
   id_usuario: z.number().nullable().default(null), // por el momento quedara en null
   monto_inicial: z.number("El monto inicial debe ser un número válido").min(0),     
});



export const DetalleCajaSchema = z.object({
  id_caja: z.number({ message: "ID de caja requerido" }).positive("ID de caja no válido"),
  
  id_categoria: z.number({ message: "Categoría requerida" }).positive("ID de categoría no válido"),
  
  monto: z.number({ message: "El monto debe ser un número" })
    .min(0.01, "El monto debe ser mayor a cero"),
  
  metodo_pago: z.enum(['efectivo', 'transferencia', 'credito', 'debito'], {
    message: "Seleccione un método de pago válido" 
  }),
  
  descripcion: z.string().optional().default("sin nota"),
  
  referencia_id: z.number().optional().default(0),
});

export const CierreCajaSchema = z.object({
    id_caja: z.number({ message: "ID de caja requerido" }).positive("ID de caja no válido"),
    monto_final_real: z
    .union([z.number(), z.string(), z.undefined(), z.null()])
    .refine((val) => val !== "" && val !== undefined && val !== null, {
        message: "¡Freno! Tenés que poner el monto antes de cerrar",
    })
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val), {
        message: "El monto debe ser un número válido",
    })
    .refine((val) => val >= 0, {
        message: "El monto no puede ser negativo",
    }),
    id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0).")     
});

export const IdCajaAbiertaSchema = z.object({
     id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),    
});

export const PanelMetricasSchema = z.object({
     id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),   
     id_caja: z.number({ message: "ID de caja requerido" }).positive("ID de caja no válido"),      
});

export const listaMovimientosCajaSchema = z.object({
    id_caja: z.coerce.number()
        .int("El ID de la caja debe ser un número entero.")
        .positive("El ID de la caja debe ser positivo (mayor que 0)."),
    limite: z.coerce.number()
        .int("El limite debe ser un numero entero.")
        .nonnegative("El limite no puede ser negativo.")
        .default(20),
        
    offset: z.coerce.number()
        .int("El offset debe ser un numero entero.")
        .nonnegative("El offset no puede ser negativo.")
        .default(0)        
});

export const ListaCategoriaCajaTipoSchema = z.object({
     id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),  
     tipo :  Tipo_movimiento,
     estado :  z.enum(["activos" , "inactivos"], {
        message : "El estado debe ser 'activos' o 'inactivos'"
     })
});

export type IdCajaAbiertaInputs = z.infer<typeof IdCajaAbiertaSchema>;
export type DetalleCajaInputs = z.infer<typeof DetalleCajaSchema>;
export type VerificarCajaInputs = z.infer<typeof VerificarCajaSchema>;
export type AbrirCajaInputs = z.infer<typeof AbrirCajaSchema>;
export type CierreCajaInputs = z.infer<typeof CierreCajaSchema>;
export type PanelMetricasInputs = z.infer<typeof PanelMetricasSchema>;
export type ListaMovimientosCajaInputs = z.infer<typeof listaMovimientosCajaSchema>;
export type ListaCategoriaCajaTipoInputs = z.infer<typeof ListaCategoriaCajaTipoSchema>;
