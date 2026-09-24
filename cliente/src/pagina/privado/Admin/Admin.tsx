import { MdOutlineSchool, MdOutlineTrendingUp } from "react-icons/md";
import { LuCreditCard, LuUsers } from "react-icons/lu";
import "./admin.css"; // Importás tu archivo CSS

export const DashboardAdministrador = () => {
  const metricas = [
    {
      titulo: "Escuelas Activas",
      valor: "12",
      icono: MdOutlineSchool,
      claseIcono: "icono-esmeralda",
    },
    {
      titulo: "Planes SaaS Asignados",
      valor: "12",
      icono: LuCreditCard,
      claseIcono: "icono-sky",
    },
    {
      titulo: "Usuarios Totales",
      valor: "148",
      icono: LuUsers,
      claseIcono: "icono-violeta",
    },
  ];

  return (
    <div className="admin-container">
      {/* Encabezado */}
      <div className="admin-header">
        <h1 className="admin-title">
          Panel de Administración{" "}
          <MdOutlineTrendingUp className="icono-trending" />
        </h1>
        <p className="admin-subtitle">
          Resumen general del sistema multitenant y estado de las escuelas.
        </p>
      </div>

      {/* Grid de tarjetas */}
      <div className="admin-grid">
        {metricas.map((item, index) => {
          const Icon = item.icono;
          return (
            <div key={index} className="admin-card">
              <div className="admin-card-info">
                <span className="admin-card-label">{item.titulo}</span>
                <h2 className="admin-card-value">{item.valor}</h2>
              </div>
              <div className={`admin-card-icon ${item.claseIcono}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner inferior */}
      <div className="admin-banner">
        <div className="admin-banner-text">
          <h3>Control de Suscripciones SaaS</h3>
          <p>
            Recordá verificar los estados de pago y vencimientos de las escuelas
            desde la sección de administración.
          </p>
        </div>
        <a href="/admin/escuelas" className="admin-banner-btn">
          Ver Escuelas
        </a>
      </div>
    </div>
  );
};
