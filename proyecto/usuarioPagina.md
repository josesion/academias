============================================================
🏫 PANEL DE USUARIO – DUEÑO DE LA ACADEMIA
============================================================

Vista principal que combina:

- métricas
- operación diaria
- asistencia
- accesos rápidos
- base para futuras pantallas

---

## 1️⃣ MÉTRICAS DEL DÍA (RESUMEN)

┌─────────────────────────────────────┐
│ 📊 Hoy en la academia │
├─────────────────────────────────────┤
│ Alumnos inscriptos hoy: 3 │
│ Clases dictadas hoy: 2 │
│ Asistencias registradas: 18 │
└─────────────────────────────────────┘

Últimas inscripciones:
• Juan Pérez – Plan Básico
• Ana López – Plan Intermedio
• Marcos Díaz – Plan Básico

---

## 2️⃣ CLASE EN CURSO (OPERACIÓN PRINCIPAL)

(Solo visible si hay una clase activa ahora)

┌─────────────────────────────────────┐
│ ▶ Clase en curso │
├─────────────────────────────────────┤
│ 🕘 09:00 – 10:00 │
│ Nivel: Básico │
│ Tipo: Grupo │
│ Profesor: Laura Gómez │
│ │
│ Alumnos inscriptos: │
│ • Juan Pérez [ ✔ Presente ] │
│ • Ana López [ ✔ Presente ] │
│ • Marcos Díaz [ Ausente ] │
│ • Sofía Núñez [ — ] │
│ │
│ [ Guardar asistencia ] │
└─────────────────────────────────────┘

Estados:
✔ Presente → registro en asistencias
Ausente → no asistió
— → aún no marcado

Si no hay clase:
“No hay clases en curso en este momento”

---

## 3️⃣ ACCIONES RÁPIDAS

Botones simples (abren modales, no cambian de página)

┌─────────────────────────────────────┐
│ Acciones │
├─────────────────────────────────────┤
│ [ + Agregar Inscripción ] │
│ [ + Agregar Horario ] │
│ [ + Registrar Asistencia Manual ] │
└─────────────────────────────────────┘

---

## 4️⃣ REGISTRAR ASISTENCIA (MODO MANUAL)

Pensado para:

- mostrador
- cuando el profe avisa
- alumno fuera del horario automático

┌─────────────────────────────────────┐
│ 📝 Registrar asistencia │
├─────────────────────────────────────┤
│ DNI Alumno: [__________] │
│ Horario: [ 09:00 Básico ▼ ] │
│ │
│ [ Marcar presente ] │
└─────────────────────────────────────┘

Validaciones backend:
✔ inscripción activa
✔ no vencida por fecha
✔ no vencida por clases
✔ no duplicar misma clase/día

---

## 5️⃣ LISTADO GENERAL (ADMINISTRACIÓN)

Pantalla aparte / sección inferior

┌─────────────────────────────────────┐
│ 📚 Inscripciones │
├─────────────────────────────────────┤
│ Juan Pérez | Básico | Activo │
│ Ana López | Interm | Activo │
│ Marcos Díaz | Básico | Vencido │
└─────────────────────────────────────┘

Acciones:

- ver asistencias
- ver clases restantes
- ver historial

---

## 6️⃣ FUTURO: VISTA ALUMNO (OTRA PÁGINA)

Permisos limitados
Misma lógica backend

┌─────────────────────────────────────┐
│ 👤 Mi clase de hoy │
├─────────────────────────────────────┤
│ 🕘 09:00 – Básico │
│ Profesor: Laura │
│ │
│ [ Marcar asistencia ] │
└─────────────────────────────────────┘

Reglas:

- solo puede marcar su propia asistencia
- no ve otros alumnos

---

## 🧠 CONCEPTOS CLAVE DEL DISEÑO

• Pensar reglas antes de codear ✔
• No guardar contadores, calcular por asistencias ✔
• Asistencia = evento (no estado)
• Inscripción manda el estado
• Modales para evitar solaparse con menú
• Clase en curso = feature central del sistema

---

## 📌 NOTA FINAL

Este diseño permite:

- crecer sin romper nada
- agregar automatismos luego
- reutilizar backend
- mantener coherencia de negocio

============================================================
