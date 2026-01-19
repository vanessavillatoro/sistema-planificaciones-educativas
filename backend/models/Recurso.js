const mongoose = require('mongoose');

const recursoSchema = new mongoose.Schema({
  // Relacionamos el recurso con una planificación específica
  planificacionId: { type: mongoose.Schema.Types.ObjectId, ref: 'planificaciones' },
  
  // Datos descriptivos
  tema: String,
  materia: String,
  tipoRecurso: String, // Ej: "Examen", "Resumen", "Guía"
  dificultad: String,
  
  // El contenido generado por la IA
  output: String, 
  
  createdAt: { type: Date, default: Date.now }
}, { 
  strict: false // Esto te asegura que si la IA genera datos extra, se guarden
});

module.exports = mongoose.model('Recurso', recursoSchema);