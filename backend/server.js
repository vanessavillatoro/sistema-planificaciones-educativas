require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Planificacion = require('./models/Planificacion.js');  // Importa el modelo
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
// ✅ SOLUCIÓN: Este middleware es CRUCIAL para que req.body funcione en las rutas POST.
app.use(express.json()); 

// Conectar MongoDB
mongoose.connect(process.env.MONGO_URI, { })
  .then(() => console.log('Se logro la conexion a MongoDB'))
  .catch(err => console.log('Error de conexión a MongoDB:', err));

// Modelo
const User = require('./models/User');

// API básica: GET /api/test
app.get('/api/test', (req, res) => res.json({ message: 'API funcionando' }));

// 1. API IA: POST /api/generate
app.post('/api/generate', async (req, res) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = req.body.prompt || 'Genera planificación sobre el tema las partes del cuerpo para niños de 1º tomando en cuenta los 3 momentos';
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ output: response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ... (El código de /api/create-test-user permanece igual) ...

// =======================================================
// 2. 💾 Endpoint para guardar planificación (CON VALIDACIÓN DE CAMPOS)
// =======================================================
app.post('/api/save-plan', async (req, res) => {
  
  const { materia, grado, output } = req.body;  // Campos del body
  //Validación de entrada
  if (!materia || !grado || !output) {
    console.error('Faltan datos para guardar la planificación:', req.body);
    return res.status(400).json({ 
      error: 'Faltan campos obligatorios. Asegúrate de enviar materia, grado y output.' 
    });
  }
  try {
    // La validación anterior asegura que estos campos existen
    const nuevaPlanificacion = new Planificacion({
      materia,
      grado,
      output
    });
    const planGuardado = await nuevaPlanificacion.save();  // Guarda en DB
    // Devolvemos el documento guardado para confirmación
    res.status(201).json({ 
      message: 'Planificación guardada exitosamente', 
      id: planGuardado._id,
      data: planGuardado
    });
    
  } catch (error) {
    console.error('Error al guardar la planificación en DB:', error.message);
    res.status(500).json({ error: 'Error del servidor al guardar en base de datos.' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));