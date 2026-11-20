/**
 * Hook para inscripción rápida desde el panel principal (modal).
 *
 * Reutiliza toda la lógica de `useInscipcion` pero reemplaza la navegación
 * por callbacks: al inscribir con éxito cierra el modal y emite los canales
 * de actualización del panel principal. Al cancelar, solo cierra el modal.
 *
 * Diferencia por rol:
 * - **Rol "basico"**: inscribe sin método de pago (sin caja).
 * - **Rol "intermedio"**: inscribe con método de pago y registra movimiento de caja.
 */

import { useContext, useCallback, useRef } from "react";
import { RutasProtegidasContext } from "../../contexto/protectRutas";
import { peticionComunicacion } from "../../utils/canalComunicacion";
import { fechaHoy, fechaVencimiento } from "../../utils/fecha";
import { InscripcionReducer, inicialState } from "../../reducers/inscripcionReducer";
import { initialStateMetricas, metricasReducer } from "../../reducers/metricasReducer";
import { cajaReducer, initialState } from "../../reducers/cajaReducers";
import { useReducer } from "react";

import { InscripcionAlumno } from "./InscripcionAlumno";
import { InscripcionPlan } from "./InscripcionPlan";
import { InscripcionIDS } from "./InscropcionIDS";
import { InscripcionMetodoPago } from "./InscripcionMetodoPago";

import { listadoAlumnos, listadoAlumnoSinPag } from "../../servicio/alumnos.fetch";
import { listadoPlanesUsuarios, listadoPlaneSinPag } from "../../servicio/planes.usuarios";
import { incripcion } from "../../servicio/inscripciones.fetch";
import { registrarMovimientoCaja, obtenerIdCaja } from "../../servicio/caja.fetch";
import { buscarInscripcionCategoria } from "../../servicio/categoria.caja.fetch";
import { listadoCategoriaCaja } from "../../servicio/caja.fetch";
import { cuentasSesion } from "../../servicio/caja.fetch";

interface UseInscripcionRapidaProps {
  /** Se llama cuando se cierra el modal (éxito o cancelación). */
  onCerrar: () => void;
  /** Se llama después de una inscripción exitosa para refrescar métricas. */
  onInscripcionExitosa?: () => void;
}

