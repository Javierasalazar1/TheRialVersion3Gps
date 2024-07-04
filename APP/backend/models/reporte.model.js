"use strict";
import mongoose from "mongoose";

const reporteSchema = new mongoose.Schema({
  detalle: {
    type: String,
    required: true
  },
  publicacion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Publicacion",
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

const Reporte = mongoose.model("Reporte", reporteSchema);

export default Reporte;

