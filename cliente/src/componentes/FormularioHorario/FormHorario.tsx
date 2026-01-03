import { SelectorPlegable } from "../Selector/Selector";
import { Calendario } from "../Calendario/Calendario";
import { TarjetaHorario } from "../TarjetaHorario/TarjetaHorario";
import { Boton } from "../Boton/Boton";

import type * as TipadoHorario from "../../tipadosTs/horario";
import { type ClaseHorario } from "../ClasesAsignadas/ClasesAsiganadas";
import { type MensajeCelda } from "../CeldaVacia/CeldaVacia";
import { type ResultHoras } from "../../hooks/setHora";
import {
  type Horas,
  type DiaSemana,
  type ClaseHorarioData,
  type metodo,
} from "../../tipadosTs/horario";

import "./formHorario.css";

interface FormHorarioProps {
  metodo: metodo | null;

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
    diasSemana,
    horarios,
  } = props;

  return (
    <div className="contenedor_formulario_horario">
      {modalInterno && (
        <div className="formulario_overlay">
          <div className="formulario_horario">
            <div className="formulario_horario_filtro_primario">
              <SelectorPlegable<TipadoHorario.DataProfesor>
                titulo="Profesores"
                objetoListado={listaProfe}
                onChange={handleCachearProfesores}
                input_list="list_profesores"
                valueKey="dni"
                tipo="text"
                name="dni"
                displayKey="persona"
              />

              <SelectorPlegable<TipadoHorario.DataNivel>
                titulo="Niveles"
                objetoListado={listaNiveles}
                onChange={handleCachearNiveles}
                input_list="list_niveles"
                valueKey="nivel"
                tipo="text"
                name="nivel"
              />

              <SelectorPlegable<TipadoHorario.DataTipo>
                titulo="Tipos"
                objetoListado={listaTipo}
                onChange={handleCachearTipos}
                input_list="list_tipos"
                valueKey="tipo"
                tipo="text"
                name="tipo"
              />
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
                  clase={metodo === "ALTA" ? "aceptar" : "editar"}
                  logo={metodo === "ALTA" ? "Add" : "Edit"}
                  texto={
                    metodo === "ALTA" ? "Agregar Horario" : "Modificar Horario"
                  }
                  onClick={metodo === "ALTA" ? handleAlta : handleMoficar}
                ></Boton>
                {metodo === "MOD" ? (
                  <Boton
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
        <Calendario
          diasSemana={diasSemana}
          horarios={horarios}
          calendario={calendario}
          handleModData={handleModificarData}
          handleAbrirModal={handleAbrirModal}
        />
      </div>
    </div>
  );
};
