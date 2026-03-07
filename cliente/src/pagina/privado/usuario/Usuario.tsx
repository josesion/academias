import "./usuario.css";

export const UsuarioPage = () => {
  return (
    <div className="usuario_contenedor">
      {/* SECCIÓN DE METRICAS Y BOTONES */}
      <div className="usuario_header">
        <h2>Panel de Usuario</h2>
        <p>Aquí podes ver tus métricas o estadísticas.</p>
      </div>

      {/* EJEMPLO DE METRICAS */}
      <div className="usuario_metricas">
        <div className="metrica_card">
          <h3>Total Alumnos</h3>
          <p>120</p>
        </div>
        <div className="metrica_card">
          <h3>Clases este mes</h3>
          <p>45</p>
        </div>
        <div className="metrica_card">
          <h3>Profesores activos</h3>
          <p>8</p>
        </div>
      </div>
    </div>
  );
};
