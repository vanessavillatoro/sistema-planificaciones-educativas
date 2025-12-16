  const mongoose = require('mongoose');
  const planSchema = new mongoose.Schema({
    materia: String,
    grado: String,
    output: String,
    createdAt: { type: Date, default: Date.now }
  });
  module.exports = mongoose.model('planificaciones', planSchema);