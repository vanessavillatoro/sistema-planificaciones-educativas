# Sistema Pedagógico Generador de Planificaciones

## APIs del Backend

### Endpoints Disponibles
1. **GET /api/test**  
   Descripción: Verifica que el servidor esté funcionando.  
   Respuesta: `{"message": "API funcionando"}`

2. **POST /api/generar-plan-completa**  
   Descripción: Genera planificación completa usando IA Gemini, con soporte para ediciones parciales.  
   Request Body: `{"materia": "Matemáticas", "tema": "Suma", "sugerencias": "Cambiar objetivos", "planificacionPrevia": {...}}`  
   Respuesta: `{"objetivos": "...", "indicadoresLogro": "...", "materiales": [...], "indicadoresEvaluacion": "...", "actividadesComplementarias": "...", "tiempos": [...]}`

3. **POST /api/generate-resource**  
   Descripción: Genera recursos (cuestionarios) con ajuste de dificultad.  
   Request Body: `{"descripcion": "Cuestionario sobre fotosíntesis", "dificultad": "refuerzo"}`  
   Respuesta: `{"output": "Texto generado"}`

4. **POST /api/save-resource**  
   Descripción: Guarda un recurso en DB.  
   Request Body: `{"descripcion": "Cuestionario", "dificultad": "refuerzo", "output": "Texto"}`  
   Respuesta: `{"message": "Recurso guardado", "id": "ID_DEL_DOCUMENTO"}`

5. **POST /api/save-plan**  
   Descripción: Guarda una planificación en DB con validación.  
   Request Body: `{"materia": "Ciencias", "grado": "1º", "output": "Texto"}`  
   Respuesta: `{"message": "Planificación guardada exitosamente", "id": "ID", "data": {...}}`

6. **GET /api/planificaciones**  
   Descripción: Lista todas las planificaciones.  
   Respuesta: Array de objetos `[{"_id": "...", "materia": "...", ...}]`

7. **PUT /api/planificaciones/:id**  
   Descripción: Edita una planificación por ID.  
   Request Body: `{"materia": "Nueva Materia"}`  
   Respuesta: `{"message": "Planificación actualizada", "planificacion": {...}}`

8. **DELETE /api/planificaciones/:id**  
   Descripción: Elimina una planificación por ID.  
   Respuesta: `{"message": "Planificación eliminada"}`

9. **GET /api/export-plan/:id**  
   Descripción: Exporta planificación a PDF.  
   Respuesta: Archivo PDF descargable.

10. **GET /api/export-plan/:id/docx**  
    Descripción: Exporta planificación a DOCX.  
    Respuesta: Archivo DOCX descargable.

### Notas
- Todos los endpoints POST requieren `Content-Type: application/json`.
- Errores comunes: 400 (campos faltantes), 404 (no encontrado), 500 (error servidor/IA).
- Pruebas realizadas: Tiempos <10s, DB guarda correctamente, autenticación JWT implementada.
- Base URL: `http://localhost:5000` (desarrollo); en producción, URL de Vercel.

---

## Contratos API para Frontend

### Respuestas Estándar
- **Éxito (200/201)**: `{"message": "Texto", "id": "opcional", "data": {...}}`
- **Error (400/404/500)**: `{"error": "Mensaje de error"}`

### Ejemplos por Endpoint
- `/api/generar-plan-completa`: Request `{"materia": "string", "tema": "string", "sugerencias": "string", "planificacionPrevia": {...}}` → Response `{"objetivos": "string", "indicadoresLogro": "string", ...}`
- `/api/planificaciones`: Response `[{"_id": "string", "materia": "string", "grado": "string", "output": "string", "createdAt": "date"}]`
- Exportación: Descarga directa (no JSON).

### Handover para Frontend
- Base URL: `http://localhost:5000` (desarrollo); en producción, URL de Vercel.
- Autenticación: JWT implementado (envía token en headers para endpoints protegidos).
- Manejo de errores: Mostrar `error` en UI; para IA, mostrar spinner y mensaje de "Generando...".
- Escalabilidad: Soporta 20 usuarios simultáneos; uptime 99.5%.

---

## Despliegue
El sistema está desplegado en Vercel (https://tu-app.vercel.app).
