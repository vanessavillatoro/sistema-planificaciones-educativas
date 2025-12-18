# APIs del Backend

## Endpoints Disponibles

### 1. GET /api/test
- **Descripción**: Verifica que el servidor esté funcionando.
- **Respuesta**: `{"message": "API funcionando"}`

### 2. POST /api/generate
- **Descripción**: Genera planificación usando IA Gemini.
- **Request Body**: `{"prompt": "Genera planificación sobre partes del cuerpo"}`
- **Respuesta**: `{"output": "Texto generado por IA"}`

### 3. POST /api/generate-resource
- **Descripción**: Genera recursos (cuestionarios) con ajuste de dificultad.
- **Request Body**: `{"prompt": "Genera cuestionario", "dificultad": "refuerzo"}`
- **Respuesta**: `{"output": "Texto generado"}`

### 4. POST /api/save-resource
- **Descripción**: Guarda un recurso en DB.
- **Request Body**: `{"descripcion": "Cuestionario", "dificultad": "refuerzo", "output": "Texto"}`
- **Respuesta**: `{"message": "Recurso guardado", "id": "ID_DEL_DOCUMENTO"}`

### 5. POST /api/save-plan
- **Descripción**: Guarda una planificación en DB con validación.
- **Request Body**: `{"materia": "Ciencias", "grado": "1º", "output": "Texto"}`
- **Respuesta**: `{"message": "Planificación guardada exitosamente", "id": "ID", "data": {...}}`

### 6. GET /api/planificaciones
- **Descripción**: Lista todas las planificaciones.
- **Respuesta**: Array de objetos `[{"_id": "...", "materia": "...", ...}]`

### 7. PUT /api/planificaciones/:id
- **Descripción**: Edita una planificación por ID.
- **Request Body**: `{"materia": "Nueva Materia"}`
- **Respuesta**: `{"message": "Planificación actualizada", "planificacion": {...}}`

### 8. DELETE /api/planificaciones/:id
- **Descripción**: Elimina una planificación por ID.
- **Respuesta**: `{"message": "Planificación eliminada"}`

### 9. GET /api/export-plan/:id
- **Descripción**: Exporta planificación a PDF.
- **Respuesta**: Archivo PDF descargable.

### 10. GET /api/export-plan/:id/docx
- **Descripción**: Exporta planificación a DOCX.
- **Respuesta**: Archivo DOCX descargable.

## Notas
- Todos los endpoints POST requieren `Content-Type: application/json`.
- Errores comunes: 400 (campos faltantes), 404 (no encontrado), 500 (error servidor).
- Pruebas realizadas: Tiempos <15s, DB guarda correctamente.
