"use strict";
// Importa el modulo 'mongoose' para crear la conexion a la base de datos
import { Schema, model } from "mongoose";
import CATEGORIA from "../constants/categorias.constanst.js";

// Crea el esquema de la coleccion 'roles'
const categoriaSchema = new Schema(
  {
    name: {
      type: String,
      enum: CATEGORIA,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);

// Crea el modelo de datos 'Role' a partir del esquema 'roleSchema'
const Categoria = model("Categoria", categoriaSchema);

export default Categoria;
