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


   id_usuario_apertura: z.coerce.number()
        .int("El ID de usuario debe ser un número entero.")
        .positive("El ID de usuario debe ser positivo (mayor que 0).") 
});



export const DetalleCajaSchema = z.object({
  id_caja: z.number({ message: "ID de caja requerido" }).positive("ID de caja no válido"),

   id_escuela: z.number({ message: "ID de escuela requerido" }).positive("ID de escuela no válido"),
  
  id_categoria: z.number({ message: "Categoría requerida" }).positive("ID de categoría no válido"),

  id_usuario: z.number({ message: "Usuario requerido" }).positive("ID de usuario no válido"),
  
  id_cuenta: z.number({ message: "Categoría requerida" }).positive("ID de categoría no válido"), 

  monto: z.number({ message: "El monto debe ser un número" })
    .min(0.01, "El monto debe ser mayor a cero"),
  

  descripcion: z.string().optional().default("sin nota"),
  
  referencia_id: z.number().optional().default(0),

  id :  z.number().optional(),
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
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),
    id_usuario_cierre: z.coerce.number()
        .int("El ID de usuario debe ser un número entero.")
        .positive("El ID de usuario debe ser positivo (mayor que 0)."),      
});

export const IdCajaAbiertaSchema = z.object({
     id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),
     id_caja: z.coerce.number().refine(val => !isNaN(val), { message: "El ID de caja no puede ser NaN" })
        .int("El ID de la caja debe ser un número entero.")
        .positive("El ID de la caja debe ser positivo (mayor que 0).")
        .optional()
});

export const PanelMetricasSchema = z.object({
     id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),   
     id_caja: z.coerce.number()
        .int("El ID de caja debe ser un número entero.")
        .positive("El ID de caja debe ser positivo (mayor que 0)."),      
});

export const listaMovimientosCajaSchema = z.object({
    id_caja: z.coerce.number().refine(val => !isNaN(val), { message: "El ID de caja no puede ser NaN" })
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

export const listaTipoCuentasSchema = z.object({
      id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),
     
       estado :  z.enum(["activos" , "inactivos"], {
          message : "El estado debe ser 'activos' o 'inactivos'" })    
});

export const MetricasPrincipalSchema = z.object({
    id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),   
        id_caja: z.coerce.number().refine(val => !isNaN(val), { message: "El ID de caja no puede ser NaN" })
        .int("El ID de la caja debe ser un número entero.")
        .positive("El ID de la caja debe ser positivo (mayor que 0)."),    
});


// 1. Definimos el esquema de cada item dentro del array
const ItemDetalleSchema = z.object({
  id_cuenta: z.number().positive("ID de cuenta inválido"),
  nombre_cuenta: z.string().min(1, "El nombre es requerido"),
  monto: z.number().min(0, "El monto no puede ser negativo"),
});

// 2. Definimos el esquema principal
export const AperturaCajaSchema = z.object({
  id_escuela: z.number().positive("ID de escuela requerido"),
  id_usuario :   z.number({message : "id Usuario debe ser numerico"}) 
                 .min(0 , {message : "El id debe ser mayor de 0"})
                 .positive({ message: 'El limite debe ser un número positivo.' }) ,  
  estado: z.enum(["abierta", "cerrada"]).default("abierta"),
  id_usuario_apertura: z.number().positive("ID de usuario requerido"),
  
  // ACÁ ESTÁ EL TRUCO: Usamos .array() del esquema anterior
  detalle: z.array(ItemDetalleSchema).nonempty("Debe haber al menos un detalle de cuenta"),
});



export const ArqueoDetalleItemSchema = z.object({
    id_cuenta: z.coerce.number() 
        .int("El ID de cuenta debe ser entero.")
        .positive(),
    nombre_cuenta: z.string().min(1, "El nombre de la cuenta es requerido."),
    sistema: z.coerce.number(), // Acepta negativos, 0 y positivos por defecto
    
    real: z.coerce.number(),    
    // Quitamos .nonnegative() para permitir valores negativos
    
});

