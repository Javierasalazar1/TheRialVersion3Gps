const mongoose = require("mongoose");

import TIPO_SANCIONES from "../constants/sancion.constanst";

const reporteSchema = new mongoose.Schema({

  detalle: String,
  fecha: Date,
  tipoSancion: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TipoSancion",
    },
  ],
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

})

const Reporte = mongoose.model("Reporte", reporteSchema);

module.exports = Reporte;

