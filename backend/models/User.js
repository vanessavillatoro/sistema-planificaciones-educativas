const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  celular: String,
  municipio: String,
  departamento: String,
  direccion: String,
  fotoUrl: String,
  role: { type: String, default: 'docente' },

  apellido: String,
  genero: String,
  edad: { 
    type: Number, 
    // Usamos una validación condicional: solo si el valor existe
    min: [20, 'La edad mínima es 20'], 
    max: 100,
    // Permite que sea opcional en la actualización
    required: false 
  },
  
  password: { type: String }, 
  
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true // Vital para que no choque con usuarios tradicionales
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);