require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Conectar MongoDB
mongoose.connect(process.env.MONGO_URI, { })
  .then(() => console.log('Se logro la conexion a MongoDB'))
  .catch(err => console.log(err));

// Modelo
const User = require('./models/User');

// API básica: GET /api/test
app.get('/api/test', (req, res) => res.json({ message: 'API funcionando' }));

// API IA: POST /api/generate (ejemplo básico)
app.post('/api/generate', async (req, res) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = req.body.prompt || 'Genera planificación básica sobre ciclo del agua para niños de 2º';
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ output: response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// RUTA TEMPORAL PARA FORZAR LA CREACIÓN DE UN REGISTRO
app.get('/api/create-test-user', async (req, res) => {
  try {
    // Crea una instancia del nuevo usuario en memoria
    const usuarioDePrueba = new User({
      name: 'UsuarioDePruebaDB',
      email: 'dbtest@temp.com',
      role: 'docente'  // Añade campos requeridos por tu modelo
    });

    // Guarda la instancia en la base de datos
    await usuarioDePrueba.save();
    
    console.log("Usuario de prueba creado con éxito en la consola.");
    res.json({ message: "Registro guardado. ¡Verifica Atlas!" });
  } catch (error) {
    console.error("ERROR DB:", error.message);
    res.status(500).json({ message: "Error al guardar el registro. Revisa la consola para el error." });
  }
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${5000}`));