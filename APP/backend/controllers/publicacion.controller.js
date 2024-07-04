"use strict";

import { publicaionesBodySchema, publicaionesIdSchema } from "../schema/publicacion.schema.js";
import publicacionService from "../services/publicacion.service.js";
import { handleError } from "../utils/errorHandler.js";
import { respondSuccess, respondError } from "../utils/resHandler.js";
import { setupFTP } from "../config/configFTP.js";

// Función para verificar si una imagen existe en el directorio raíz del servidor FTP
export const checkImageExists = async (imageName) => {
  try {
    const client = await setupFTP();

    return new Promise((resolve, reject) => {
      client.list((err, list) => {
        if (err) {
          client.end();
          reject(err);
        } else {
          console.log("Archivos encontrados en el directorio raíz:");
          list.forEach(file => console.log(file.name));

          const exists = list.some(file => file.name === imageName);
          client.end();
          resolve(exists); // Resuelve con el valor de exists (true/false)
        }
      });
    });
  } catch (error) {
    throw error;
  }
};

async function createPublicacion(req, res) {
  try {
    const { body } = req;
    const { error: bodyError } = publicaionesBodySchema.validate(body);

    // Verificar si la imagen existe antes de continuar
    const imageExists = await checkImageExists(body.imagen);
    if (!imageExists) {
      return respondError(req, res, 400, "No existe la imagen en el Servidor");
    }

    if (bodyError) return respondError(req, res, 400, bodyError.message);

    const [newUser, userError] = await publicacionService.createPublicacion(body);

    if (userError) return respondError(req, res, 400, userError);
    if (!newUser) {
      return respondError(req, res, 400, "No se la publicacion");
    }

    respondSuccess(req, res, 201, newUser);
  } catch (error) {
    handleError(error, "publicacion.controller -> createPublicacion");
    respondError(req, res, 500, "No se creo la publicacion");
  }
}

async function getPublicacion(req, res) {
  try {
    const [publicaciones, response] = await publicacionService.getPublicacion();
    if (!publicaciones || publicaciones.length === 0) {
      return respondError(req, res, 400, "No hay publicaciones");
    }
    return respondSuccess(req, res, 200, publicaciones);
  } catch (error) {
    handleError(error, "publicacion.controller -> getPublicacion");
    return respondError(req, res, 500, "No se pudo obtener la publicación");
  }
}

async function deletePublicacion(req, res) {
  try {
    const { params } = req;
    const { error: paramsError } = publicaionesIdSchema.validate(params);
    if (paramsError) return respondError(req, res, 400, paramsError.message);

    const user = await publicacionService.deletePublicacion(params.id);
    !user
      ? respondError(
          req,
          res,
          404,
          "No se encontro el usuario solicitado",
          "Verifique el id ingresado",
        )
      : respondSuccess(req, res, 200, user);
  } catch (error) {
    handleError(error, "publicacion.controller -> deletePublicacion");
    respondError(req, res, 500, "No se pudo eliminar la publicacion");
  }
}

async function getPublicacionById(req, res) {
  try {
    const { params } = req;
    const { error: paramsError } = publicaionesIdSchema.validate(params);
    if (paramsError) return respondError(req, res, 400, paramsError.message);

    const user = await publicacionService.getPublicacionById(params.id);
    !user
      ? respondError(
          req,
          res,
          404,
          "No se encontro el usuario solicitado",
          "Verifique el id ingresado",
        )
      : respondSuccess(req, res, 200, user);
  } catch (error) {
    handleError(error, "publicacion.controller -> getPublicacionById");
    respondError(req, res, 500, "No se pudo eobtener la publicacion");
  }
}

async function likePublicacion(req, res) {
  try {
    const { params } = req;
    const { error: paramsError } = publicaionesIdSchema.validate(params);
    if (paramsError) return respondError(req, res, 400, paramsError.message);

    const [updatedPublicacion, updateError] = await publicacionService.likePublicacion(params.id);
    if (updateError) return respondError(req, res, 400, updateError);

    respondSuccess(req, res, 200, updatedPublicacion);
  } catch (error) {
    handleError(error, "publicacion.controller -> likePublicacion");
    respondError(req, res, 500, "No se pudo dar like a la publicacion");
  }
}

async function dislikePublicacion(req, res) {
  try {
    const { params } = req;
    const { error: paramsError } = publicaionesIdSchema.validate(params);
    if (paramsError) return respondError(req, res, 400, paramsError.message);

    const [updatedPublicacion, updateError] = await publicacionService.dislikePublicacion(params.id);
    if (updateError) return respondError(req, res, 400, updateError);

    respondSuccess(req, res, 200, updatedPublicacion);
  } catch (error) {
    handleError(error, "publicacion.controller -> dislikePublicacion");
    respondError(req, res, 500, "No se pudo dar dislike a la publicacion");
  }
}

export default {
  createPublicacion,
  getPublicacion,
  deletePublicacion,
  getPublicacionById,
  likePublicacion,
  dislikePublicacion,
};