export const useInscripcionRapida = ({
  onCerrar,
  onInscripcionExitosa,
}: UseInscripcionRapidaProps) => {
  const { rol } = useContext(RutasProtegidasContext);

  // Ref para evitar closures stale en los handlers asíncronos
  const onCerrarRef = useRef(onCerrar);
  const onInscripcionExitosaRef = useRef(onInscripcionExitosa);
  onCerrarRef.current = onCerrar;
  onInscripcionExitosaRef.current = onInscripcionExitosa;

  const config = {
    usuario: rol?.usuario || "Usuario",
    servicios: {
      listaAlumnosPaginado: listadoAlumnos,
      listaPlanPaginado: listadoPlanesUsuarios,
      listadoAlumnosBusqueda: listadoAlumnoSinPag,
      listadoPlanesBusqueda: listadoPlaneSinPag,
      listadoCategoriaCaja: listadoCategoriaCaja,
      metodoInscripcion: incripcion,
      registroMovimiento: registrarMovimientoCaja,
      inscripcionCategoriaCaja: buscarInscripcionCategoria,
      obtenerIdCaja: obtenerIdCaja,
      cuentasSesion: cuentasSesion,
    },
    paginacion: {
      pagina: 1,
      limite: 10,
      contadorPagina: 0,
    },
    inicialFiltroAlumno: {
      dni: "",
      email: "",
      apellido: "",
    },
    inicialFiltroPlan: {
      descripcion: "",
    },
  };

  const [_stateMetrica, dispatchMetricas] = useReducer(metricasReducer, initialStateMetricas());

  const [_stateCaja, dispatchCaja] = useReducer(cajaReducer, initialState({
    usuario: config.usuario,
  }));

  const [state, dispatch] = useReducer(InscripcionReducer, inicialState({
    usuario: config.usuario,
    inicialFiltros: {
      inicialFiltroAlumno: config.inicialFiltroAlumno,
      inicialFiltroPlan: config.inicialFiltroPlan,
    },
    paginacion: config.paginacion,
  }));

  // ─────────────────────────────
  // INFO ALUMNOS
  // ─────────────────────────────
  const alumno = InscripcionAlumno({
    servicios: {
      listaAlumnosPaginado: config.servicios.listaAlumnosPaginado,
      listadoAlumnosBusqueda: config.servicios.listadoAlumnosBusqueda,
    },
    state,
    dispatch,
  });

  // ─────────────────────────────
  // INFO PLANES
  // ─────────────────────────────
  const plan = InscripcionPlan({
    servicios: {
      listaPlanPaginado: config.servicios.listaPlanPaginado,
      listadoPlanesBusqueda: config.servicios.listadoPlanesBusqueda,
    },
    state,
    dispatch,
  });

  // ─────────────────────────────
  // INFO METODOS DE PAGO
  // ─────────────────────────────
  const metodoPago = InscripcionMetodoPago({
    servicios: {
      cuentasSesion: config.servicios.cuentasSesion,
    },
    state,
    dispatch,
  });

  // ─────────────────────────────
  // INFO DE LOS IDS POR DEFECTO
  // ─────────────────────────────
  InscripcionIDS({
    servicios: {
      inscripcionCategoriaCaja: config.servicios.inscripcionCategoriaCaja,
      obtenerIdCaja: config.servicios.obtenerIdCaja,
    },
    state,
    dispatch,
  });

  const resetFormulario = useCallback(() => {
    dispatch({ type: "RESET_FILTRO_ALUMNO" });
    dispatch({ type: "RESET_FILTRO_PLAN" });
    dispatch({ type: "SET_PLAN", payload: null });
    dispatch({ type: "SET_ALUMNO", payload: null });
    dispatch({ type: "SET_NOTAS", payload: "" });
    dispatch({ type: "SET_ERROR_GENERICO", payload: null });
  }, [dispatch]);

  /**
   * Maneja la inscripción exitosa: emite los canales de actualización,
   * resetea el formulario y cierra el modal (sin navegar).
   */
  const handleExitoInscripcion = useCallback(() => {
    // Notifica al módulo de caja para que actualice su listado de movimientos
    peticionComunicacion({
      nombreCanal: "canal_inscripcion_caja",
      mensaje: "actualizar",
      error: "SET_ERROR_CANAL",
      dispatchError: dispatchCaja,
    });

    // Refresca el panel principal para recalcular métricas
    peticionComunicacion({
      nombreCanal: "canal_actualizar_metricas_principal",
      mensaje: "ACTUALIZAR_PANEL_PRINCIPAL",
      dispatchError: dispatchMetricas,
      error: "SET_ERROR_METRICAS_TARJETAS",
    });

    // Actualiza los registros del historial
    peticionComunicacion({
      nombreCanal: "canal_actualizar_metricas_historial",
      mensaje: "ACTUALIZAR_HISTORIAL",
      dispatchError: dispatchMetricas,
      error: "SET_ERROR_HISTORIAL",
    });

    resetFormulario();
    dispatch({ type: "MODAL_INSCRIPCION", payload: false });
    dispatch({ type: "ACTUALIZAR_INSCRIPCION" });

    // Callbacks externos
    onInscripcionExitosaRef.current?.();
    onCerrarRef.current();
  }, [dispatch, dispatchCaja, dispatchMetricas, resetFormulario]);

  const handleInscribir = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const esIntermedio = rol?.tipo === "intermedio";

      // Validación: si es intermedio y falta la caja
      if (esIntermedio && state.detalleMovimientoIds.id_caja === null) {
        dispatch({ type: "SET_ERROR_GENERICO", payload: "Abra caja antes de realizar una inscripción" });
        return;
      }

      // Validación: faltan varios campos
      if (state.alumno === null && state.plan === null && (esIntermedio && state.cuenta === null)) {
        dispatch({ type: "SET_ERROR_GENERICO", payload: "Seleccionar Plan, Alumno y Método de Pago" });
        return;
      }

      // Validaciones individuales
      if (state.alumno === null) {
        dispatch({ type: "SET_ERROR_GENERICO", payload: "Seleccionar alumno" });
        return;
      }

      if (state.plan === null) {
        dispatch({ type: "SET_ERROR_GENERICO", payload: "Seleccionar Plan" });
        return;
      }

      if (esIntermedio && state.cuenta === null) {
        dispatch({ type: "SET_ERROR_GENERICO", payload: "Seleccione el método de pago" });
        return;
      }

      dispatch({ type: "INICIAR_OPERACION_INSCRIPCION" });

      await new Promise((resolve) => setTimeout(resolve, 600));

      try {
        const servicioApiFetch = config.servicios.metodoInscripcion;

        // Usar DNI si existe, sino usar email como identificador del alumno
        const dniAlumno = state.alumno.Dni 
            ? Number(state.alumno.Dni) 
            : undefined;
        const emailAlumno = state.alumno.email || undefined;

        const datosInscpDetalle = {
          id_plan: state.plan.id,
          dni_alumno: dniAlumno,
          email_alumno: emailAlumno,
          fecha_inicio: fechaHoy(),
          fecha_fin: fechaVencimiento(state.plan.meses),
          monto: Number(state.plan.monto),
          meses_asignados_inscritos: state.plan.meses,
          clases_asignadas_inscritas: state.plan.clases,
          id_caja: state.detalleMovimientoIds.id_caja,
          id_categoria: state.detalleMovimientoIds.id_categoria,
          id_cuenta: state.cuenta,
          descripcion: state.notas,
        };

        const subcripcionInsc = await servicioApiFetch(datosInscpDetalle);

        if (subcripcionInsc.code === "INSCRIPCION_EXITOSA") {
          handleExitoInscripcion();
        } else {
          dispatch({ type: "SET_ERROR_GENERICO", payload: subcripcionInsc.message });
        }
      } catch {
        dispatch({ type: "SET_ERROR_GENERICO", payload: "Error en conexion, intente nuevamente" });
      } finally {
        dispatch({ type: "FINALIZAR_OPERACION_INSCRIPCION" });
      }
    },
    [rol, state, config, dispatch, handleExitoInscripcion],
  );

  /**
   * Cancela la inscripción: resetea el formulario y cierra el modal (sin navegar).
   */
  const handleCancelar = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      dispatch({ type: "SET_ERROR_GENERICO", payload: null });
      dispatch({ type: "MODAL_INSCRIPCION", payload: false });
      resetFormulario();
      onCerrarRef.current();
    },
    [dispatch, resetFormulario],
  );

  return {
    handleCachearPlan: plan.handleCachearPlan,
    handleCachearAlumno: alumno.handleCachearAlumno,
    handleCachearMetodoPago: metodoPago.handleCachearMetodoPago,
    handleTextAreaNotas: metodoPago.handleTextAreaNotas,

    handleInscribir,
    handleCancelar,

    state,
  };
};
