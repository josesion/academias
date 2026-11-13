# DanzaStudio Pro – SaaS de Gestión para Academias de Baile

Aplicación web full-stack de arquitectura multi-escuela (SaaS) diseñada para optimizar y automatizar la administración operativa, financiera y académica de academias de baile.

## 🛠️ Stack Tecnológico

- **Frontend:** React, TypeScript, JavaScript, CSS / HTML.
- **Backend:** Node.js, Express, APIs REST.
- **Base de Datos:** MySQL (Diseño relacional).
- **Control de Versiones:** Git & GitHub.

---

## 🚀 Módulos y Funcionalidades Principales

### 1. ABMs Genéricos y Entidades
- **Configuraciones:** Métodos de pago, categorías de caja (con clasificación dinámica de ingresos/egresos y anulaciones) y tipos de música (bachata, salsa, etc.).
- **Académico:** Niveles, gestión de alumnos, profesores y planes de pago configurables (ej. cuotas mensuales y cantidad de clases habilitadas).

### 2. Módulo de Horarios
- Creación, baja y administración de clases considerando día, horario, profesor asignado, nivel y tipo de música.

### 3. Kiosco de Asistencia (Auto-gestión)
- Sistema pensado para agilizar el ingreso y evitar filas.
- Los alumnos ingresan su DNI y el sistema valida si poseen una inscripción activa para la clase en curso.
- **Ventana horaria inteligente:** Permite el fichaje desde 15 minutos antes hasta 30 minutos después del inicio de la clase para mantener el orden temporal.

### 4. Gestión de Inscripciones y Caja
- **Inscripciones:** Vinculación de alumnos con planes de pago y métodos de pago seleccionados.
- **Control Financiero y Métricas:**
  - Monto inicial, total de ingresos, total de egresos, flujo de sesión y balance neto.
  - Apertura y cierre de caja mediante modales específicos que auditan los montos por método de pago (con cálculo automático de faltantes/sobrantes y campo de justificación de diferencias).
  - Registro de movimientos manuales (ingresos/egresos operativos atados a categorías).
  - Listado de saldos desagregados por cada método de pago (efectivo, billeteras virtuales, etc.).

### 5. Dashboard Principal e Inicio
- **Métricas Clave:** Alumnos con planes activos, altas nuevas del mes, próximos vencimientos a 7 días, cuotas vencidas en el mes y saldo total en caja.
- **Panel en Vivo:** Detección automática de la clase activa según el horario, mostrando los alumnos registrados en tiempo real a través del kiosco de asistencia.
- **Historial de Auditoría (Log de Actividades):** Registro general de acciones en la app (usuario, sección afectada, tipo de acción realizada como inicio/cierre de sesión o modificaciones, y descripción detallada).

### 6. Historial y Cajas Cerradas (En desarrollo activo)
- Encabezado de estado de caja actual.
- Listado histórico de cajas cerradas con filtros avanzados y métricas gráficas por método de pago.
- Visualización de movimientos en formato de libro diario y gráficos analíticos al seleccionar una caja específica.

---

## ⚙️ Arquitectura
Desarrollado bajo un esquema cliente-servidor desacoplado, asegurando integridad transaccional en bases de datos relacionales MySQL, validaciones estrictas de negocio tanto en el frontend como en el backend, y un diseño modular listo para escalar a múltiples instituciones.

---
*Desarrollado por [Jose Manuel Lopez](https://github.com/josesion).*
