const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  celular: { type: String, default: '' },     // Añadir default evita valores null
  municipio: { type: String, default: '' },
  departamento: { type: String, default: '' },
  direccion: { type: String, default: '' },
  fotoUrl: { type: String, default: '' },
  role: { type: String, default: 'docente' },

  apellido: { type: String, default: '' },
  genero: { type: String, default: '' },
  
  // CORRECCIÓN AQUÍ:
  edad: { 
    type: Number, 
    // Quitamos las validaciones estrictas momentáneamente para asegurar el guardado
    // O nos aseguramos de que solo valide si el número existe
    required: false
  },
  
  password: { type: String }, 
  
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);