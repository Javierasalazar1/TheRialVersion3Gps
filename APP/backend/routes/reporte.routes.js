"use strict";
import { Router } from "express";

import reporteController from "../controllers/reporte.controller.js";

/** Instancia del enrutador */
const router = Router();

router.post("/",reporteController.createReporte);;

router.get("/", reporteController.getReporte);

router.get("/:id", reporteController.getReporteById);

router.delete("/:id", reporteController.deleteReporte);

export default router;