export const CierresCajaSchema = z.object({
    id_escuela: z.coerce.number()
        .int()
        .positive("El ID escuela de cierre es obligatorio."),
    
    id_usuario_cierre: z.coerce.number()
        .int()
        .positive("El ID de usuario de cierre es obligatorio."),

    // Quitamos .nonnegative() para permitir saldos negativos
    monto_final_real: z.coerce.number(),

    // Quitamos .nonnegative() porque el sistema puede marcar balance negativo
    monto_sistema: z.coerce.number(),

    // Detalle de cuentas (reutiliza el que corregimos recién)
    arqueo_detalle: z.array(ArqueoDetalleItemSchema)
        .min(1, "Debe haber al menos un detalle de cuenta para cerrar."),

    observaciones_cierre: z.string()
        .max(1000, "La justificación es demasiado larga.")
        .optional()
        .nullable(),
        
    // Ya permite negativos por defecto
    diferencia_total: z.coerce.number(),
    
    id_caja: z.coerce.number().int().positive(),
    id_usuario :   z.number({message : "id Usuario debe ser numerico"}) 
                 .min(0 , {message : "El id debe ser mayor de 0"})
                 .positive({ message: 'El limite debe ser un número positivo.' }) ,  
});


export const listaTipoCuentasSesionSchema = z.object({
      id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),
      id_usuario :   z.number({message : "id Usuario debe ser numerico"}) 
                 .min(0 , {message : "El id debe ser mayor de 0"})
                 .positive({ message: 'El limite debe ser un número positivo.' }) , 
      id_caja: z.coerce.number().refine(val => !isNaN(val), { message: "El ID de caja no puede ser NaN" })
        .int("El ID de caja debe ser un número entero.")
        .positive("El ID de caja escuela debe ser positivo (mayor que 0).")
        .optional(),                 
});


// ============================================================
// Spec 050 — Transferencias internas y Retenciones en caja
// ============================================================

/**
 * Transferencia entre dos cuentas de la misma escuela.
 *
 * `id_escuela` y `id_usuario` los inyecta el controlador desde el token;
 * el cliente sólo manda caja, cuentas, monto y descripción.
 */
export const TransferenciaCajaSchema = z.object({
    id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),
    id_usuario: z.coerce.number()
        .int("El ID de usuario debe ser un número entero.")
        .positive("El ID de usuario debe ser positivo (mayor que 0)."),
    id_caja: z.coerce.number().refine(val => !isNaN(val), { message: "El ID de caja no puede ser NaN" })
        .int("El ID de caja debe ser un número entero.")
        .positive("El ID de caja debe ser positivo (mayor que 0)."),
    id_cuenta_origen: z.coerce.number()
        .int("El ID de la cuenta de origen debe ser un número entero.")
        .positive("El ID de la cuenta de origen debe ser positivo (mayor que 0)."),
    id_cuenta_destino: z.coerce.number()
        .int("El ID de la cuenta de destino debe ser un número entero.")
        .positive("El ID de la cuenta de destino debe ser positivo (mayor que 0)."),
    monto: z.coerce.number({ message: "El monto debe ser un número" })
        .min(0.01, "El monto debe ser mayor a cero"),
    descripcion: z.string()
        .max(300, "La descripción no puede superar los 300 caracteres")
        .optional()
        .default("Transferencia entre cuentas"),
});

/**
 * Retención de efectivo (egreso "neutro" mientras está activa).
 */
export const RetencionCajaSchema = z.object({
    id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),
    id_usuario: z.coerce.number()
        .int("El ID de usuario debe ser un número entero.")
        .positive("El ID de usuario debe ser positivo (mayor que 0)."),
    id_caja: z.coerce.number().refine(val => !isNaN(val), { message: "El ID de caja no puede ser NaN" })
        .int("El ID de caja debe ser un número entero.")
        .positive("El ID de caja debe ser positivo (mayor que 0)."),
    id_cuenta: z.coerce.number()
        .int("El ID de la cuenta debe ser un número entero.")
        .positive("El ID de la cuenta debe ser positivo (mayor que 0)."),
    monto: z.coerce.number({ message: "El monto debe ser un número" })
        .min(0.01, "El monto debe ser mayor a cero"),
    descripcion: z.string()
        .max(300, "La descripción no puede superar los 300 caracteres")
        .optional()
        .default("Retención de efectivo"),
});

