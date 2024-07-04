"use strict";


import { respondSuccess, respondError } from "../utils/resHandler.js";
import { handleError } from "../utils/errorHandler.js";

/** Servicios de autenticación */
import AuthService from "../services/auth.service.js";
import { authLoginBodySchema } from "../schema/auth.schema.js";

import UserService from "../services/user.service.js";
import { userBodySchema, userIdSchema } from "../schema/user.schema.js";


/**
 * Inicia sesión con un usuario.
 * @async
 * @function login
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function login(req, res) {
  try {
    const { body } = req;
    const { error: bodyError } = authLoginBodySchema.validate(body);
    if (bodyError) return respondError(req, res, 400, bodyError.message);

    const [accessToken, refreshToken, errorToken] =
      await AuthService.login(body);

    if (errorToken) return respondError(req, res, 400, errorToken);

    // Obtener la fecha de expiración del token
    const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días desde ahora

    // Existen más opciones de seguridad para las cookies
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    // Respondemos con el token de acceso y la fecha de expiración
    respondSuccess(req, res, 200, { accessToken, expirationDate });
  } catch (error) {
    handleError(error, "auth.controller -> login");
    respondError(req, res, 400, error.message);
  }
}


/**
 * @name logout
 * @description Cierra la sesión del usuario
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @returns
 */
async function logout(req, res) {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return respondError(req, res, 400, "No hay token");
    res.clearCookie("jwt", { httpOnly: true });
    respondSuccess(req, res, 200, { message: "Sesión cerrada correctamente" });
  } catch (error) {
    handleError(error, "auth.controller -> logout");
    respondError(req, res, 400, error.message);
  }
}

/**
 * @name refresh
 * @description Refresca el token de acceso
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 */
async function refresh(req, res) {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return respondError(req, res, 400, "No hay token");

    const [accessToken, errorToken] = await AuthService.refresh(cookies);

    if (errorToken) return respondError(req, res, 400, errorToken);

    respondSuccess(req, res, 200, { accessToken });
  } catch (error) {
    handleError(error, "auth.controller -> refresh");
    respondError(req, res, 400, error.message);
  }
}

async function signin(req, res) {

  req.body.roles = ["user"];

  const { body } = req;
  const { error: bodyError } = userBodySchema.validate(body);

  if (bodyError) {
    return respondError(req, res, 400, bodyError.message);
  }

  

  try {
    
    const [newUser, userError] = await UserService.createUser(body);

    if (userError) return respondError(req, res, 400, userError);
    if (!newUser) {
      return respondError(req, res, 400, "No se creo el usuario");
    }

    respondSuccess(req, res, 201, newUser);

  } catch (error) {
    handleError(error, "auth.controller -> signin");
    return respondError(req, res, 400, error.message);
  }
}




export default {
  login,
  logout,
  refresh,
  signin,
};
