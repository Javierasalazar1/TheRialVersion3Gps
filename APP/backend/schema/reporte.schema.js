"use strict";

import Joi from "joi";

const reporteBodySchema = Joi.object({
  detalle: Joi.string()
      .required()
      .messages({
          "string.empty": "El detalle no puede estar vacío.",
          "any.required": "El detalle es obligatorio.",
          "string.base": "El detalle debe ser una cadena de texto."
      }),
  publicacion: Joi.string()
      .required()
      .messages({
          "any.required": "La publicación es obligatoria."
      })
});

const reporteIdSchema = Joi.object({
  id: Joi.string()
    .required()
    .pattern(new RegExp(/^(?:[0-9a-fA-F]{24}|[0-9a-fA-F]{12})$/))
    .messages({
      "string.empty": "El ID no puede estar vacío.",
      "any.required": "El ID es obligatorio.",
      "string.base": "El ID debe ser una cadena de texto.",
      "string.pattern.base": "El ID proporcionado no es un ObjectId válido.",
    }),
});

export {
  reporteBodySchema,
  reporteIdSchema,
};
