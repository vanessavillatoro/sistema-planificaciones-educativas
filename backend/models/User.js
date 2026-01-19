const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  celular: String,
  municipio: String,
  departamento: String,
  direccion: String,
  fotoUrl: String,
  role: { type: String, default: 'docente' },
  // Agregamos estos 4 campos para que la base de datos los acepte:
});

module.exports = mongoose.model('User', userSchema);