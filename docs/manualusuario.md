APIs del Backend
Endpoints Disponibles
GET /api/test
Descripción: Verifica que el servidor esté funcionando.
Respuesta: {"message": "API funcionando"}

POST /api/generar-plan-completa
Descripción: Genera planificación completa usando IA Gemini, con soporte para ediciones parciales.
Request Body: {"materia": "Matemáticas", "tema": "Suma", "sugerencias": "Cambiar objetivos", "planificacionPrevia": {...}}
Respuesta: {"objetivos": "...", "indicadoresLogro": "...", "materiales": [...], "indicadoresEvaluacion": "...", "actividadesComplementarias": "...", "tiempos": [...]}

POST /api/generate-resource
Descripción: Genera recursos (cuestionarios) con ajuste de dificultad.
Request Body: {"descripcion": "Cuestionario sobre fotosíntesis", "dificultad": "refuerzo"}
Respuesta: {"output": "Texto generado"}

POST /api/save-resource
Descripción: Guarda un recurso en DB.
Request Body: {"descripcion": "Cuestionario", "dificultad": "refuerzo", "output": "Texto"}
Respuesta: {"message": "Recurso guardado", "id": "ID_DEL_DOCUMENTO"}

POST /api/save-plan
Descripción: Guarda una planificación en DB con validación.
Request Body: {"materia": "Ciencias", "grado": "1º", "output": "Texto"}
Respuesta: {"message": "Planificación guardada exitosamente", "id": "ID", "data": {...}}

GET /api/planificaciones
Descripción: Lista todas las planificaciones.
Respuesta: Array de objetos [{"_id": "...", "materia": "...", ...}]

PUT /api/planificaciones/:id
Descripción: Edita una planificación por ID.
Request Body: {"materia": "Nueva Materia"}
Respuesta: {"message": "Planificación actualizada", "planificacion": {...}}

DELETE /api/planificaciones/:id
Descripción: Elimina una planificación por ID.
Respuesta: {"message": "Planificación eliminada"}

GET /api/export-plan/:id
Descripción: Exporta planificación a PDF.
Respuesta: Archivo PDF descargable.

GET /api/export-plan/:id/docx
Descripción: Exporta planificación a DOCX.
Respuesta: Archivo DOCX descargable.

Notas
Todos los endpoints POST requieren Content-Type: application/json.
Errores comunes: 400 (campos faltantes), 404 (no encontrado), 500 (error servidor/IA).
Pruebas realizadas: Tiempos <10s, DB guarda correctamente, autenticación JWT implementada.
Base URL: http://localhost:5000 (desarrollo); en producción, URL de Vercel.