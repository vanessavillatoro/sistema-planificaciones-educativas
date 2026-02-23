require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OAuth2Client } = require('google-auth-library');

// Modelos
const Recurso = require('./models/Recurso.js');
const Planificacion = require('./models/Planificacion.js');
const User = require('./models/User.js');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

const Gestion = mongoose.models.Gestion || mongoose.model('Gestion', GestionSchema);

const app = express();

// --- CONFIGURACIÓN DE CARPETAS Y RUTAS ESTÁTICAS ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// --- CONFIGURACIÓN DE CORS REFORZADA ---
const allowedOrigins = [
  'https://sistema-planificaciones-educativas.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        res.header('Access-Control-Allow-Origin', origin || '*');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

app.use(express.json({ limit: '10mb' })); 
app.use('/uploads', express.static(uploadsDir));

app.get('/api/test', (req, res) => {
    res.json({ message: "API funcionando perfectamente" });
});

app.get('/', (req, res) => {
    res.send('🚀 VERSION 5.2 - FIX CORS RED & PERFIL');
});

// --- CONFIGURACIÓN PARA SUBIDA DE IMÁGENES ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, fs.existsSync('/tmp') ? '/tmp' : uploadsDir); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
    }
});

const upload = multer({ storage: storage });

// --- CONEXIÓN A MONGODB ---
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
})
  .then(() => console.log('✅ Se logró la conexión a MongoDB'))
  .catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// --- FUNCIÓN DE LIMPIEZA REFORZADA (SOLUCIONA EL ERROR JSON) ---
const procesarRespuestaIA = (text) => {
    // Paso 1: Eliminar bloques de código de Markdown y espacios en los extremos
    let rawText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    // Paso 2: Extraer solo lo que está entre llaves { ... } para evitar texto basura fuera del JSON
    const inicioJson = rawText.indexOf('{');
    const finJson = rawText.lastIndexOf('}');
    
    if (inicioJson !== -1 && finJson !== -1) {
        rawText = rawText.substring(inicioJson, finJson + 1);
    }

    // Paso 3: Limpiar caracteres de control invisibles (U+0000 hasta U+001F)
    let textolimpio = rawText.replace(/[\u0000-\u001F]/g, "");

    try {
        return JSON.parse(textolimpio);
    } catch (e) {
        // Paso 4: Intento de rescate si hay saltos de línea literales
        try {
            textolimpio = textolimpio.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
            return JSON.parse(textolimpio);
        } catch (e2) {
            console.error("Error definitivo de parseo:", e2);
            throw new Error("La IA devolvió un JSON con formato inválido.");
        }
    }
};

