import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import mysql, { Connection } from "mysql2/promise";

dotenv.config();

/**
 * Script de migración de la base de datos LOCAL de desarrollo.
 *
 * Lee todos los `.sql` de `server/consultas.data/` y aplica los que todavía
 * no se aplicaron, dejando registro en la tabla `migraciones_aplicadas`.
 *
 * - Es **idempotente**: si el archivo falla porque el objeto ya existe
 *   (tabla/columna/índice/base), se marca como aplicado y sigue.
 * - Corre contra la BD del `.env` (en desarrollo: `localhost` / `academia_danzas_db`).
 *   **Nunca** contra Aiven: para eso hay que cambiar el `.env` a mano.
 * - Los archivos que no son `.sql` (`.md`) se ignoran.
 *
 * Uso: `npm run migrar` (desde `server/`).
 */

/** Carpeta con los archivos `.sql` de referencia. */
const CARPETA_SQL = path.join(__dirname, "..", "..", "consultas.data");

/** Nombre de la tabla de control de migraciones aplicadas. */
const TABLA_CONTROL = "migraciones_aplicadas";

/** Crea la tabla de control si no existe. */
const crearTablaControl = async (con: Connection): Promise<void> => {
  await con.query(`
    CREATE TABLE IF NOT EXISTS ${TABLA_CONTROL} (
      archivo VARCHAR(190) NOT NULL PRIMARY KEY,
      aplicado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
};

/** Devuelve el Set de archivos ya aplicados. */
const migracionesAplicadas = async (
  con: Connection,
): Promise<Set<string>> => {
  const [filas] = await con.query(
    `SELECT archivo FROM ${TABLA_CONTROL}`,
  );
  return new Set<string>(
    (filas as { archivo: string }[]).map((f) => f.archivo),
  );
};

/** Registra un archivo como aplicado. */
const registrarAplicada = async (
  con: Connection,
  archivo: string,
): Promise<void> => {
  await con.query(
    `INSERT IGNORE INTO ${TABLA_CONTROL} (archivo) VALUES (?)`,
    [archivo],
  );
};

/**
 * Detecta si el error se puede ignorar sin frenar la migración.
 *
 * - "el objeto ya existe": ER_TABLE_EXISTS_ERROR (1050), ER_DUP_FIELDNAME
 *   (1060), ER_DUP_KEYNAME (1061), ER_FK_DUP_NAME (1826),
 *   ER_DB_CREATE_EXISTS (1007).
 * - "el seed ya está cargado": ER_NO_REFERENCED_ROW_2 (1452, FK) y
 *   ER_DUP_ENTRY (1062, clave duplicada). Los `.sql` de `consultas.data/` son
 *   a la vez DDL y seed: sus INSERTs fallan si los datos ya están, y eso
 *   no debe frenar la migración.
 */
const esErrorIgnorable = (err: unknown): boolean => {
  const codigo = (err as { code?: string })?.code;
  const errno = (err as { errno?: number })?.errno;
  return (
    codigo === "ER_TABLE_EXISTS_ERROR" ||
    codigo === "ER_DUP_FIELDNAME" ||
    codigo === "ER_DUP_KEYNAME" ||
    codigo === "ER_FK_DUP_NAME" ||
    codigo === "ER_DB_CREATE_EXISTS" ||
    codigo === "ER_NO_REFERENCED_ROW_2" ||
    codigo === "ER_DUP_ENTRY" ||
    errno === 1050 ||
    errno === 1060 ||
    errno === 1061 ||
    errno === 1826 ||
    errno === 1007 ||
    errno === 1452 ||
    errno === 1062
  );
};

/**
 * Divide un archivo SQL en sentencias ejecutables.
 *
 * Respeta el comando `DELIMITER` de MySQL (lo usan los triggers de
 * `trigers.sql`, que llevan `BEGIN ... END` con `;` adentro). El delimitador
 * **no** forma parte de la sentencia: sólo marca dónde termina.
 *
 * @param {string} contenido - Contenido crudo del archivo `.sql`.
 * @returns {string[]} Lista de sentencias a ejecutar por separado.
 */
const dividirEnSentencias = (contenido: string): string[] => {
  const lineas = contenido.split(/\r?\n/);
  const sentencias: string[] = [];

  let delimitador = ";";
  let buffer = "";

  const cerrar = (): void => {
    const sentencia = buffer.trim();
    buffer = "";
    if (!sentencia) return;
    // Se quita el delimitador final: MySQL no lo entiende como parte de la
    // sentencia cuando no es ";" (caso de los triggers con "//").
    const limpia = sentencia.endsWith(delimitador)
      ? sentencia.slice(0, sentencia.length - delimitador.length).trim()
      : sentencia;
    if (limpia.length > 0 && !limpia.startsWith("--")) {
      sentencias.push(limpia);
    }
  };

  for (const linea of lineas) {
    const trim = linea.trim();

    // Cambio de delimitador: "DELIMITER //" (no es una sentencia SQL)
    if (/^DELIMITER\s+\S+/i.test(trim)) {
      cerrar();
      delimitador = trim.split(/\s+/)[1];
      continue;
    }

    buffer += `${linea}\n`;

    // La sentencia termina cuando la línea cierra con el delimitador activo
    if (trim.endsWith(delimitador)) {
      cerrar();
    }
  }

  cerrar();

  return sentencias;
};

/** Lista los archivos `.sql` de la carpeta, en orden alfabético. */
const listarArchivosSql = (): string[] => {
  if (!fs.existsSync(CARPETA_SQL)) {
    throw new Error(`No existe la carpeta de consultas: ${CARPETA_SQL}`);
  }
  return fs
    .readdirSync(CARPETA_SQL)
    .filter((f) => f.toLowerCase().endsWith(".sql"))
    .sort();
};

/**
 * Ejecuta la migración de los `.sql` pendientes.
 *
 * @param {Connection} con - Conexión abierta a la BD.
 * @returns {Promise<{aplicados: string[], omitidos: string[], fallidos: string[]}>}
 *   Resumen de lo que se aplicó, se omitió y falló.
 */
export const ejecutarMigraciones = async (
  con: Connection,
): Promise<{
  aplicados: string[];
  omitidos: string[];
  fallidos: string[];
}> => {
  const archivos = listarArchivosSql();
  const yaAplicados = await migracionesAplicadas(con);

  const aplicados: string[] = [];
  const omitidos: string[] = [];
  const fallidos: string[] = [];

  for (const archivo of archivos) {
    if (yaAplicados.has(archivo)) {
      omitidos.push(archivo);
      continue;
    }

    const ruta = path.join(CARPETA_SQL, archivo);
    const contenido = fs.readFileSync(ruta, "utf8");
    const sentencias = dividirEnSentencias(contenido);

    let fallo: unknown = null;

    for (const sentencia of sentencias) {
      try {
        await con.query(sentencia);
      } catch (err) {
        if (esErrorIgnorable(err)) continue; // ya estaba: se ignora
        fallo = err;
        break;
      }
    }

    if (fallo) {
      fallidos.push(archivo);
      console.error(`  x ${archivo}: ${(fallo as Error).message}`);
      continue;
    }

    await registrarAplicada(con, archivo);
    aplicados.push(archivo);
    console.log(`  v ${archivo}`);
  }

  return { aplicados, omitidos, fallidos };
};

/**
 * Punto de entrada por consola: `npm run migrar`.
 */
const correrDesdeConsola = async (): Promise<void> => {
  const db = process.env.DATABASE ?? "(sin definir)";
  const host = process.env.DB_HOST ?? "(sin definir)";

  console.log("==============================================");
  console.log("  Migracion de base de datos (LOCAL)");
  console.log("==============================================");
  console.log(`  Host:     ${host}`);
  console.log(`  Base:     ${db}`);
  console.log(`  Origen:   ${CARPETA_SQL}`);
  console.log("----------------------------------------------");

  const con = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
    port: Number(process.env.DB_PORT) || 3306,
    multipleStatements: false,
  });

  try {
    await crearTablaControl(con);
    const { aplicados, omitidos, fallidos } = await ejecutarMigraciones(con);

    console.log("----------------------------------------------");
    console.log(`  Aplicados:  ${aplicados.length}`);
    console.log(`  Omitidos:   ${omitidos.length} (ya estaban)`);
    console.log(`  Fallidos:   ${fallidos.length}`);
    if (fallidos.length > 0) {
      console.log("  Revisar los archivos fallidos antes de seguir.");
    }
    console.log("==============================================");
  } finally {
    await con.end();
  }
};

// Sólo se ejecuta si el archivo se invoca directo (`npm run migrar`),
// no cuando se importa desde otro módulo.
if (require.main === module) {
  correrDesdeConsola().catch((err) => {
    console.error("Error en la migracion:", err.message);
    process.exit(1);
  });
}
