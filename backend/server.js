require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
// Agregamos estas dos librerías para manejar archivos
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Modelos
const Recurso = require('./models/Recurso.js');
const Planificacion = require('./models/Planificacion.js');
const User = require('./models/User');

// --- MODELO PARA GESTIÓN ---
const GestionSchema = new mongoose.Schema({
    tipo: String,
    materia: String,
    tema: String,
    nombreUnidad: String,
    tipoRecurso: String,
    grado: String,
    datos: Object,
    borrado: { type: Boolean, default: false },
    fechaExportacion: { type: Date, default: Date.now }
}, { strict: false });
const Gestion = mongoose.model('Gestion', GestionSchema);

const app = express();

// --- CONFIGURACIÓN DE MIDDLEWARE ---
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// --- CONFIGURACIÓN PARA SUBIDA DE IMÁGENES (NUEVO) ---
// 1. Crear carpeta 'uploads' si no existe
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. Configurar almacenamiento de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Nombre: timestamp-nombreOriginal
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// 3. Hacer la carpeta pública para que las imágenes sean accesibles vía URL
app.use('/uploads', express.static('uploads'));

// --- CONEXIÓN A MONGODB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Se logró la conexión a MongoDB'))
  .catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// --- FUNCIÓN DE LIMPIEZA REUTILIZABLE ---
const procesarRespuestaIA = (text) => {
    let rawText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const inicioJson = rawText.indexOf('{');
    const finJson = rawText.lastIndexOf('}');
    if (inicioJson !== -1 && finJson !== -1) {
        rawText = rawText.substring(inicioJson, finJson + 1);
    }

    let textolimpio = rawText.replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "");
    try {
        return JSON.parse(textolimpio);
    } catch (e) {
        textolimpio = textolimpio.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
        return JSON.parse(textolimpio);
    }
};