// --- RUTA: GENERACIÓN ESTRUCTURADA (MÓDULO 1) ---
app.post('/api/generar-plan-completa', async (req, res) => {
  try {
    const { planActual, ...data } = req.body;
    const camposRequeridos = ['materia', 'tema', 'grado', 'dificultad', 'nombreUnidad'];

    // VALIDACIÓN REFORZADA: Evita el crash del .trim() y filtra placeholders
    for (const campo of camposRequeridos) {
      const valor = data[campo];
      if (!valor || String(valor).trim() === '' || valor === 'Grado' || valor === 'Nivel de dificultad') {
        return res.status(400).json({ error: `El campo ${campo} es obligatorio y debe ser seleccionado.` });
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
      ESTRUCTURA REQUERIDA:
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

    const result = await model.generateContent(prompt);
    const jsonOutput = procesarRespuestaIA(result.response.text());

    if (jsonOutput.materiales && jsonOutput.materiales.length !== 8) {
      while (jsonOutput.materiales.length < 8) jsonOutput.materiales.push("* Material 1\\n* Material 2\\n* Material 3");
      jsonOutput.materiales = jsonOutput.materiales.slice(0, 8);
    }

    res.json(jsonOutput);

  } catch (error) {
    console.error("ERROR REAL EN SERVIDOR:", error);
    res.status(500).json({ error: "Error interno: " + error.message });
  }
});

// --- RUTA: GENERACIÓN MÓDULO 3 ---
app.post('/api/generar-plan-modulo3', async (req, res) => {
  const { materia, tema, grado, dificultad, sugerencias, enfoque } = req.body;
  if (!materia || !tema) return res.status(400).json({ error: "Faltan campos." });
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = `Estructura JSON pedagógica para: ${materia}, Tema: ${tema}, Grado: ${grado}, Dificultad: ${dificultad}. Enfoque: ${enfoque}. Sugerencias: ${sugerencias}`;
  try {
    const result = await model.generateContent(prompt);
    const jsonOutput = procesarRespuestaIA(result.response.text());
    res.json(jsonOutput);
  } catch (error) {
    res.status(500).json({ error: "Error al generar Módulo 3." });
  }
});

// --- RUTA: GENERACIÓN DE RECURSOS (MÓDULO 2) ---
app.post('/api/generar-recurso-ia', async (req, res) => {
  const { materia, tema, tipoRecurso } = req.body;
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(`Genera un recurso educativ de tipo ${tipoRecurso} sobre el tema ${tema} para la materia ${materia}.`);
    res.json({ contenido: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "Error al generar recurso." });
  }
});

// --- RUTAS DE CONSULTA Y GUARDADO ---
app.post('/api/save-plan', async (req, res) => {
  try {
    const nuevaPlanificacion = new Planificacion(req.body);
    await nuevaPlanificacion.save();
    res.status(200).json({ message: "Planificación guardada con éxito." });
  } catch (error) {
    res.status(500).json({ error: "Error al guardar" });
  }
});

app.get('/api/planificaciones', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { usuarioId: userId, borrado: { $ne: true } } : { borrado: { $ne: true } };
    const planes = await Planificacion.find(query).sort({ _id: -1 });
    res.json(planes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/planificaciones-por-tema/:tema', async (req, res) => {
    try {
      const resultado = await Planificacion.findOneAndUpdate(
        { $or: [{ tema: req.params.tema }, { nombreUnidad: req.params.tema }] },
        { borrado: true },
        { new: true }
      );
      res.status(resultado ? 200 : 404).json(resultado ? { mensaje: "OK" } : { error: "No encontrado" });
    } catch (error) {
      res.status(500).json({ error: "Error" });
    }
  });

app.post('/api/exportar-gestion', async (req, res) => {
  try {
    const datosAGuardar = { ...req.body };
    if (datosAGuardar.userId) {
        datosAGuardar.usuarioId = datosAGuardar.userId;
    }
    const nuevaGestion = new Gestion(datosAGuardar);
    await nuevaGestion.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Error al exportar" });
  }
});

app.get('/api/gestion', async (req, res) => {
  try {
    const { userId } = req.query;
    const query = userId ? { usuarioId: userId, borrado: { $ne: true } } : { borrado: { $ne: true } };
    const rows = await Gestion.find(query).sort({ fechaExportacion: -1 });
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener gestión" });
  }
});

app.get('/api/gestion/:id', async (req, res) => {
    try {
      const item = await Gestion.findById(req.params.id);
      res.status(item ? 200 : 404).json(item || { error: "No encontrado" });
    } catch (error) {
      res.status(500).json({ error: "Error" });
    }
  });

app.delete('/api/gestion/:id', async (req, res) => {
  try {
    await Gestion.findByIdAndUpdate(req.params.id, { borrado: true });
    res.status(200).json({ mensaje: "OK" });
  } catch (error) {
    res.status(500).json({ error: "Error" });
  }
});

app.put('/api/gestion/:id', async (req, res) => {
    try {
      const itemActualizado = await Gestion.findByIdAndUpdate(
        req.params.id,
        { ...req.body, fechaExportacion: new Date() },
       { new: true }
      );
      res.status(200).json({ item: itemActualizado });
    } catch (error) {
      res.status(500).json({ error: "Error" });
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
        res.status(500).json({ error: "Error" });
    }
});

app.patch('/api/papelera/restaurar/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await Planificacion.findByIdAndUpdate(id, { borrado: false });
        await Gestion.findByIdAndUpdate(id, { borrado: false });
        res.json({ mensaje: "Restaurado" });
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
});

app.delete('/api/papelera/permanente/:id', async (req, res) => {
    try {
        await Planificacion.findByIdAndDelete(req.params.id);
        await Gestion.findByIdAndDelete(req.params.id);
        res.json({ mensaje: "Eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error" });
    }
});

