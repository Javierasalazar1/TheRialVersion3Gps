"use strict";

import Joi from "joi";
import ROLES from "../constants/roles.constants.js";

/**
 * Esquema de validación para el cuerpo de la solicitud de usuario.
 * @constant {Object}
 */
const userBodySchema = Joi.object({
  username: Joi.string().required().messages({
    "string.empty": "El nombre de usuario no puede estar vacío.",
    "any.required": "El nombre de usuario es obligatorio.",
    "string.base": "El nombre de usuario debe ser de tipo string.",
  }),
  
  email: Joi.string()
  .email({ tlds: { allow: false } }) // Validar el formato del correo electrónico sin verificar TLD
  .pattern(/^[a-zA-Z0-9]+@alumnos\.ubiobio\.cl$/, {
    name: 'patrón personalizado',
  })
  .message('El email debe tener un formato válido para alumnos.ubiobio.cl')
  .required()
  .messages({
    'string.empty': 'El email no puede estar vacío.',
    'any.required': 'El email es obligatorio.',
    'string.base': 'El email debe ser de tipo string.',
    'string.email': 'El email debe tener un formato válido.',
  }),
    
  password: Joi.string().required().min(5).messages({
    "string.empty": "La contraseña no puede estar vacía.",
    "any.required": "La contraseña es obligatoria.",
    "string.base": "La contraseña debe ser de tipo string.",
    "string.min": "La contraseña debe tener al menos 5 caracteres.",
  }),
  roles: Joi.array()
    .items(Joi.string().valid(...ROLES))
    .required()
    .messages({
      "array.base": "El rol debe ser de tipo array.",
      "any.required": "El rol es obligatorio.",
      "string.base": "El rol debe ser de tipo string.",
      "any.only": "El rol proporcionado no es válido.",
    }),
  newPassword: Joi.string().min(5).messages({
    "string.empty": "La nueva contraseña no puede estar vacía.",
    "string.base": "La nueva contraseña debe ser de tipo string.",
    "string.min": "La nueva contraseña debe tener al menos 5 caracteres.",
  }),
}).messages({
  "object.unknown": "No se permiten propiedades adicionales.",
});

/**
 * Esquema de validación para el id de usuario.
 * @constant {Object}
 */
const userIdSchema = Joi.object({
  id: Joi.string()
    .required()
    .pattern(/^(?:[0-9a-fA-F]{24}|[0-9a-fA-F]{12})$/)
    .messages({
      "string.empty": "El id no puede estar vacío.",
      "any.required": "El id es obligatorio.",
      "string.base": "El id debe ser de tipo string.",
      "string.pattern.base": "El id proporcionado no es un ObjectId válido.",
    }),
});

export { userBodySchema, userIdSchema };
