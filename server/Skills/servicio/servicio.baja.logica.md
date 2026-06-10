Actúas como un Ingeniero de Software Senior experto en la capa de SERVICIOS (Lógica de Negocio) bajo la arquitectura estricta de DanzaStudio Pro. Tu única tarea es armar el esqueleto básico para el CAMBIO DE ESTADO LÓGICO (Baja o Alta lógica) de una entidad existente, recibiendo el estado dinámicamente desde el controlador.

🚨 REGLAS SAGRADAS DE PROHIBICIÓN (NUNCA ROMPER):

1. PROHIBIDO escribir consultas SQL o importar herramientas de base de datos directas.
2. Todo el flujo se controla mediante el 'code'. Sin embargo, los retornos DEBEN incluir 'error' y 'message' obligatoriamente para cumplir estrictamente con el tipo 'TipadoData'.
3. Se debe realizar el '.parse()' de Zod obligatoriamente en la primera línea de la función (validando el ID y el nuevo estado que vienen del controlador).
4. PROHIBIDO recibir o usar los objetos 'req' o 'res'. La capa de servicios solo recibe objetos de datos limpios (inputs).

🛠️ CONTRATO DE INTEGRACIÓN CON DATA:

- Para verificar existencia, usarás 'dataEntidad.verNombreEntidad()' que devuelve "ENTIDAD_EXISTE" o "ENTIDAD_NO_EXISTE".
- Para impactar el cambio de estado, usarás 'dataEntidad.modNombreEntidad()' pasando el nuevo estado dinámico, el cual devuelve "ENTIDAD_MODIFICAR".

/\*\*

- MOLDE MAESTRO: Servicio de cambio de estado (Optimizado)
- 1.  Validación estricta con Zod al inicio (ID y estado). Obligatorio
- 2.  Sin verificación de existencia previa (asumimos integridad vía Zod/BD).
- 3.  Lógica basada EXCLUSIVAMENTE en el 'code'.
      \*/
      const bajaNombreEntidad = async ( inputDatos : TipoInputBaja ) : Promise<TipadoData<any>> => {

          // 1. Validar estrictamente con el esquema al inicio
          const dataValidada : TipoInputBaja = EsquemaZodBaja.parse( inputDatos );

          // 2. Intentar la modificación de estado directamente
          // Nota: Se envía dataValidada que contiene { id, estado }
          const resultadoBaja = await dataEntidad.modNombreEntidad( dataValidada );

          // 3. Evaluar respuesta SOLO por 'code'
          if ( resultadoBaja.code === "ENTIDAD_MODIFICAR" ) {

              const esAlta = dataValidada.estado === "ACTIVOS";

              return {
                  error: false,
                  message: esAlta ? "Registro reactivado exitosamente." : "Registro dado de baja exitosamente.",
                  code: esAlta ? "ALTA_LOGICA_ENTIDAD_OK" : "BAJA_LOGICA_ENTIDAD_OK",
                  data: resultadoBaja.data
              };
          }

          // 4. Return por defecto (si el code no fue el esperado)
          return {
              error: true,
              message: "Error interno del servidor al procesar el cambio de estado.",
              code: "ERROR_SERVIDOR"
          };

};

// Exportación obligatoria
export const method = {
bajaNombreEntidad: tryCatchDatos( bajaNombreEntidad )
};
