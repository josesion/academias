import multer, { FileFilterCallback } from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req , file, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten archivos de imagen (PNG, JPG, JPEG)"));
    }
  },
});

// --- Subida de media de los anuncios (spec 015) ---------------------------
// Es un middleware APARTE y no una ampliacion de `upload`: flyers y escuelas
// siguen con 5 MB y solo imagenes, y este NO los toca.
//
// Dos decisiones que parecen raras y no lo son:
//
// 1. NO hay `fileFilter`. El `upload` de arriba rechaza con `new Error`, y un
//    error de multer sale por `next()`, cae en el handler global de `app.ts` y
//    responde **500**. Si este middleware acepta cualquier archivo y deja que el
//    Servicio valide el `mimetype`, un PDF o un .txt reciben **400
//    FORMATO_MEDIA_INVALIDO** con codigo propio.
//
// 2. `fileSize` queda en 50 MB, el TECHO MAXIMO, y no en 2 MB. Si estuviera en
//    2 MB, una imagen de 3 MB lanzaria `MulterError: LIMIT_FILE_SIZE` y tambien
//    terminaria en un 500. El tope real de cada tipo (imagen 2 MB, video 50 MB)
//    lo aplica el Servicio.
//
// O sea: multer es aca solo la red de contencion del tamano maximo, y todas las
// reglas de formato y tamano real viven en el Servicio.

export const uploadAnuncio = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB: el maximo absoluto (video)
  },
});

/**
 * Logo de empresa (spec 015). Mismo criterio que `uploadAnuncio`: sin
 * `fileFilter` (el formato lo valida el Servicio con 400) y con `fileSize` en
 * un techo alto para que un logo de 3 MB llegue al Servicio y responda
 * `TAMANO_LOGO_INVALIDO` en vez de exploding en un `MulterError` 500.
 */
export const uploadLogo = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});