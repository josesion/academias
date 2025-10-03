
import "./inicio.css";

export const Inicio = () =>{

    return(
    <div className="app-container">
            {/* Sección de bienvenida (Hero) */}
            <section className="hero-section">
                <h1 className="hero-title">Automatiza y Controla la Asistencia de Alumnos</h1>
                <p className="hero-subtitle">
                    Simplifica la gestión de tus clases, envía notificaciones y comunica eventos importantes a tu comunidad de alumnos.
                </p>
                <a href="/login" className="hero-button">
                    Iniciar Sesión Ahora
                </a>
            </section>

            {/* Sección de características de la app */}
            <section className="features-section">
                <h2 className="features-title">
                    Funcionalidades Principales
                </h2>
                <div className="features-grid">
                    {/* Característica 1: Registro de Asistencias */}
                    <div className="feature-card">
                        {/* Icono SVG de una lista de verificación */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"></path>
                            <path d="M8 12l2 2 4-4"></path>
                        </svg>
                        <h3 className="feature-heading">Registro de Asistencias</h3>
                        <p className="feature-description">
                            Automatiza el control de asistencia para tus alumnos y accede a reportes detallados en segundos.
                        </p>
                    </div>

                    {/* Característica 2: Comunicación con Alumnos */}
                    <div className="feature-card">
                        {/* Icono SVG de un chat de burbuja */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <h3 className="feature-heading">Comunicación con Alumnos</h3>
                        <p className="feature-description">
                            Envía notificaciones, avisos de clases y mensajes personalizados a tus alumnos de forma masiva.
                        </p>
                    </div>

                    {/* Característica 3: Paneles Intuitivos */}
                    <div className="feature-card">
                        {/* Icono SVG de un panel de control */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="9"></rect>
                            <rect x="14" y="3" width="7" height="5"></rect>
                            <rect x="14" y="12" width="7" height="9"></rect>
                            <rect x="3" y="16" width="7" height="5"></rect>
                        </svg>
                        <h3 className="feature-heading">Paneles Intuitivos</h3>
                        <p className="feature-description">
                            Visualiza de un vistazo la asistencia, los reportes y los datos más importantes de tu academia.
                        </p>
                    </div>
                </div>
            </section>

            {/* Sección de Precios */}
            <section className="pricing-section">
                <h2 className="pricing-title">
                    Planes y Precios
                </h2>
                <div className="pricing-grid">
                    {/* Tarjeta de Plan: Básico */}
                    <div className="plan-card">
                        <h3 className="plan-heading">Plan Básico</h3>
                        <p className="plan-description">Ideal para instructores y academias pequeñas.</p>
                        <div className="plan-price">$19<span className="plan-frequency">/mes</span></div>
                        <ul className="plan-features">
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" className="feature-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Control de asistencias
                            </li>
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" className="feature-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Hasta 50 alumnos
                            </li>
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" className="feature-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Acceso a reportes básicos
                            </li>
                        </ul>
                        <a href="#" className="plan-button">
                            Elegir Plan
                        </a>
                    </div>

                    {/* Tarjeta de Plan: Premium (Destacado) */}
                    <div className="plan-card plan-premium">
                        <h3 className="plan-heading">Plan Premium</h3>
                        <p className="plan-description">Para academias en crecimiento.</p>
                        <div className="plan-price">$49<span className="plan-frequency">/mes</span></div>
                        <ul className="plan-features">
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" className="feature-check-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Control de asistencias ilimitado
                            </li>
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" className="feature-check-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Acceso a todos los reportes
                            </li>
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" className="feature-check-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Notificaciones personalizadas
                            </li>
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" className="feature-check-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Soporte 24/7
                            </li>
                        </ul>
                        <a href="#" className="plan-button-premium">
                            Elegir Plan
                        </a>
                    </div>
                    
                    {/* Tarjeta de Plan: Difusión en Unión */}
                    <div className="plan-card plan-special">
                        <h3 className="plan-heading">Plan Difusión</h3>
                        <p className="plan-description">Para la comunidad y eventos masivos.</p>
                        <div className="plan-price">$99<span className="plan-frequency">/mes</span></div>
                        <ul className="plan-features">
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" className="feature-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Todo lo del Plan Premium
                            </li>
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" className="feature-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Envío de mensajes a todas las academias
                            </li>
                            <li>
                                <svg xmlns="http://www.w3.org/2000/svg" className="feature-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Difusión de eventos masivos
                            </li>
                        </ul>
                        <a href="#" className="plan-button">
                            Elegir Plan
                        </a>
                    </div>
                </div>
            </section>

            {/* Pie de página (Footer) */}
            <footer className="footer-section">
                &copy; 2025 Asistente de Asistencia. Todos los derechos reservados.
            </footer>
    </div>
    );
}