/**
 * Devolución (total o parcial) de una retención.
 *
 * Si `monto_devuelto` es menor al monto original, la diferencia queda como
 * egreso real y `observacion` pasa a ser obligatoria (se valida en el servicio).
 */
export const DevolverRetencionSchema = z.object({
    id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),
    id_usuario: z.coerce.number()
        .int("El ID de usuario debe ser un número entero.")
        .positive("El ID de usuario debe ser positivo (mayor que 0)."),
    id_movimiento: z.coerce.number()
        .int("El ID del movimiento debe ser un número entero.")
        .positive("El ID del movimiento debe ser positivo (mayor que 0)."),
    monto_devuelto: z.coerce.number({ message: "El monto devuelto debe ser un número" })
        .min(0, "El monto devuelto no puede ser negativo"),
    observacion: z.string()
        .max(500, "La observación no puede superar los 500 caracteres")
        .optional()
        .nullable(),
});

/**
 * Justificación de una retención que no se devuelve.
 * La observación es obligatoria.
 */
export const JustificarRetencionSchema = z.object({
    id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),
    id_usuario: z.coerce.number()
        .int("El ID de usuario debe ser un número entero.")
        .positive("El ID de usuario debe ser positivo (mayor que 0)."),
    id_movimiento: z.coerce.number()
        .int("El ID del movimiento debe ser un número entero.")
        .positive("El ID del movimiento debe ser positivo (mayor que 0)."),
    justificacion: z.string({ message: "La observación es obligatoria" })
        .trim()
        .min(1, "La observación es obligatoria")
        .max(500, "La observación no puede superar los 500 caracteres"),
});

/**
 * Consulta de retenciones activas de una caja.
 */
export const RetencionesActivasSchema = z.object({
    id_escuela: z.coerce.number()
        .int("El ID de la escuela debe ser un número entero.")
        .positive("El ID de la escuela debe ser positivo (mayor que 0)."),
    id_caja: z.coerce.number().refine(val => !isNaN(val), { message: "El ID de caja no puede ser NaN" })
        .int("El ID de caja debe ser un número entero.")
        .positive("El ID de caja debe ser positivo (mayor que 0)."),
});

export type AperturaCajaInput = z.infer<typeof AperturaCajaSchema>;
export type CierresCajaInputs = z.infer<typeof CierresCajaSchema>;
export type IdCajaAbiertaInputs = z.infer<typeof IdCajaAbiertaSchema>;
export type DetalleCajaInputs = z.infer<typeof DetalleCajaSchema>;
export type VerificarCajaInputs = z.infer<typeof VerificarCajaSchema>;
export type AbrirCajaInputs = z.infer<typeof AbrirCajaSchema>;
export type CierreCajaInputs = z.infer<typeof CierreCajaSchema>;
export type PanelMetricasInputs = z.infer<typeof PanelMetricasSchema>;
export type ListaMovimientosCajaInputs = z.infer<typeof listaMovimientosCajaSchema>;
export type ListaCategoriaCajaTipoInputs = z.infer<typeof ListaCategoriaCajaTipoSchema>;
export type ListaTipoCuentasInputs =z.infer<typeof listaTipoCuentasSchema>;
export type MetricasPrincipalInputs =z.infer<typeof MetricasPrincipalSchema>;
export type CuentasSesionInputs =z.infer<typeof listaTipoCuentasSesionSchema>;
export type TransferenciaCajaInputs = z.infer<typeof TransferenciaCajaSchema>;
export type RetencionCajaInputs = z.infer<typeof RetencionCajaSchema>;
export type DevolverRetencionInputs = z.infer<typeof DevolverRetencionSchema>;
export type JustificarRetencionInputs = z.infer<typeof JustificarRetencionSchema>;
export type RetencionesActivasInputs = z.infer<typeof RetencionesActivasSchema>;