// --- GESTIÓN DE PERFIL ---
app.get('/api/usuario/perfil', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId || userId === "undefined") return res.status(400).json({ error: "Falta userId" });
        const usuario = await User.findById(userId);
        if (!usuario) return res.status(404).json({ error: "No encontrado" });
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/usuario/perfil', upload.single('foto'), async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId || userId === "undefined" || userId === "null") {
            return res.status(400).json({ error: "ID de usuario no proporcionado" });
        }

        let datosAActualizar = { ...req.body };
        delete datosAActualizar.email;
        delete datosAActualizar.userEmail;
        delete datosAActualizar.correo;

        if (datosAActualizar.nombre) datosAActualizar.name = datosAActualizar.nombre;

        if (req.file) { 
            try {
                const imgPath = req.file.path;
                const buffer = fs.readFileSync(imgPath);
                const base64Image = `data:${req.file.mimetype};base64,${buffer.toString('base64')}`;
                datosAActualizar.fotoUrl = base64Image;
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            } catch (errFoto) {
                console.error("Error procesando archivo físico:", errFoto);
            }
        } else if (req.body.foto && req.body.foto.startsWith('data:image')) {
            datosAActualizar.fotoUrl = req.body.foto;
        }

        Object.keys(datosAActualizar).forEach(key => {
            if (datosAActualizar[key] === "" || datosAActualizar[key] === null || datosAActualizar[key] === "undefined") {
                delete datosAActualizar[key];
            }
        });

        delete datosAActualizar.userId;
        delete datosAActualizar.nombre;
        delete datosAActualizar.foto; 

        const usuarioActualizado = await User.findByIdAndUpdate(
            userId,
            { $set: datosAActualizar },
            { new: true, runValidators: false } 
        );

        if (!usuarioActualizado) return res.status(404).json({ error: "Usuario no encontrado" });

        res.status(200).json({
            userId: usuarioActualizado._id,
            userName: usuarioActualizado.name,
            userEmail: usuarioActualizado.email,
            userFoto: usuarioActualizado.fotoUrl,
            userCelular: usuarioActualizado.celular || '',
            userMunicipio: usuarioActualizado.municipio || '',
            userDepartamento: usuarioActualizado.departamento || '',
            userDireccion: usuarioActualizado.direccion || ''
        });

    } catch (error) {
        console.error("Error CRÍTICO en perfil:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

app.post('/api/usuario/foto', upload.single('foto'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No hay imagen" });
        const buffer = fs.readFileSync(req.file.path);
        const base64Image = `data:${req.file.mimetype};base64,${buffer.toString('base64')}`;
        const userId = req.body.userId;
        const usuarioActualizado = await User.findByIdAndUpdate(
            userId, { $set: { fotoUrl: base64Image } }, { new: true }
        );
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(200).json({ userFoto: usuarioActualizado.fotoUrl });
    } catch (error) {
        res.status(500).json({ error: "Error interno" });
    }
});

// --- AUTENTICACIÓN ---
app.post('/api/auth/google', async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
            clockSkewInSeconds: 600,
        });
        const { email, name, family_name, picture, sub } = ticket.getPayload();
        
        let usuario = await User.findOne({ email });
        
        if (!usuario) {
            usuario = new User({
                name: name,
                apellido: family_name || '',
                email: email,
                fotoUrl: picture, 
                googleId: sub,
                role: 'docente'
            });
            await usuario.save();
        }

        res.status(200).json({ 
            userId: usuario._id, 
            userName: usuario.name, 
            email: usuario.email, 
            userFoto: usuario.fotoUrl,
            celular: usuario.celular || '',
            municipio: usuario.municipio || '',
            departamento: usuario.departamento || '',
            direccion: usuario.direccion || ''
        });
    } catch (error) {
        console.error("Error en Google Auth:", error);
        res.status(500).json({ error: "Error al autenticar con Google" });
    }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, apellido, email, password, edad } = req.body;
    if (parseInt(edad) < 20) return res.status(400).json({ error: "Mínimo 20 años" });
    const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passRegex.test(password)) return res.status(400).json({ error: "Contraseña insegura" });
    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ error: "Ya existe" });
    const nuevoUsuario = new User(req.body);
    const usuarioGuardado = await nuevoUsuario.save();
    res.status(201).json({ 
        userId: usuarioGuardado._id, 
        userName: usuarioGuardado.name, 
        email: usuarioGuardado.email, 
        userFoto: usuarioGuardado.fotoUrl 
    });
  } catch (error) {
    res.status(500).json({ error: "Error" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const usuario = await User.findOne({ email: req.body.email, password: req.body.password });
    if (!usuario) return res.status(401).json({ error: "Credenciales inválidas" });
    res.json({ 
        userId: usuario._id, 
        userName: usuario.name, 
        email: usuario.email, 
        userFoto: usuario.fotoUrl,
        celular: usuario.celular || '',
        municipio: usuario.municipio || '',
        departamento: usuario.departamento || '',
        direccion: usuario.direccion || ''
    });
  } catch (error) {
    res.status(500).json({ error: "Error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 puerto corriendo ${PORT}`));

module.exports = app;