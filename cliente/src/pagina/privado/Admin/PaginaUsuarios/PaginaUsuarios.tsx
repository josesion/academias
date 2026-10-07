import { ListadoUsuario } from "../../../../componentes/Administrador/ListadoUsuario/ListadoUsuario";
import { FormularioUsuario } from "../../../../componentes/Administrador/FormularioUsuario/FormularioUsuario";
import { SelectorOpt } from "../../../../componentes/generales/CompSelecObt/SelectorOpt";
import { Boton } from "../../../../componentes/generales/Boton/Boton";
import { useAmbUsuarios } from "../../../../hookNegocios/abmUsuarios";
// Tipos de las opciones del selector (mismos que el form de suscripciones)
import type { EscuelaSelect } from "../../../../servicio/suspcripciones.fetch";
import "./paginausuario.css";

/**
 * Página Admin de Cuentas: encabezado (con el botón de alta) + filtro de
 * escuela + los 2 listados apilados (Usuarios arriba, Alumnos abajo) con su
 * botón "Modificar" + el modal del formulario (alta o modificación).
 *
 * Todo sale del hook `useAmbUsuarios()`: filas, cargas, errores, paginación,
 * opciones del selector y el bloque `formulario` (con `metodo`) viven en
 * `usuarios.reducers.ts`.
 */
export const PaginaUsuarios = () => {
  const {
    state,
    cachearPagina,
    cambiarEscuela,
    abrirFormulario,
    abrirModificacion,
    cerrarFormulario,
    cachearFormulario,
    postUsuario,
    putUsuario,
  } = useAmbUsuarios();

  return (
    <section className="pagina_usuarios">
      <header className="pagina_usuarios_encabezado">
        <div className="pagina_usuarios_titulos">
          <span className="pagina_usuarios_etiqueta">Administración</span>

          <h1>Cuentas</h1>

          <p>Gestiona los usuarios y alumnos de la plataforma.</p>
        </div>

        <div className="pagina_usuarios_acciones">
          <Boton
            clase="agregar"
            logo="Add"
            texto="Nueva cuenta"
            type="button"
            onClick={abrirFormulario}
          />
        </div>
      </header>

      <div className="pagina_usuarios_filtros">
        <SelectorOpt<EscuelaSelect>
          categorias={state.opciones?.escuelas ?? []}
          itemKey="id_escuela"
          itemLabel="razon_social"
          name="id_escuela"
          value={state.filtrosUsuarios.id_escuela ?? ""}
          labelDefault="Todas las escuelas"
          onChangeSelector={cambiarEscuela}
        />
      </div>

      <div className="pagina_usuarios_listas">
        <ListadoUsuario
          titulo="Usuarios"
          filtros={state.filtrosUsuarios}
          filas={state.listadoUsuarios}
          carga={state.carga.usuarios}
          error={state.error.usuarios}
          contadorPagina={state.paginacionUsuarios.contadorPagina}
          onCambioPagina={(pagina) => cachearPagina("usuarios", pagina)}
          onModificar={abrirModificacion}
        />

        <ListadoUsuario
          titulo="Alumnos"
          filtros={state.filtrosAlumnos}
          filas={state.listadoAlumnos}
          carga={state.carga.alumnos}
          error={state.error.alumnos}
          contadorPagina={state.paginacionAlumnos.contadorPagina}
          onCambioPagina={(pagina) => cachearPagina("alumnos", pagina)}
          onModificar={abrirModificacion}
        />
      </div>

      {/* ==============================================================
          MODAL DEL FORMULARIO — abierto/cerrado por el reducer
          (modal.formulario) y en el modo que dice `metodo`
          .admin_modal ya es fluido: width 100% / max 720px / scroll interno
          ============================================================== */}
      {state.modal.formulario && (
        <div className="admin_modal_fondo" onClick={cerrarFormulario}>
          <div
            className="admin_modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <FormularioUsuario
              formulario={state.formulario}
              // si falla la carga de las opciones, el aviso se ve igual
              error={state.error.formulario ?? state.error.opciones}
              carga={state.carga.formulario}
              escuelas={state.opciones?.escuelas ?? []}
              metodo={state.metodo}
              cachearFormulario={cachearFormulario}
              postUsuario={postUsuario}
              putUsuario={putUsuario}
              onCerrar={cerrarFormulario}
            />
          </div>
        </div>
      )}
    </section>
  );
};
