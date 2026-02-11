const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  // --- ESTA ES LA LÍNEA QUE DEBES AGREGAR ---
  usuarioId: { type: String, index: true }, 
  
  materia: String,
  grado: String,
  output: String,
  tema: String,           
  nombreUnidad: String,   
  numUnidad: String,
  objetivos: String,
  indicadoresLogro: String,
  indicadoresEvaluacion: String,
  indicadores: String,    
  nombre: String,
  apellido: String,
  centroEscolar: String,
  seccion: String,
  municipio: String,
  departamento: String,
  fecha: String,

  createdAt: { type: Date, default: Date.now }

}, {
  strict: false 
});

module.exports = mongoose.model('planificaciones', planSchema);