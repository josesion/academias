import "./inicio.css";

export const Inicio = () => {
  return (
    <div className="inicio">
      {/* ================= HERO ================= */}

      <section className="hero">
        <div className="hero_glow hero_glow_1"></div>
        <div className="hero_glow hero_glow_2"></div>

        <div className="hero_contenido">
          <span className="hero_badge">
            Plataforma Integral para Academias de Danza
          </span>

          <h1 className="hero_titulo">
            Gestioná tu academia
            <br />
            desde un solo lugar.
          </h1>

          <p className="hero_descripcion">
            ELPIS reúne alumnos, profesores, horarios, caja, asistencias,
            inscripciones, reportes y mucho más en una plataforma moderna,
            rápida y fácil de utilizar.
          </p>

          <div className="hero_botones">
            <a href="/login" className="boton_principal">
              Iniciar Sesión
            </a>

            <a href="#planes" className="boton_secundario">
              Ver planes
            </a>
          </div>

          <div className="hero_estadisticas">
            <div className="estadistica">
              <strong>100%</strong>
              <span>Administración Digital</span>
            </div>

            <div className="estadistica">
              <strong>24/7</strong>
              <span>Acceso Online</span>
            </div>

            <div className="estadistica">
              <strong>∞</strong>
              <span>Escalable</span>
            </div>
          </div>
        </div>

        <div className="hero_dashboard">
          <div className="dashboard_card">
            <div className="dashboard_header">
              <span className="dashboard_dot rojo"></span>
              <span className="dashboard_dot amarillo"></span>
              <span className="dashboard_dot verde"></span>
            </div>

            <div className="dashboard_metricas">
              <div className="dashboard_item">
                <span>Alumnos</span>
                <strong>245</strong>
              </div>

              <div className="dashboard_item">
                <span>Clases Hoy</span>
                <strong>18</strong>
              </div>

              <div className="dashboard_item">
                <span>Ingresos</span>
                <strong>$248.500</strong>
              </div>

              <div className="dashboard_item">
                <span>Asistencias</span>
                <strong>92%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FUNCIONALIDADES ================= */}

      <section className="funciones">
        <div className="titulo_seccion">
          <span>TODO EN UN SOLO SISTEMA</span>
          <h2>Funciones principales</h2>
          <p>Diseñado específicamente para academias de danza.</p>
        </div>

        <div className="funciones_grid">
          <article className="funcion_card">
            <div className="funcion_icono">👨‍🎓</div>
            <h3>Gestión de Alumnos</h3>
            <p>
              Registrá alumnos, inscripciones, vencimientos y clases restantes.
            </p>
          </article>

          <article className="funcion_card">
            <div className="funcion_icono">📅</div>
            <h3>Horarios Inteligentes</h3>
            <p>
              Organizá cursos, profesores y aulas desde un calendario moderno.
            </p>
          </article>

          <article className="funcion_card">
            <div className="funcion_icono">💰</div>
            <h3>Caja Diaria</h3>
            <p>Control completo de ingresos, egresos y arqueos de caja.</p>
          </article>

          <article className="funcion_card">
            <div className="funcion_icono">✅</div>
            <h3>Asistencias</h3>
            <p>Registro rápido de asistencia con estadísticas automáticas.</p>
          </article>

          <article className="funcion_card">
            <div className="funcion_icono">📊</div>
            <h3>Reportes</h3>
            <p>Visualizá el rendimiento de tu academia en tiempo real.</p>
          </article>

          <article className="funcion_card">
            <div className="funcion_icono">🔔</div>
            <h3>Notificaciones</h3>
            <p>Comunicaciones rápidas con alumnos y profesores.</p>
          </article>
        </div>
      </section>

      {/* ================= BENEFICIOS ================= */}

      <section className="beneficios">
        <div className="titulo_seccion">
          <span>¿POR QUÉ ELPIS?</span>
          <h2>Trabajá menos y controlá más.</h2>
        </div>

        <div className="beneficios_grid">
          <div className="beneficio">✔ Eliminá planillas de Excel.</div>

          <div className="beneficio">
            ✔ Controlá toda tu academia desde cualquier dispositivo.
          </div>

          <div className="beneficio">
            ✔ Ahorrá tiempo en tareas administrativas.
          </div>

          <div className="beneficio">✔ Información centralizada.</div>

          <div className="beneficio">✔ Plataforma moderna y segura.</div>

          <div className="beneficio">✔ Actualizaciones constantes.</div>
        </div>
      </section>

      {/* ================= PLANES ================= */}

      <section className="planes" id="planes">
        <div className="titulo_seccion">
          <span>PLANES</span>
          <h2>Elegí el plan ideal para tu academia.</h2>
        </div>

        <div className="planes_grid">
          <article className="plan_card">
            <span className="plan_tipo">Profesional</span>

            <h3>Plan Mensual</h3>

            <div className="plan_precio">Consultar</div>

            <ul>
              <li>✔ Gestión de alumnos</li>

              <li>✔ Caja</li>

              <li>✔ Asistencias</li>

              <li>✔ Horarios</li>

              <li>✔ Reportes</li>

              <li>✔ Actualizaciones</li>
            </ul>

            <a href="/login" className="plan_boton">
              Comenzar
            </a>
          </article>

          <article className="plan_card destacado">
            <span className="plan_oferta">50% OFF · Primeros 3 meses</span>

            <h3>Lanzamiento ELPIS</h3>

            <div className="plan_precio">Promoción Especial</div>

            <ul>
              <li>✔ Todas las funciones</li>

              <li>✔ Soporte prioritario</li>

              <li>✔ Actualizaciones</li>

              <li>✔ Sin límite de crecimiento</li>
            </ul>

            <a href="/login" className="plan_boton">
              Quiero la promoción
            </a>
          </article>
        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className="cta">
        <h2>Comenzá hoy mismo a digitalizar tu academia.</h2>

        <p>
          Probá ELPIS y descubrí una forma más simple de administrar alumnos,
          clases y finanzas.
        </p>

        <a href="/login" className="boton_principal">
          Comenzar ahora
        </a>
      </section>

      {/* ================= FOOTER ================= */}

      <footer className="footer">
        <h3>ELPIS</h3>

        <p>Sistema integral para academias de danza.</p>

        <small>© 2026 ELPIS · Todos los derechos reservados.</small>
      </footer>
    </div>
  );
};
