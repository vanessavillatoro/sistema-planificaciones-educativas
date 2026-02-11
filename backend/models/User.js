const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Datos que ya tenías
  name: String,
  email: { type: String, unique: true, required: true }, // El correo debe ser único
  celular: String,
  municipio: String,
  departamento: String,
  direccion: String,
  fotoUrl: String,
  role: { type: String, default: 'docente' },

  // --- CAMPOS ACTUALIZADOS CON RESTRICCIONES ---
  apellido: String,
  genero: String,
  edad: { 
    type: Number, 
    min: 20, 
    max: 100 
  },
  // Se quita 'required: true' para permitir registros vía Google
  password: { type: String }, 
  
  // --- NUEVO PARA AUTH CON GOOGLE ---
  googleId: { type: String, unique: true, sparse: true },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);