// --- RUTA: GENERACIÓN ESTRUCTURADA (PLANIFICACIONES - MÓDULO 1) ---
app.post('/api/generar-plan-completa', async (req, res) => {
  const { planActual, ...data } = req.body;
  const camposRequeridos = ['materia', 'tema', 'grado', 'dificultad', 'nombreUnidad'];
  for (const campo of camposRequeridos) {
    if (!data[campo] || data[campo].trim() === '') {
      return res.status(400).json({ error: `El campo ${campo} es obligatorio.` });
    }
  }
  if (!process.env.GEMINI_KEY) {
    return res.status(500).json({ error: "Falta la clave GEMINI_KEY en el servidor" });
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const peticionDocente = data.sugerencias ? `PETICIÓN ESPECÍFICA DEL DOCENTE: "${data.sugerencias}".` : "";
  const contextoEdicion = planActual
    ? `MODO EDICIÓN: JSON previo: ${JSON.stringify(planActual)}. Modifica según: "${data.sugerencias}".`
    : `MODO CREACIÓN: Materia: ${data.materia}, Tema: ${data.tema}, Grado: ${data.grado}, Dificultad: ${data.dificultad}. ${peticionDocente}`;

  const prompt = `
    Eres un experto pedagogo. Genera una planificación educativa en JSON estrictamente válido.
    CONTEXTO: ${contextoEdicion}
    REGLAS DE ORO (OBLIGATORIAS):
      1. PRIORIDAD TOTAL: Si en la PETICIÓN ESPECÍFICA el docente solicita una cantidad determinada de objetivos, indicadores o actividades, ignora los valores por defecto y genera la cantidad exacta pedida.
      2. OBJETIVOS: Por defecto genera 3. Formato: "* Obj 1\\n* Obj 2". Si la petición pide más, agrégalos.
      3. INDICADORES DE LOGRO: Por defecto genera 3. Formato: "* Ind 1\\n* Ind 2".
      4. INDICADORES DE EVALUACIÓN: Por defecto genera 3. Formato: "* Eval 1\\n* Eval 2".
      5. ACTIVIDADES COMPLEMENTARIAS: Por defecto genera 3. Formato: "* Act 1\\n* Act 2".
      6. MATERIALES: Array de EXACTAMENTE 8 elementos. Inicialmente, CADA uno de los 8 elementos del array DEBE contener EXACTAMENTE 3 materiales distintos (a menos que el docente pida más). Los materiales deben separarse por un salto de línea y un asterisco (*).
      8. No uses markdown ni texto fuera del JSON.
    ESTRUCTURA REQUERIDA (Responde solo el JSON):
    {
      "objetivos": "...",
      "indicadoresLogro": "...",
      "materiales": ["...", "...", "...", "...", "...", "...", "...", "..."],
      "indicadoresEvaluacion": "...",
      "actividadesComplementarias": "...",
      "tiempos": [
        {"inicio": "...", "desarrollo": "...", "cierre": "..."},
        {"inicio": "...", "desarrollo": "...", "cierre": "..."},
        {"inicio": "...", "desarrollo": "...", "cierre": "..."},
        {"inicio": "...", "desarrollo": "...", "cierre": "..."},
        {"inicio": "...", "desarrollo": "...", "cierre": "..."},
        {"inicio": "...", "desarrollo": "...", "cierre": "..."},
        {"inicio": "...", "desarrollo": "...", "cierre": "..."},
        {"inicio": "...", "desarrollo": "...", "cierre": "..."}
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const jsonOutput = procesarRespuestaIA(result.response.text());
    if (jsonOutput.materiales && jsonOutput.materiales.length !== 8) {
        while (jsonOutput.materiales.length < 8) jsonOutput.materiales.push("* Material 1\\n* Material 2\\n* Material 3");
        jsonOutput.materiales = jsonOutput.materiales.slice(0, 8);
    }
    res.json(jsonOutput);
  } catch (error) {
    console.error("Error en servidor:", error);
    res.status(500).json({ error: "Error al generar la planificación." });
  }
});

// --- RUTA: GENERACIÓN MÓDULO 3 ---
app.post('/api/generar-plan-modulo3', async (req, res) => {
  const { materia, tema, grado, dificultad, sugerencias, enfoque } = req.body;
  if (!materia || !tema) return res.status(400).json({ error: "Faltan campos." });
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `
    Eres un experto pedagogo. Genera una planificación educativa para el Módulo 3 en JSON estrictamente válido.
    MATERIA: ${materia}, TEMA: ${tema}, GRADO: ${grado}, ENFOQUE: ${enfoque || 'Técnico'}.
    SUGERENCIAS: ${sugerencias || 'Ninguna'}.
    REGLAS DE ORO (IGUAL AL MÓDULO 1):
      1. OBJETIVOS/INDICADORES: Formato: "* Texto\\n* Texto".
      2. MATERIALES: Array de EXACTAMENTE 8 elementos.
      3. TIEMPOS: Array de EXACTAMENTE 8 objetos con campos "inicio", "desarrollo" y "cierre".
    ESTRUCTURA EXACTA:
    {
      "objetivos": "...",
      "indicadoresLogro": "...",
      "materiales": ["...", "...", "...", "...", "...", "...", "...", "..."],
      "indicadoresEvaluacion": "...",
      "actividadesComplementarias": "...",
      "tiempos": [
        {"inicio": "...", "desarrollo": "...", "cierre": "..."},
        {"inicio": "...", "desarrollo": "...", "cierre": "..."},
        {"inicio": "...", "desarrollo": "...", "cierre": "..."},
        {"inicio": "...", "desarrollo": "...", "cierre": "..."},
        {"inicio": "...", "desarrollo": "...", "cierre": "..."},
        {"inicio": "...", "desarrollo": "...", "cierre": "..."},
        {"inicio": "...", "desarrollo": "...", "cierre": "..."},
        {"inicio": "...", "desarrollo": "...", "cierre": "..."}
      ]
    }
  `;
  try {
    const result = await model.generateContent(prompt);
    const jsonOutput = procesarRespuestaIA(result.response.text());
    res.json(jsonOutput);
  } catch (error) {
    console.error("Error Módulo 3:", error);
    res.status(500).json({ error: "Error al generar la planificación del Módulo 3." });
  }
});

// --- RUTA: GENERACIÓN DE RECURSOS (MÓDULO 2) ---
app.post('/api/generar-recurso-ia', async (req, res) => {
  const { materia, tema, tipoRecurso, dificultad, objetivos, indicadores } = req.body;
  if (!materia || !tema || !tipoRecurso) return res.status(400).json({ error: "Faltan campos." });
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      Eres un experto en pedagogía y diseño de recursos didácticos.
      OBJETIVO: Generar un recurso educativo de tipo: "${tipoRecurso}".
      CONTEXTO: Materia: ${materia}, Tema: ${tema}, Dificultad: ${dificultad}.
      OBJETIVOS BASE: ${objetivos}.
      INDICADORES BASE: ${indicadores}.
      Entrega el contenido educativo listo para usar, bien estructurado y profesional.
    `;
    const result = await model.generateContent(prompt);
    res.json({ contenido: result.response.text() });
  } catch (error) {
    console.error("Error en IA de recursos:", error);
    res.status(500).json({ error: "Error al generar el recurso educativo." });
  }
});

// --- RUTAS DE CONSULTA Y GUARDADO ---
app.post('/api/save-plan', async (req, res) => {
  try {
    const nuevaPlanificacion = new Planificacion(req.body);
    await nuevaPlanificacion.save();
    res.status(200).send("Planificación guardada con éxito.");
  } catch (error) {
    res.status(500).send("Error al guardar");
  }
});

