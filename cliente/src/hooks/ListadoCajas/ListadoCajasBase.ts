import { useReducer } from "react";

import  { initialStateListadoCaja , listadoCajaReducer } from "../../reducers/listadoCajaReducer";

export interface MovimientoLibroDiario {
  id_movimiento: number;
  usuario: string;
  id_caja: number;
  fecha: string;
  hora: string;
  descripcion: string;
  tipo: "ingreso" | "egreso";
  cuenta: string;
  monto: number;
}

export interface MetodoPagoData {
  metodo: string;
  total: number;
  color: string;
}

export const ListaCajaBase = () => {
    
    const [ stateListadoCaja, dispatchListadoCaja] = useReducer( listadoCajaReducer , initialStateListadoCaja());
  //  console.log(stateListadoCaja)

    const abrirLibroDiario = () =>{
        dispatchListadoCaja({ type : "SET_MODAL_LIBRO_DIARIO" , payload : true });
    };

    const cerrarLibroDiario = () =>{
      dispatchListadoCaja({ type : "SET_MODAL_LIBRO_DIARIO" , payload : false });
    };


            const mockHistorialCajasCerradas = [
            {
                id_caja: 14,
                fecha: {
                apertura: "2026-08-09",
                cierre: "2026-08-09"
                },
                hora: {
                apertura: "09:00:00",
                cierre: "21:30:00"
                },
                observaciones: "Caja cerrada perfecta sin diferencias.",
                monto_sistema: 65000.00,
                monto_real: 65000.00,
                monto_faltante: 0.00
            },
            {
                id_caja: 13,
                fecha: {
                apertura: "2026-08-08",
                cierre: "2026-08-08"
                },
                hora: {
                apertura: "09:00:00",
                cierre: "22:00:00"
                },
                observaciones: "Faltó $500 en efectivo por un vuelto mal entregado al mediodía.",
                monto_sistema: 82000.00,
                monto_real: 81500.00,
                monto_faltante: -500.00
            },
            {
                id_caja: 12,
                fecha: {
                apertura: "2026-08-07",
                cierre: "2026-08-07"
                },
                hora: {
                apertura: "09:00:00",
                cierre: "21:00:00"
                },
                observaciones: "Sobró $500, un alumno dejó un pago extra sin registrar.",
                monto_sistema: 54000.00,
                monto_real: 54500.00,
                monto_faltante: 500.00
            },
            {
                id_caja: 11,
                fecha: {
                apertura: "2026-08-06",
                cierre: "2026-08-06"
                },
                hora: {
                apertura: "08:30:00",
                cierre: "20:45:00"
                },
                observaciones: "Cierre normal de rutina sin novedades.",
                monto_sistema: 47000.00,
                monto_real: 47000.00,
                monto_faltante: 0.00
            },
            {
                id_caja: 11,
                fecha: {
                apertura: "2026-08-06",
                cierre: "2026-08-06"
                },
                hora: {
                apertura: "08:30:00",
                cierre: "20:45:00"
                },
                observaciones: "Cierre normal de rutina sin novedades.",
                monto_sistema: 47000.00,
                monto_real: 47000.00,
                monto_faltante: 0.00
            },
            {
                id_caja: 11,
                fecha: {
                apertura: "2026-08-06",
                cierre: "2026-08-06"
                },
                hora: {
                apertura: "08:30:00",
                cierre: "20:45:00"
                },
                observaciones: "Cierre normal de rutina sin novedades.",
                monto_sistema: 47000.00,
                monto_real: 47000.00,
                monto_faltante: 0.00
            }
            ];


            const mockLibroDiario: MovimientoLibroDiario[] = [
              {
                id_movimiento: 1,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "09:15:00",
                descripcion: "Inscripción alumna nueva - María Gomez",
                tipo: "ingreso",
                cuenta: "Efectivo",
                monto: 10000.00
              },
              {
                id_movimiento: 2,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "10:30:00",
                descripcion: "Pago de cuota mensual - Carlos Ruiz",
                tipo: "ingreso",
                cuenta: "Mercado Pago",
                monto: 12000.00
              },
              {
                id_movimiento: 3,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "12:00:00",
                descripcion: "Compra de insumos de limpieza y librería",
                tipo: "egreso",
                cuenta: "Efectivo",
                monto: 4500.00
              },
              {
                id_movimiento: 4,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "15:45:00",
                descripcion: "Pago de cuota mensual - Lucía Benítez",
                tipo: "ingreso",
                cuenta: "Efectivo",
                monto: 12000.00
              },
              {
                id_movimiento: 5,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "18:20:00",
                descripcion: "Reparación menor de parlante de estudio",
                tipo: "egreso",
                cuenta: "Efectivo",
                monto: 8000.00
              },
              {
                id_movimiento: 5,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "18:20:00",
                descripcion: "Reparación menor de parlante de estudio",
                tipo: "egreso",
                cuenta: "Efectivo",
                monto: 8000.00
              },
              {
                id_movimiento: 5,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "18:20:00",
                descripcion: "Reparación menor de parlante de estudio",
                tipo: "egreso",
                cuenta: "Efectivo",
                monto: 8000.00
              },
              {
                id_movimiento: 5,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "18:20:00",
                descripcion: "Reparación menor de parlante de estudio",
                tipo: "egreso",
                cuenta: "Efectivo",
                monto: 8000.00
              },
              {
                id_movimiento: 5,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "18:20:00",
                descripcion: "Reparación menor de parlante de estudio",
                tipo: "egreso",
                cuenta: "Efectivo",
                monto: 8000.00
              },
              {
                id_movimiento: 5,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "18:20:00",
                descripcion: "Reparación menor de parlante de estudio",
                tipo: "egreso",
                cuenta: "Efectivo",
                monto: 8000.00
              },
              {
                id_movimiento: 5,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "18:20:00",
                descripcion: "Reparación menor de parlante de estudio",
                tipo: "egreso",
                cuenta: "Efectivo",
                monto: 8000.00
              },
              {
                id_movimiento: 5,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "18:20:00",
                descripcion: "Reparación menor de parlante de estudio",
                tipo: "egreso",
                cuenta: "Efectivo",
                monto: 8000.00
              },
              {
                id_movimiento: 5,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "18:20:00",
                descripcion: "Reparación menor de parlante de estudio",
                tipo: "egreso",
                cuenta: "Efectivo",
                monto: 8000.00
              },
              {
                id_movimiento: 5,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "18:20:00",
                descripcion: "Reparación menor de parlante de estudio",
                tipo: "egreso",
                cuenta: "Efectivo",
                monto: 8000.00
              },
              {
                id_movimiento: 5,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "18:20:00",
                descripcion: "Reparación menor de parlante de estudio",
                tipo: "egreso",
                cuenta: "Efectivo",
                monto: 8000.00
              },
              {
                id_movimiento: 5,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "18:20:00",
                descripcion: "Reparación menor de parlante de estudio",
                tipo: "egreso",
                cuenta: "Efectivo",
                monto: 8000.00
              },
              {
                id_movimiento: 5,
                usuario: "Juan Pérez",
                id_caja: 14,
                fecha: "2026-08-09",
                hora: "18:20:00",
                descripcion: "Reparación menor de parlante de estudio",
                tipo: "egreso",
                cuenta: "Efectivo",
                monto: 8000.00
              }
            ];

            const mockResumenMetodosPago: MetodoPagoData[] = [
              { metodo: "efectivo", total: 180000.00, color: "#10B981" }, // Verde esmeralda
              { metodo: "mercado pago", total: 62000.00, color: "#3B82F6" }, // Azul moderno
              { metodo: "transferencia", total: 35000.00, color: "#8B5CF6" }, // Violeta / Índigo
              { metodo: "tarjeta", total: 18500.00, color: "#8c7856" },
 
            ];

            const mockCajaActiva = {
                        id_caja: 14,
                        cajero: "Juan Pérez",
                        fecha_apertura: "2026-06-07",
                        hora_apertura :  "09:00:00",
                        estado: "abierta",
                        total : 60000.00,
                        totales: {
                            efectivo: 45000.00,
                            virtual: 12000.00
                        }
            }

    
        return {
            mockLibroDiario, mockResumenMetodosPago, mockCajaActiva, mockHistorialCajasCerradas,
            stateListadoCaja, abrirLibroDiario, cerrarLibroDiario,
        }
};