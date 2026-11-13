import { Router } from "express";
import { method as controladorEscuelasPublicas } from "../controladores/escuelas.publicas.controlador";

const ruta = Router();

// Listado público: el Login (`/login`) lo consume sin sesión, así que NO lleva
// `validarPermiso`. Es catálogo comercial, no dato de tenant (mismo criterio
// que el listado público de `planes_saas.ruta.ts:11-14`: la SQL no filtra por
// `id_escuela` ni lee `req.usuario`). Sin cookie, sin query y sin body.
ruta.get("/api/escuelas_publicas", controladorEscuelasPublicas.listarEscuelasPublicas);

export default ruta;
