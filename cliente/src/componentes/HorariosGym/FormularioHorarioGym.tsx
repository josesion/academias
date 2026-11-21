import { SelectorPlegable } from "../generales/Selector/Selector";
import { CalendarioGym } from "./CalendarioGym";
import { TarjetaHorarioGym } from "./TarjetaHorarioGym";
import { Boton } from "../generales/Boton/Boton";
import { SlidersHorizontal, CalendarDays, Info } from "lucide-react";

import type * as TipadoHorarioGym from "../../tipadosTs/horario_gym";
import { type ClaseHorario } from "../Horarios/ClasesAsignadas/ClasesAsiganadas";
import { type MensajeCelda } from "../Horarios/CeldaVacia/CeldaVacia";
import { type ResultHoras } from "../../hooks/setHora";
import { type HorarioGymCarga } from "../../reducers/horariosGymReducers";

import "./formHorarioGym.css";

interface FormularioHorarioGymProps {
  metodo: TipadoHorarioGym.metodo | null;
  carga: HorarioGymCarga;
  modalInterno?: boolean;
  mensajeEstado: string;
  horaInicioFin: ResultHoras | null;
  diaHorario: TipadoHorarioGym.DiaSemana | null;

  profesores: TipadoHorarioGym.DataProfesor | null;
  listaProfe: TipadoHorarioGym.DataProfesor[];

  sala: TipadoHorarioGym.DataSala | null;
  listaSalas: TipadoHorarioGym.DataSala[];

  tipo: TipadoHorarioGym.DataTipo | null;
  listaTipo: TipadoHorarioGym.DataTipo[];

  horarios: TipadoHorarioGym.Horas[];
  diasSemana: TipadoHorarioGym.DiaSemana[];
  calendario?: TipadoHorarioGym.ClaseHorarioGymData[];

  handleCachearProfesores: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCachearSalas: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCachearTipos: (e: React.ChangeEvent<HTMLInputElement>) => void;
  salaSeleccionada: TipadoHorarioGym.DataSala | null;
  handleAlta: () => void;
  handleMoficar: () => void;
  handleCancelar: () => void;
  handleEliminar: () => void;
  handleVolver: () => void;
  handleModificarData: (clase: ClaseHorario) => void;
  handleAbrirModal: (mensaje: MensajeCelda) => void;
}

export const FormularioHorarioGym: React.FC<FormularioHorarioGymProps> = (props) => {
  const {
    modalInterno,
    mensajeEstado,
    profesores,
    sala,
    tipo,
    metodo,
    carga,
    horaInicioFin,
    diaHorario,
    listaProfe,
    listaSalas,
    salaSeleccionada,
    listaTipo,
    calendario,
    handleCachearProfesores,
    handleCachearSalas,
    handleCachearTipos,
    handleCancelar,
    handleAlta,
    handleModificarData,
    handleAbrirModal,
    handleMoficar,
    handleEliminar,
    diasSemana,
    horarios,
  } = props;

  // Filtrar calendario por la sala seleccionada (contexto principal)
  const calendarioFiltrado = salaSeleccionada
    ? (calendario || []).filter((c) => c.sala_nombre === salaSeleccionada.nombre)
    : (calendario || []);

  return (
    <div className="contenedor_formulario_horario">
      {modalInterno && (
        <div className="formulario_overlay">
          <div
            className="formulario_horario"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form_horario_gym_titulo"
          >
            <h2 id="form_horario_gym_titulo" className="visually-hidden">
              {metodo === "ALTA" ? "Agregar horario Gym" : "Modificar horario Gym"}
            </h2>

            <div className="formulario_horario_filtro_primario">
              <div className="filtro_primario_titulo">
                <SlidersHorizontal size={13} aria-hidden="true" />
                <span>Filtros <span className="filtro_campos_obligatorio" title="Los campos marcados con * son obligatorios">* campos obligatorios</span></span>
              </div>

              <div className="filtro_primario_campos">
                <div className="filtro_campo">
                  <SelectorPlegable<TipadoHorarioGym.DataProfesor>
                    titulo="Profesores *"
                    objetoListado={listaProfe}
                    onChange={handleCachearProfesores}
                    input_list="list_profesores_gym"
                    valueKey="Dni"
                    tipo="text"
                    name="dni"
                    displayKey="Apellido"
                    cargando={carga.profesores}
                    ariaLabel="Seleccionar profesor, campo obligatorio"
                  />
                </div>


                <div className="filtro_campo">
                  <SelectorPlegable<TipadoHorarioGym.DataTipo>
                    titulo="Tipos *"
                    objetoListado={listaTipo}
                    onChange={handleCachearTipos}
                    input_list="list_tipos_gym"
                    valueKey="tipo"
                    tipo="text"
                    name="tipo"
                    cargando={carga.tipos}
                    ariaLabel="Seleccionar tipo de clase, campo obligatorio"
                  />
                </div>
              </div>
            </div>

            <TarjetaHorarioGym
              metodo={metodo}
              dataProfe={profesores}
              dataSala={sala}
              dataTipo={tipo}
              dia={diaHorario}
              hora_inicio={
                horaInicioFin?.hora_inicio ? horaInicioFin.hora_inicio : null
              }
              hora_fin={horaInicioFin?.hora_fin ? horaInicioFin.hora_fin : null}
              mensajeEstado={mensajeEstado}
            />

            <div className="formualrio_horario_botonera">
              <div className="formulario_horario_botonera1">
                <Boton
                  disable={carga.abm}
                  clase={metodo === "ALTA" ? "aceptar" : "agregar"}
                  logo={metodo === "ALTA" ? "Add" : "Edit"}
                  texto={
                    metodo === "ALTA" ? "Agregar Horario" : "Modificar Horario"
                  }
                  onClick={metodo === "ALTA" ? handleAlta : handleMoficar}
                ></Boton>
                {metodo === "MOD" ? (
                  <Boton
                    disable={carga.abm}
                    clase="eliminar"
                    logo="Delete"
                    texto="Eliminar Horario"
                    onClick={handleEliminar}
                  ></Boton>
                ) : null}
              </div>

              <Boton
                clase="cancelar"
                logo="Cancel"
                texto="Cerrar"
                onClick={handleCancelar}
              ></Boton>
            </div>
          </div>
        </div>
      )}

      <div className="formulario_horario_filtro_secundario">
        <div className="calendario_header">
          <CalendarDays size={14} aria-hidden="true" />
          <h2 id="calendario_horario_gym_titulo">Horario semanal (Gym)</h2>

          {carga.calendario && (
            <span className="calendario_cargando" role="status">
              <span className="spinner_mini" aria-hidden="true" />
              Actualizando…
            </span>
          )}
        </div>

        {/* Instrucción de uso del calendario */}
        <div className="calendario_instruccion" role="note">
          <Info size={14} aria-hidden="true" />
          <span>Hacé clic en una celda vacía para agregar clase, o en una ocupada para ver y modificar</span>
        </div>

        <div className="calendario_contenido" aria-live="polite">
          <CalendarioGym
            diasSemana={diasSemana}
            horarios={horarios}
            calendario={calendarioFiltrado}
            handleModData={handleModificarData}
            handleAbrirModal={handleAbrirModal}
            handleVolver={props.handleVolver}
          />
        </div>
      </div>
    </div>
  );
};
