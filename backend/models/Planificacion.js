const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  // Datos que ya tenías
  materia: String,
  grado: String,
  output: String,
  
  // NUEVOS DATOS NECESARIOS PARA EL MÓDULO 2
  tema: String,           // Vital para que aparezca en la lista
  nombreUnidad: String,   // Vital para que aparezca en la lista
  numUnidad: String,
  objetivos: String,
  indicadoresLogro: String,
  indicadoresEvaluacion: String,
  indicadores: String,    // Campo genérico de respaldo
  
  // Otros datos útiles
  nombre: String,
  apellido: String,
  centroEscolar: String,
  seccion: String,
  municipio: String,
  departamento: String,
  fecha: String,

  createdAt: { type: Date, default: Date.now }
}, { 
  strict: false // Esto permite que si envías algo nuevo en el futuro, se guarde aunque no esté en esta lista
});

module.exports = mongoose.model('planificaciones', planSchema);