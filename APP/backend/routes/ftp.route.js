"use strict";
import { Router } from "express";

import multer from 'multer';

import ftpController from "../controllers/ftp.controller.js";

const upload = multer({ dest: 'uploads/' }); // Especifica la carpeta donde se guardarán los archivos temporales

const router = Router();

router.post("/", upload.single('file'), ftpController.uploadFileToFTP);;

router.get("/", ftpController.listFiles)

export default router;
