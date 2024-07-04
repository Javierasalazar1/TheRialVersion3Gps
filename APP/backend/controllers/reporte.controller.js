"use strict";

import { respondSuccess, respondError } from "../utils/resHandler.js";
import { handleError } from "../utils/errorHandler.js";
import reporteService from "../services/reporte.service.js";
import { reporteBodySchema, reporteIdSchema } from "../schema/reporte.schema.js";

async function createReporte(req, res) {
    try {
        const { body } = req;
        const { error: bodyError } = reporteBodySchema.validate(body);
        if (bodyError) return respondError(req, res, 400, bodyError.message);

        const [newReporte, reporteError] = await reporteService.createReporte(body);

        if (reporteError) return respondError(req, res, 400, reporteError);

        respondSuccess(req, res, 201, newReporte);
    } catch (error) {
        handleError(error, "reporte.controller -> createReporte");
        respondError(req, res, 500, "No se pudo crear el Reporte");
    }
}


async function getReporte(req, res) {
    try {
      const [reporte, response] = await reporteService.getReporte();
      if (!reporte || reporte.length === 0) {
        return respondError(req, res, 400, "No hay publicaciones");
      }
      return respondSuccess(req, res, 200, reporte);
    } catch (error) {
      handleError(error, "publicacion.controller -> getPublicacion");
      return respondError(req, res, 500, "No se pudo obtener la publicación");
    }
  }

async function getReporteById(req, res) {
    try {
      const { params } = req;
      const { error: paramsError } = reporteIdSchema.validate(params);
      if (paramsError) return respondError(req, res, 400, paramsError.message);
  
      const reporte = await reporteService.getReporteById(params.id);
      !reporte
        ? respondError(
            req,
            res,
            404,
            "No se encontro el reporte solicitado",
            "Verifique el id ingresado",
          )
        : respondSuccess(req, res, 200, reporte);
    } catch (error) {
      handleError(error, "publicacion.controller -> getPublicacionById");
      respondError(req, res, 500, "No se pudo eobtener la reporte..");
    }
  }

  async function deleteReporte(req, res) {
    try {
      const { params } = req;
      const { error: paramsError } = reporteIdSchema.validate(params);
      if (paramsError) return respondError(req, res, 400, paramsError.message);
  
      const reporte = await reporteService.deleteReporte(params.id);
      !reporte
        ? respondError(
            req,
            res,
            404,
            "No se encontro el usuario solicitado",
            "Verifique el id ingresado",
          )
        : respondSuccess(req, res, 200, reporte);
    } catch (error) {
      handleError(error, "publicacion.controller -> getPublicacionById");
      respondError(req, res, 500, "No se pudo eobtener la reporte.");
    }
  }

export default {
    createReporte,
    getReporte,
    getReporteById,
    deleteReporte,
};
