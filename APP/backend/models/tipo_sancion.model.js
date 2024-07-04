"use strict";
// Importa el modulo 'mongoose' para crear la conexion a la base de datos
import { Schema, model } from "mongoose";
import TIPO_SANCIONES from "../constants/sancion.constanst";

// Crea el esquema de la coleccion 'roles'
const c = new Schema(
  {
    name: {
      type: String,
      enum: TIPO_SANCIONES,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);

// Crea el modelo de datos 'Role' a partir del esquema 'roleSchema'
const Role = model("TipoSancion", TIPO_SANCIONES);

export default TipoSancion;
