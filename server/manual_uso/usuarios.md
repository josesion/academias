# 👤 API - Alta de Usuario

## 📌 Ruta

**Método:** `POST`  
**Endpoint:** `/api/usuario_alta`  
**Descripción:** Crea un nuevo usuario en el sistema. Antes de insertar, se valida que el nombre de usuario no exista. La contraseña se guarda hasheada.

---

## 📥 Body esperado (JSON)

```json
{
  "usuario": "jdoe",
  "contrasena": "supersegura123",
  "nombre": "Juan",
  "apellido": "Doe",
  "celular": "1234567890",
  "rol": "admin",
  "correo": "jdoe@example.com",
  "estado": true
}

 Ejemplo de respuesta exitosa (201)
{
  "error": false,
  "message": "Usuario creado exitosamente",
  "data": {
    "usuario": "jdoe",
    "correo": "jdoe@example.com"
  },
  "paginacion": undefined,
  "code": "USER_CREATED"
}
 Si el usuario ya existe
 {
  "error": true,
  "message": "Verificar el Usuario",
  "code": "USER_FOUND",
  "errorsDetails": undefined
}

-------------------------------------------------------------------------------------
# - Modificación Pública de Usuario

## 📌 Ruta

**Método:** `PUT`  
**Endpoint:** `/api/usuario_mod/:usuario`  
**Descripción:** Permite modificar datos públicos del usuario identificado por su nombre de usuario (`:usuario`), como nombre, apellido, celular y correo.
### 🔗 URL Params

| Parámetro | Tipo     | Descripción                    |
|-----------|----------|--------------------------------|
| usuario   | `string` | Nombre de usuario a modificar. |

Body esperado (JSON)

```json
{
  "nombre": "Juan",
  "apellido": "Modificado",
  "celular": "1122334455",
  "correo": "nuevo@mail.com"
}
 Ejemplo de respuesta exitosa (200)
 {
  "error": false,
  "message": "Usuario Modifcado exitosamente",
  "data": {
    "usuario": "jdoe",
    "nombre": "Juan",
    "apellido": "Modificado",
    "celular": "1122334455",
    "correo": "nuevo@mail.com"
  },
  "paginacion": undefined,
  "code": "USER_UPDATED"
}

Errores posibles⚠️
{
  "error": true,
  "message": "No se logro modificar el Usuario",
  "code": "UPDATE_FAILED"
}

--------------------------------------------------------------------------------
# - Modificación Privada de Usuario

## 📌 Ruta

**Método:** `PUT`  
**Endpoint:** `/api/usuario_mod_priv/:usuario`  
**Descripción:** Permite modificar información sensible del usuario, como su **rol** y **estado**. Esta ruta está pensada para uso administrativo.

---

## 📥 Parámetros

### 🔗 URL Params

| Parámetro | Tipo     | Descripción                    |
|-----------|----------|--------------------------------|
| usuario   | `string` | Nombre de usuario a modificar. |

---

## 📥 Body esperado (JSON)

```json
{
  "rol": "ADMIN",
  "estado": "activo"
}
📄 Ejemplo de respuesta exitosa (200)
{
  "error": false,
  "message": "Usuario Modifcado exitosamente",
  "data": {
    "usuario": "jdoe",
    "rol": "ADMIN",
    "estado": "activo"
  },
  "paginacion": undefined,
  "code": "USER_UPDATED"
}
⚠️ Errores posibles
❌ Usuario no encontrado o no se pudo modificar
{
  "error": true,
  "message": "No se logro modificar el Usuario",
  "code": "UPDATE_FAILED"
}

----------------------------------------------------------------------------------
# Modificación de Contraseña

## 📌 Ruta

**Método:** `PUT`  
**Endpoint:** `/api/usuario_mod_p/:usuario`  
**Descripción:** Permite a un usuario cambiar su contraseña actual por una nueva. Es necesario validar la contraseña anterior.

---

## 📥 Parámetros

### 🔗 URL Params

| Parámetro | Tipo     | Descripción                    |
|-----------|----------|--------------------------------|
| usuario   | `string` | Nombre del usuario a modificar |

---

## 📥 Body esperado (JSON)

```json
{
  "password": "miContraseñaActual123",
  "nuevaPassword": "miNuevaContraseñaSegura456"
}
📄 Ejemplo de respuesta exitosa (200)
{
  "error": false,
  "message": "Contraseña cambiada",
  "data": {
    "usuario": "jdoe"
  },
  "paginacion": undefined,
  "code": "PASSWORD_UPDATED"
}
⚠️ Errores posibles

❌ Usuario no encontrado
{
  "error": true,
  "message": "Usuario no encontrado",
  "code": "USER_NOT_FOUND"
}
❌ Contraseña actual incorrecta
{
  "error": true,
  "message": "La contraseña actual es incorrecta.",
  "code": "INVALID_PASSWORD"
}
❌ Fallo al actualizar contraseña
{
  "error": true,
  "message": "No se logro cambiar la contraseña",
  "code": "PASSWORD_UPDATE_FAIL"
}

-----------------------------------------------------------------------------
#  - Listado de Usuarios

## 📌 Ruta

**Método:** `GET`  
**Endpoint:** `/api/lista_usuario`  
**Descripción:** Permite obtener un listado paginado de usuarios con múltiples filtros por campos opcionales.

---

## 📥 Parámetros (query)

| Nombre     | Tipo     | Requerido | Descripción                             |
|------------|----------|-----------|-----------------------------------------|
| pagina     | number   | ✅        | Número de página (inicia en 1)          |
| limit      | number   | ✅        | Cantidad de resultados por página       |
| usuario    | string   | ❌        | Filtro por nombre de usuario (LIKE)     |
| nombre     | string   | ❌        | Filtro por nombre (LIKE)                |
| apellido   | string   | ❌        | Filtro por apellido (LIKE)              |
| rol        | string   | ❌        | Filtro por rol (debe coincidir)         |
| correo     | string   | ❌        | Filtro por correo (LIKE)                |
| estado     | string   | ✅        | Estado del usuario (`activo`, `inactivo`, etc.) |

> 📌 Todos los filtros `LIKE` deben ser enviados con el símbolo `%` si se desea usar comodines. Ejemplo: `%juan%`

---

## ✅ Ejemplo en Postman

### 🔗 URL completa
 GET http://localhost:4000/api/lista_usuario?usuario=%&nombre=%&apellido=%&rol=usuario&correo=%&estado=activos&limit=10&pagina=1

 1. Método: `GET`
2. En la pestaña **Params**, ingresá los filtros deseados.

---

## 📄 Ejemplo de respuesta exitosa (200)

```json
{
  "error": false,
  "message": "Listado Usuarios : activo",
  "data": [
    {
      "usuario": "juan23",
      "nombre": "Juan",
      "apellido": "Pérez",
      "celular": "1123456789",
      "rol": "admin",
      "correo": "juan23@example.com",
      "estado": "activo"
    }
    // ... otros usuarios
  ],
  "paginacion": {
    "pagina": 1,
    "limite": 10,
    "contadorPagina": 3
  },
  "code": "USERS_LISTED"
}

⚠️ Posibles Errores
❌ No hay usuarios activos
{
  "error": true,
  "message": "No hay Usuarios activo",
  "code": "NO_ACTIVE_USERS"
}
❌ Validación fallida
{
  "error": true,
  "message": "Error de validación",
  "code": "VALIDATION_ERROR",
  "errorsDetails": {
    "estado": "Debe ser 'activo' o 'inactivo'"
  }
}