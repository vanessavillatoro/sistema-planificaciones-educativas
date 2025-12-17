const mongoose = require('mongoose');

const recursoSchema = new mongoose.Schema({
  descripcion: String,
  dificultad: String,
  output: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recurso', recursoSchema);
