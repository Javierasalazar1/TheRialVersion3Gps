"use strict";
import { Router } from "express";

/** Enrutador de usuarios  */
import userRoutes from "./user.routes.js";

/** Enrutador de autenticación */
import authRoutes from "./auth.routes.js";

import publicacionRoute from "./publicaciones.routes.js";

import reporteRoute from "../routes/reporte.routes.js"

import ftpRoute from "../routes/ftp.route.js"

/** Middleware de autenticación */
import authenticationMiddleware from "../middlewares/authentication.middleware.js";

/** Instancia del enrutador */
const router = Router();

// Define las rutas para los usuarios /api/usuarios
router.use("/users", authenticationMiddleware, userRoutes);
// Define las rutas para la autenticación /api/auth
router.use("/auth", authRoutes);

router.use("/publicacion",authenticationMiddleware, publicacionRoute);

router.use("/reporte",authenticationMiddleware,reporteRoute);

router.use("/ftp",authenticationMiddleware,ftpRoute)

// Exporta el enrutador
export default router;
 