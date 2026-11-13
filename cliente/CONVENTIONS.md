# AGENTS.md

Frontend diseno y estructura para manejar, este agente servira tamb para ir aprendiendo la forma de trabajar en este proyecto

## Comandos

## Forma de trabajar

- Haz solo lo que se te pide; no agregues funcionalidades nuevas por tu cuenta.
- A las funciones que ya están bien, créales su respectivo JSDoc.
- Haz cambios chicos y enfocados: no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisarse.
- Todos los archivos ya no seran .js seran por defecto ts por el tipado
- Siempre al terminar muestrame los cambios q hiciste

## Memoria

- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones y errores a evitar.
- Si algo se convierte en una regla permanente, propón moverlo a `AGENTS.md` en lugar de dejarlo en memoria.
- No guardes nunca datos sensibles (claves, tokens, ni datos personales).

## Límites

- **Idioma:** Mantener todo en castellano.
- **Autorización previa:** Preguntar antes de crear archivos nuevos o cambiar el formato de los datos guardados.
- **Dependencias:** Nunca agregues dependencias que no se te pidieron (salvo las autorizadas en la sección de Entorno).

## Dependencias y Entorno

-Agregar las dependencias q se usen

### Base de datos

- **La BD que se toca es siempre la LOCAL de desarrollo**, nunca la de Aiven.
  - Local: `localhost:3306` / base `academia_danzas_db` (usuario `root`).
  - Aiven (nube) está **comentado** en `server/.env`: no lo descomentes para
    probar una funcionalidad nueva salvo que el usuario lo pida explícitamente.
- **Toda tabla nueva va con su `.sql` en `server/consultas.data/`** y se crea
  corriendo `npm run migrar` (desde `server/`). El script es idempotente y
  deja registro en la tabla `migraciones_aplicadas`.
- Para correr las migraciones hay que compilar y **reiniciar el server**
  (`npm run build` y relanzar `node build/index.js`): si no, sigue sirviendo
  el build viejo y las rutas nuevas dan `Cannot GET ...`.

## Control de Versiones (Git)

- **Archivos de Agentes en .gitignore:** Todos los archivos `.md` de uso interno para agentes (como `MEMORY.md`, notas de contexto u otros archivos de instrucciones de IA que no formen parte de la documentación oficial) **deben** estar incluidos en el archivo `.gitignore` para evitar subirlos por accidente al repositorio remoto.
- **Archivos de configuración MCP en .gitignore:** Los archivos de configuración de MCP como `opencode.json` (que pueden contener credenciales en texto plano) **deben** estar incluidos en el archivo `.gitignore` para evitar subirlos por accidente al repositorio remoto.

## Registro de estructura

Antes de empezar una tarea, lee `ESTRUCTURA.md` este archivo sirve para ir que vayas aprendiendo la forma de trabajar.

Al terminar toda tarea que cree, mueva o renombre archivos:

1. Agrega o actualiza la entrada del módulo en `ESTRUCTURA.md`, con las
   rutas reales de los archivos que existen.
2. Si algo no sigue las reglas de este documento, anótalo en "Desviaciones".
   NO cambies las reglas de este documento por tu cuenta.
3. Si dudas dónde va algo, anótalo en "Pendientes" y pregúntame.
4. Registra solo hechos verificables (rutas y nombres). No resumas ni infieras
   lógica de negocio.
5. No edites ningún otro archivo de documentación.

## Estilado de los componentes y pagina

    - Si tienes q hacer algun tipo de css lee "app.css" y en el root tenemos las bases del estilo
