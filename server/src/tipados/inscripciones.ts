
export interface InscripcionListado {
  id_inscripcion: number;
  dni_alumno: number;
  nombre_completo: string;
  nombre_plan: string;
  clases_usadas: number;
  clases_totales: number;
  fecha_inicio: string; // Formato YYYY-MM-DD
  vigencia: string;     // Formato YYYY-MM-DD
  monto_pagado: string; // Viene como string de la DB
  metodo_pago: 'efectivo' | 'transferencia' | 'debito' | 'credito' | string;
}