app.get('/api/planificaciones', async (req, res) => {
  try {
    const planes = await Planificacion.find({ borrado: { $ne: true } }).sort({ _id: -1 });
    res.json(planes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/planificaciones-por-tema/:tema', async (req, res) => {
    try {
      const temaRecibido = req.params.tema;
      const resultado = await Planificacion.findOneAndUpdate(
        { $or: [{ tema: temaRecibido }, { nombreUnidad: temaRecibido }] },
        { borrado: true },
        { new: true }
      );
      if (resultado) {
        res.status(200).json({ mensaje: "Planificación movida a la papelera" });
      } else {
        res.status(404).json({ error: "No se encontró la planificación" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al procesar la planificación" });
    }
  });

// --- RUTA ACTUALIZADA PARA EXPORTAR GESTIÓN ---
app.post('/api/exportar-gestion', async (req, res) => {
  try {
    const nuevoItem = new Gestion({
        ...req.body,
        fechaExportacion: new Date()
    });
    await nuevoItem.save();
    res.status(201).json({ mensaje: "Exportado con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al guardar en gestión" });
  }
});

app.get('/api/gestion', async (req, res) => {
  try {
    const items = await Gestion.find({ borrado: { $ne: true } }).sort({ fechaExportacion: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener gestión" });
  }
});

app.get('/api/gestion/:id', async (req, res) => {
    try {
      const item = await Gestion.findById(req.params.id);
      if (item) {
        res.status(200).json(item);
      } else {
        res.status(404).json({ error: "No se encontró el registro" });
      }
    } catch (error) {
      res.status(500).json({ error: "Error al recuperar el registro" });
    }
  });

app.delete('/api/gestion/:id', async (req, res) => {
  try {
    await Gestion.findByIdAndUpdate(req.params.id, { borrado: true });
    res.status(200).json({ mensaje: "Movido a la papelera con éxito" });
  } catch (error) {
    res.status(500).json({ error: "Error al mover a papelera" });
  }
});

app.put('/api/gestion/:id', async (req, res) => {
    try {
      const itemActualizado = await Gestion.findByIdAndUpdate(
        req.params.id,
        { ...req.body, fechaExportacion: new Date() },
        { new: true }
      );
      res.status(200).json({ mensaje: "Actualizado con éxito", item: itemActualizado });
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar en gestión" });
    }
  });

app.get('/api/papelera', async (req, res) => {
    try {
        const planesBorrados = await Planificacion.find({ borrado: true }).lean();
        const gestionBorrados = await Gestion.find({ borrado: true }).lean();
        const todoBorrados = [
            ...planesBorrados.map(i => ({ ...i, origen: 'Planificación', titulo: i.tema || i.nombreUnidad })),
            ...gestionBorrados.map(i => ({ ...i, origen: 'Gestión', titulo: i.tema || i.nombreUnidad }))
        ];
        res.json(todoBorrados);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar papelera" });
    }
});

app.patch('/api/papelera/restaurar/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resPlan = await Planificacion.findByIdAndUpdate(id, { borrado: false });
        const resGest = await Gestion.findByIdAndUpdate(id, { borrado: false });
        if (resPlan || resGest) {
            res.json({ mensaje: "Elemento restaurado" });
        } else {
            res.status(404).json({ error: "No encontrado" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error al restaurar" });
    }
});

app.delete('/api/papelera/permanente/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Planificacion.findByIdAndDelete(id);
        await Gestion.findByIdAndDelete(id);
        res.json({ mensaje: "Eliminado definitivamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});

// --- GESTIÓN DE PERFIL ---
app.get('/api/usuario/perfil', async (req, res) => {
    try {
        const usuario = await User.findOne({});
        res.status(200).json(usuario || {});
    } catch (error) {
        res.status(500).json({ error: "Error al obtener perfil" });
    }
});

app.patch('/api/usuario/perfil', async (req, res) => {
    try {
        const { name, email, celular, municipio, departamento, direccion } = req.body;
        const usuarioActualizado = await User.findOneAndUpdate(
            {}, 
            { name, email, celular, municipio, departamento, direccion },
            { new: true, upsert: true }
        );
        res.status(200).json(usuarioActualizado);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar perfil" });
    }
});

// --- RUTA: SUBIR FOTO DE PERFIL (NUEVO) ---
app.post('/api/usuario/foto', upload.single('foto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se seleccionó ninguna imagen" });
        }

        // URL que se guardará en la base de datos
        const urlFoto = `http://localhost:5000/uploads/${req.file.filename}`;

        // Actualizar el campo fotoUrl del usuario
        const usuarioActualizado = await User.findOneAndUpdate(
            {}, 
            { $set: { fotoUrl: urlFoto } },
            { new: true, upsert: true }
        );

        res.status(200).json(usuarioActualizado);
    } catch (error) {
        console.error("Error al subir foto:", error);
        res.status(500).json({ error: "Error interno al subir la foto" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));