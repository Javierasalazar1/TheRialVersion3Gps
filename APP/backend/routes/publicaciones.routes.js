"use strict";
import { Router } from "express";
import publicacionController from "../controllers/publicacion.controller.js";

/** Instancia del enrutador */
const router = Router();

router.get("/", publicacionController.getPublicacion);

router.get("/:id", publicacionController.getPublicacionById);

router.post("/", publicacionController.createPublicacion);

router.delete("/:id", publicacionController.deletePublicacion);

router.post("/:id/like", publicacionController.likePublicacion);

router.post("/:id/dislike", publicacionController.dislikePublicacion);

// Exporta el enrutador
export default router;
