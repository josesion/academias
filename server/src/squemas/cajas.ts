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
        id_caja: z.coerce.number()
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
    sistema: z.coerce.number(), // Puede ser 0 o positivo
    real: z.coerce.number()
        .nonnegative("El monto real no puede ser negativo."),
    dif: z.coerce.number() // Puede ser negativo (faltante) o positivo (sobrante)
});

export const CierresCajaSchema = z.object({
    id_escuela: z.coerce.number()
        .int()
        .positive("El ID escuela de cierre es obligatorio."),
    id_usuario_cierre: z.coerce.number()
        .int()
        .positive("El ID de usuario de cierre es obligatorio."),

    monto_final_real: z.coerce.number()
        .nonnegative("El monto final real no puede ser negativo."),

    monto_sistema: z.coerce.number()
        .nonnegative("El monto sistema no puede ser negativo."),


    // Aquí validamos que sea un array y que cumpla con el esquema anterior
    arqueo_detalle: z.array(ArqueoDetalleItemSchema)
        .min(1, "Debe haber al menos un detalle de cuenta para cerrar."),

    observaciones_cierre: z.string()
        .max(1000, "La justificación es demasiado larga.")
        .optional()
        .nullable(),

        
    // La diferencia total la podemos recibir o calcular en el back
    diferencia_total: z.coerce.number(),
    
    // El id_caja suele venir por params, pero si lo mandas por body:
    id_caja: z.coerce.number().int().positive()
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
