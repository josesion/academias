import { Formulario } from "../../componentes/Formulario/Formulario";
import { ListadoMolde } from "../../componentes/ListaMolde/Listado";
import { Buscadores } from "../../componentes/Buscadores/Buscador";
import { Paginacion } from "../../componentes/Paginacion/Paginacion";
import { EliminarVentana } from "../EliminarModal/EliminarModal";

import "./ambcss.css";

// Aquí definimos los tipos de las props que el componente recibirá
interface AmbViewProps {
    modal: boolean;
    modalEliminar : boolean;
    errorsZod: Record<string, string | null>;
    errorGenerico: string | null ;
    dataAlumnosListado: any[];
    formData: any;
    barraPaginacion: any;
    filtroData: any;
    inputsFiltro: any[];
    inputsEntidad: any[];
    estados: string[];


    carga: boolean;
    error: boolean;
    statuscode: number;

    accionEliminar : string;
    tipoFormulario: "alta" | "modificar";
    botonTexto : string;

    onHandleChangeBuscador: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onHandleCancelar: () => void;
    onHandleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    onHandleChangeFormulario: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onHandleAgregar: () => void;
    onHandleEstado: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onHandlePaginaCambiada: (pagina: number) => void;

    onModificar?: (data: any) => void;
    onEliminar?: (data: any) => void;

    onHandleCancelarEliminar?: () => void;
    onHandleSubmitEliminar:() => Promise<void>;
}


export const AmbVistas: React.FC<AmbViewProps> = (props) => {
    
    const { 
        modal, modalEliminar ,errorsZod, errorGenerico, dataAlumnosListado, formData, barraPaginacion,
        filtroData, inputsFiltro, inputsEntidad, estados,carga , error, statuscode,
        tipoFormulario,accionEliminar, botonTexto,
        onHandleChangeBuscador,
        onHandleCancelar, onHandleSubmit, onHandleChangeFormulario, onHandleAgregar,
        onHandleEstado, onHandlePaginaCambiada,onHandleCancelarEliminar,
        onHandleSubmitEliminar,
        onModificar, onEliminar, 
    } = props;
    
    return (
        <div className="amb_contenedor_principal">
            {modal && 
                <div  className="formulario_overlay">
                        <Formulario 
                            data={inputsEntidad}
                            formData={formData}
                            textoSubmit="Registrar"
                            tituloFormulario={
                                tipoFormulario === "alta" ? "Registro Alumno"
                                : "Modificar Alumno"
                            }
                            onCancelar={onHandleCancelar}
                            onChange={onHandleChangeFormulario}
                            onSubmit={onHandleSubmit}
                            errorGenerico={errorGenerico}
                            errorsZod={errorsZod}
                        />
                </div>
            }

            {
                modalEliminar && 
                <div className="modal_eliminar">
                    <EliminarVentana
                        onCancelar={onHandleCancelarEliminar}
                        onSi={onHandleSubmitEliminar}
                        accion={accionEliminar}
                        data={formData}
                        mensaje={errorGenerico}
                    />
                </div>
            }



            <div className="listado_contenedor_principal">
                <div className="buscador_contenedor">
                    <Buscadores 
                        intputBuscador={inputsFiltro}
                        tituloBuscador=""
                        buscadorData={filtroData}
                        onChange={onHandleChangeBuscador}
                        captionBoton="Agregar"
                        onAgregar={onHandleAgregar}
                        estados={estados}
                        onEstados={onHandleEstado}
                        
                    />
                </div>
                <div className="Listado_contenedor">
                    <ListadoMolde
                        items={dataAlumnosListado}
                        onEditar={onModificar}
                        onEliminar={onEliminar}
                        carga= {carga}
                        error = {error}
                        statusCode={statuscode}
                        botonEstado={botonTexto}
                    />
                </div>
                <div className="paginacion_contenedor">
                    <Paginacion 
                        contadorPagina={barraPaginacion.contadorPagina || 0}
                        paginaActual={barraPaginacion.pagina || 1}
                        onPaginaCambiada={onHandlePaginaCambiada}
                    />
                </div>
            </div>
        </div>
    );
};