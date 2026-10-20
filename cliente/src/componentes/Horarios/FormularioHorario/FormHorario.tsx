import { SelectorPlegable } from "../../generales/Selector/Selector";
import { Calendario } from "../Calendario/Calendario";
import { TarjetaHorario } from "../TarjetaHorario/TarjetaHorario";
import { Boton } from "../../generales/Boton/Boton";
import { SlidersHorizontal, CalendarDays } from "lucide-react";

import type * as TipadoHorario from "../../../tipadosTs/horario";
import { type ClaseHorario } from "../ClasesAsignadas/ClasesAsiganadas";
import { type MensajeCelda } from "../CeldaVacia/CeldaVacia";
import { type ResultHoras } from "../../../hooks/setHora";
import { type HorarioCarga } from "../../../reducers/horariosReducers";
import {
  type Horas,
  type DiaSemana,
  type ClaseHorarioData,
  type metodo,
} from "../../../tipadosTs/horario";

import "./formHorario.css";

interface FormHorarioProps {
  metodo: metodo | null;

  /**
   * Estado de carga **por recurso** (spec 038): un flag por request, para que
   * el eco de carga se pinte en el control que lo dispara y no en un overlay
   * que tapa la pantalla.
   */
  carga: HorarioCarga;

  modalInterno?: boolean;
  mensajeEstado: string;
  horaInicioFin: ResultHoras | null;
  diaHorario: DiaSemana | null;

  profesores: TipadoHorario.DataProfesor | null;
  listaProfe: TipadoHorario.DataProfesor[];

  nilveles: TipadoHorario.DataNivel | null;
  listaNiveles: TipadoHorario.DataNivel[];

  tipo: TipadoHorario.DataTipo | null;
  listaTipo: TipadoHorario.DataTipo[];

  horarios: Horas[];
  diasSemana: DiaSemana[];
  calendario?: ClaseHorarioData[];

  handleCachearProfesores: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCachearNiveles: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCachearTipos: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAlta: () => void;
  handleMoficar: () => void;
  handleCancelar: () => void;
  handleEliminar: () => void;
  handleVolver: () => void;
  handleModificarData: (clase: ClaseHorario) => void;
  handleAbrirModal: (mensaje: MensajeCelda) => void;
}

export const FormHorario: React.FC<FormHorarioProps> = (props) => {
  const {
    modalInterno,
    mensajeEstado,
    profesores,
    nilveles,
    tipo,
    metodo,
    carga,
    horaInicioFin,
    diaHorario,
    listaProfe,
    listaNiveles,
    listaTipo,
    calendario,
    handleCachearProfesores,
    handleCachearNiveles,
    handleCachearTipos,
    handleCancelar,
    handleAlta,
    handleModificarData,
    handleAbrirModal,
    handleMoficar,
    handleEliminar,
    handleVolver,
    diasSemana,
    horarios,
  } = props;

  return (
    <div className="contenedor_formulario_horario">
      {modalInterno && (
        <div className="formulario_overlay">
          <div
            className="formulario_horario"
            role="dialog"
            aria-modal="true"
            aria-labelledby="form_horario_titulo"
          >
            <h2 id="form_horario_titulo" className="visually-hidden">
              {metodo === "ALTA" ? "Agregar horario" : "Modificar horario"}
            </h2>

            <div className="formulario_horario_filtro_primario">
              <div className="filtro_primario_titulo">
                <SlidersHorizontal size={13} aria-hidden="true" />
                <span>Filtros</span>
              </div>

              <div className="filtro_primario_campos">
                <div className="filtro_campo">
                  <SelectorPlegable<TipadoHorario.DataProfesor>
                    titulo="Profesores"
                    objetoListado={listaProfe}
                    onChange={handleCachearProfesores}
                    input_list="list_profesores"
                    valueKey="dni"
                    tipo="text"
                    name="dni"
                    displayKey="persona"
                    cargando={carga.profesores}
                  />
                </div>

                <div className="filtro_campo">
                  <SelectorPlegable<TipadoHorario.DataNivel>
                    titulo="Niveles"
                    objetoListado={listaNiveles}
                    onChange={handleCachearNiveles}
                    input_list="list_niveles"
                    valueKey="nivel"
                    tipo="text"
                    name="nivel"
                    cargando={carga.niveles}
                  />
                </div>

                <div className="filtro_campo">
                  <SelectorPlegable<TipadoHorario.DataTipo>
                    titulo="Tipos"
                    objetoListado={listaTipo}
                    onChange={handleCachearTipos}
                    input_list="list_tipos"
                    valueKey="tipo"
                    tipo="text"
                    name="tipo"
                    cargando={carga.tipos}
                  />
                </div>
              </div>
            </div>

            <TarjetaHorario
              metodo={metodo}
              dataNivel={nilveles}
              dataProfe={profesores}
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
          <h2 id="calendario_horario_titulo">Horario semanal</h2>

          {/* Eco de carga local del calendario (spec 038): un chip en el
              encabezado en vez de un overlay que tapa la grilla entera. */}
          {carga.calendario && (
            <span className="calendario_cargando" role="status">
              <span className="spinner_mini" aria-hidden="true" />
              Actualizando…
            </span>
          )}
        </div>

        <Calendario
          diasSemana={diasSemana}
          horarios={horarios}
          calendario={calendario}
          handleModData={handleModificarData}
          handleAbrirModal={handleAbrirModal}
          handleVolver={handleVolver}
        />
      </div>
    </div>
  );
};
