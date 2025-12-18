require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Recurso = require('./models/Recurso.js');  // Importa el modelo de recursos
const Planificacion = require('./models/Planificacion.js');  // Importa el modelo
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFDocument = require('pdfkit'); 
const { Document, Packer, Paragraph, TextRun } = require('docx');


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


// Endpoint para generar recursos
app.post('/api/generate-resource', async (req, res) => {
  const { prompt, dificultad } = req.body;  // prompt y dificultad del body
  const fullPrompt = `${prompt || 'Genera un cuestionario básico sobre las partes del cuerpo'}. Dificultad: ${dificultad || 'refuerzo'}. Incluye claves de respuestas.`;  // Ajusta prompt con dificultad
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    res.json({ output: text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para guardar recurso
app.post('/api/save-resource', async (req, res) => {
  try {
    const { descripcion, dificultad, output } = req.body;  // Campos del body
    const nuevoRecurso = new Recurso({
      descripcion,
      dificultad,
      output
    });
    await nuevoRecurso.save();  // Guarda en DB
    res.json({ message: 'Recurso guardado', id: nuevoRecurso._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =======================================================
// 2. Endpoint para guardar planificación (CON VALIDACIÓN DE CAMPOS)
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

// GET /api/planificaciones: Listar todas las planificaciones
app.get('/api/planificaciones', async (req, res) => {
  try {
    const planificaciones = await Planificacion.find();
    res.json(planificaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/planificaciones/:id: Editar una planificación por ID
app.put('/api/planificaciones/:id', async (req, res) => {
  try {
    const { materia, grado, output } = req.body;
    const planificacion = await Planificacion.findByIdAndUpdate(
      req.params.id,
      { materia, grado, output },
      { new: true }
    );
    if (!planificacion) return res.status(404).json({ message: 'Planificación no encontrada' });
    res.json({ message: 'Planificación actualizada', planificacion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/planificaciones/:id: Eliminar una planificación por ID
app.delete('/api/planificaciones/:id', async (req, res) => {
  try {
    const planificacion = await Planificacion.findByIdAndDelete(req.params.id);
    if (!planificacion) return res.status(404).json({ message: 'Planificación no encontrada' });
    res.json({ message: 'Planificación eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/export-plan/:id: Exportar planificación a PDF
app.get('/api/export-plan/:id', async (req, res) => {
  try {
    const planificacion = await Planificacion.findById(req.params.id);
    if (!planificacion) return res.status(404).json({ message: 'Planificación no encontrada' });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=planificacion-${req.params.id}.pdf`);
    doc.pipe(res);

    doc.text(`Materia: ${planificacion.materia}`);
    doc.text(`Grado: ${planificacion.grado}`);
    doc.text(`Output: ${planificacion.output}`);
    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/export-plan/:id/docx', async (req, res) => {
  try {
    const planificacion = await Planificacion.findById(req.params.id);
    if (!planificacion) return res.status(404).json({ message: 'No encontrada' });

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun(`Materia: ${planificacion.materia}`)],
          }),
          new Paragraph({
            children: [new TextRun(`Grado: ${planificacion.grado}`)],
          }),
          new Paragraph({
            children: [new TextRun(`Output: ${planificacion.output}`)],
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=planificacion-${req.params.id}.docx`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));