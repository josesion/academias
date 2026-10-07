import { z } from "zod";

// --- 1. ESQUEMA PARA LISTADO (GET) ---
export const EsquemaListadoUsuarioAdmin = z.object({
  // Definir campos y reglas de validación aquí
});

// --- 2. ESQUEMA PARA CREAR (POST) ---
export const EsquemaCrearUsuarioAdmin = z.object({
  // Definir campos y reglas de validación aquí
});

// --- 3. ESQUEMA PARA ACTUALIZAR (PUT) ---
export const EsquemaActualizarUsuarioAdmin = z.object({
  // Definir campos y reglas de validación aquí
});

// --- 4. ESQUEMA PARA ELIMINAR (DELETE) ---
export const EsquemaEliminarUsuarioAdmin = z.object({
  // Definir campos y reglas de validación aquí
});

export type InputListadoUsuarioAdmin = z.infer<typeof EsquemaListadoUsuarioAdmin>;
export type InputCrearUsuarioAdmin = z.infer<typeof EsquemaCrearUsuarioAdmin>;
export type InputActualizarUsuarioAdmin = z.infer<typeof EsquemaActualizarUsuarioAdmin>;
export type InputEliminarUsuarioAdmin = z.infer<typeof EsquemaEliminarUsuarioAdmin>;
