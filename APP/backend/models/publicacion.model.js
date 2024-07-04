"use strict";
// Importa el módulo 'mongoose' para crear la conexión a la base de datos
import mongoose from "mongoose";
// Importa bcrypt para el cifrado de contraseñas
import bcrypt from "bcryptjs";

const publicacionSchema = new mongoose.Schema({
  nombre: String,
  detalle: String,
  categoria: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
    },
  ],
  fecha: Date,
  like: { type: Number, default: 0 },
  dislike: { type: Number, default: 0 },
  numReportes: { type: Number, default: 0 },
  publicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  imagen: String
});

// Crea el modelo de datos 'Publicacion' a partir del esquema 'publicacionSchema'
const Publicacion = mongoose.model("Publicacion", publicacionSchema);

// Exporta el modelo 'Publicacion' como un 'export default'
export default Publicacion;
