Configuración de Red
URL de Producción: https://sistema-planificaciones-educativas.vercel.app

URL de Desarrollo: http://localhost:5000

Seguridad: Los endpoints protegidos requieren el Header: Authorization: Bearer <TU_TOKEN_JWT>.

🚀 APIs del Backend - Endpoints Disponibles
GET /api/test

Descripción: Verifica que el servidor esté activo.

Respuesta: {"message": "API funcionando"}

POST /api/generar-plan-completa

Descripción: Genera una planificación pedagógica con IA Gemini.

Body: {"materia": "...", "tema": "...", "sugerencias": "...", "planificacionPrevia": {...}}

POST /api/generate-resource

Descripción: Crea recursos didácticos (como cuestionarios) según dificultad.

Body: {"descripcion": "...", "dificultad": "refuerzo"}

POST /api/save-resource

Descripción: Almacena un recurso generado en la base de datos.

Body: {"descripcion": "...", "dificultad": "...", "output": "..."}

POST /api/save-plan

Descripción: Guarda una planificación completa en la DB.

Body: {"materia": "...", "grado": "...", "output": "..."}

GET /api/planificaciones

Descripción: Obtiene el listado de todas las planificaciones guardadas.

Respuesta: Array de objetos [{"_id": "...", "materia": "...", ...}]

PUT /api/planificaciones/:id

Descripción: Edita los datos de una planificación existente por su ID.

Body: {"materia": "Nuevo Nombre"}

DELETE /api/planificaciones/:id

Descripción: Elimina una planificación de la base de datos.

GET /api/export-plan/:id

Respuesta: Descarga la planificación en formato PDF.

GET /api/export-plan/:id/docx

Respuesta: Descarga la planificación en formato DOCX.

📝 Notas de Implementación
Formato de datos: Todos los endpoints de escritura requieren Content-Type: application/json.

Manejo de Errores: 400 (Faltan campos), 404 (No encontrado), 500 (Error de servidor/IA).

Diseño UI: Para el modo oscuro del login, se ha definido un fondo negro ligeramente más claro que los cuadros de texto para garantizar el contraste visual [cite: 2026-02-05].