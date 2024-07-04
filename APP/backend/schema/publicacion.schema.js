'use strict';

import Joi from "joi";
import CATEGORIA from "../constants/categorias.constanst.js";

/**
 * Esquema de validación para el cuerpo de la solicitud de usuario.
 * @constant {Object}
 */
const publicaionesBodySchema = Joi.object({
  nombre: Joi.string().required().messages({
    "string.empty": "El nombre de la categoría no puede estar vacío.",
    "any.required": "El nombre de la categoría es obligatorio.",
    "string.base": "El nombre de la categoría debe ser de tipo string.",
  }),

  detalle: Joi.string().required().messages({
    "string.empty": "El detalle de la categoría no puede estar vacío.",
    "any.required": "El detalle de la categoría es obligatorio.",
    "string.base": "El detalle de la categoría debe ser de tipo string.",
  }),

  imagen: Joi.string()
    .required()
    .custom((value, helpers) => {
      // Validar la extensión del archivo
      const validExtensions = ['jpg', 'png', 'gif']; // Agrega aquí las extensiones permitidas
      const extension = value.split('.').pop().toLowerCase();
      if (!validExtensions.includes(extension)) {
        return helpers.message({ custom: 'El archivo debe tener una extensión válida (jpg, png, gif)' });
      }
      return value;
    })
    .messages({
      'any.required': 'La imagen es obligatoria',
      'string.base': 'La imagen debe ser una cadena',
      'custom': '{{#custom}}'
    }),

  categoria: Joi.array()
    .items(Joi.string().valid(...CATEGORIA))
    .required()
    .messages({
      "array.base": "La categoría debe ser de tipo array.",
      "any.required": "La categoría es obligatoria.",
      "string.base": "La categoría debe ser de tipo string.",
      "any.only": "La categoría proporcionada no es válida.",
    }),

  likes: Joi.number().integer().min(0).default(0).required().messages({
    "number.base": "El 'likes' debe ser un número.",
    "number.integer": "El 'likes' debe ser un número entero.",
    "number.min": "El 'likes' debe ser un número positivo o cero.",
    "any.required": "El 'likes' es obligatorio."
  }),

  dislikes: Joi.number().integer().min(0).default(0).required().messages({
    "number.base": "El 'dislikes' debe ser un número.",
    "number.integer": "El 'dislikes' debe ser un número entero.",
    "number.min": "El 'dislikes' debe ser un número positivo o cero.",
    "any.required": "El 'dislikes' es obligatorio."
  }),
});

const publicaionesIdSchema = Joi.object({
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

export { publicaionesBodySchema, publicaionesIdSchema };
