# 📘 Manual de Uso – API de Planes Mensuales (Postman)

Este documento describe cómo utilizar la API de planes mensuales desde **Postman**, incluyendo configuración de rutas, tipos de cuerpo, parámetros y ejemplos.

---

## 📌 1. Crear un Plan

**Método:** `POST`  
**URL:** `http://localhost:3000/api/planes_alta`

### 🔧 Configuración en Postman

1. Método: `POST`
2. URL: `http://localhost:3000/api/planes_alta`
3. Ir a la pestaña **Body**
4. Elegir **raw** y seleccionar **JSON**
5. Pegar el siguiente ejemplo:

```json
{
  "descripcion": "Plan Básico",
  "limites_cedes": 3,
  "precio_mensual": 100,
  "estado": true
}


Respuesta esperada


{
  "error": false,
  "message": "Plan creado exitosamente",
  "data": {
    "descripcion": "Plan Básico",
    "limites_cedes": 3,
    "precio_mensual": 100,
    "estado": true
  },
  "paginacion": undefined,
  "code": "PLAN_CREATED"
}



📌 2. Modificar un Plan
Método: PUT
URL: http://localhost:3000/api/mod_planes/:id

🔧 Configuración en Postman
Método: POST

URL: http://localhost:3000/api/mod_planes/10

Ir a Body → raw → JSON

Ingresar:


{
  "descripcion": "Plan Avanzado",
  "limites_cedes": 6,
  "precio_mensual": 180,
  "estado": true
}
✅ Respuesta esperada

{
  "error": false,
  "message": "Plan modificado correctamente",
  "data": {
    "id": 5,
    "descripcion": "Plan Avanzado",
    "limites_cedes": 6,
    "precio_mensual": 180,
    "estado": true
  },
  "paginacion": undefined,
  "code": "PLAN_UPDATED"
}


📌 3. Listado de Planes (GET)

## ✅ Endpoint

**Método:** `GET`  
**Ruta:** `/api/planes_listar`  
**Descripción:** Devuelve una lista de planes mensuales filtrados por estado, ordenados por campo, y paginados.

---

## 🔧 Parámetros de query (URL)

| Parámetro     | Tipo     | Requerido | Descripción                                         |
|---------------|----------|-----------|-----------------------------------------------------|
| `estado`      | string   | ✅        | Estado del plan:  (activos) ,(inactivos) o (pendientes) |
| `orden`       | string   | ✅        | Campo y dirección de ordenamiento, ej. `id ASC`, `precio_mensual DESC` |
| `descripcion` | string   | ✅        | Filtro por el comienzo de la descripción del plan    |
| `limit`       | number   | ✅        | Número máximo de resultados por página              |
| `pagina`      | number   | ✅        | Número de la página actual                          |

---

## 🧪 Ejemplo de request (usando Postman o navegador)
GET http://localhost:4000/api/planes_listar?estado=true&orden=descripcion&descripcion=Plan&limit=10&pagina=1


## 📥 Ejemplo de respuesta exitosa

```json
{
  "error": false,
  "message": "Planes listados true",
  "data": [
    {
      "id": 1,
      "descripcion": "Plan Básico",
      "limites_cedes": 3,
      "precio_mensual": 100,
      "estado": true
    },
    {
      "id": 2,
      "descripcion": "Plan Avanzado",
      "limites_cedes": 6,
      "precio_mensual": 180,
      "estado": true
    }
  ],
  "paginacion": {
    "pagina": 1,
    "limite": 10,
    "contadorPagina": 2
  },
  "code": "PLANS_LISTED"
}

⚠️ Posibles errores
    Sin resultados
{
  "error": true,
  "message": "No hay planes true",
  "code": "NO_ACTIVE_PLANS",
  "errorsDetails": undefined
}