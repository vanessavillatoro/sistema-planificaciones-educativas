# Sistema de Planificaciones Educativas

Sistema pedagógico con inteligencia artificial para generar planificaciones y recursos didácticos para docentes en El Salvador.

## 🚀 Producción

**URL**: https://sistema-planificaciones-educativas-ten.vercel.app

**URL Backend**: https://sistema-planificaciones-educativas.vercel.app

## 📋 Estado del Proyecto

- **Semana 14**: Completada
- **Lanzamiento**: En progreso
- **Estado**: Funcional

## 🛠️ Tecnologías
Tecnología

Uso

React.js

Frontend

Node.js + Express

Backend

MongoDB Atlas

Base de datos

Google Gemini

Inteligencia artificial

Vercel

Despliegue

📊 Métricas de Lighthouse
Métrica

Desktop

Móvil

Objetivo

Performance

89

76

90

Accessibility

97

89

90

Best Practices

100

100

100

SEO

89

100

90

Métrica Técnica

Valor

Objetivo

Tiempo de generación IA

~8-10s

<10s ✅

Carga de página

~2s

<6s ✅

📱 Funcionalidades
Generación de planificaciones con IA
Generación de recursos didácticos
Gestión y exportación (PDF/DOCX)
Autenticación (email + Google)
Diseño responsivo (móvil + PC)
Modo oscuro/claro
🔗 APIs del Backend
Endpoints Disponibles
Endpoint

Método

Descripción

/api/test

GET

Verifica que el servidor esté activo

/api/generar-plan-completa

POST

Genera planificación con IA

/api/generate-resource

POST

Crea recursos didácticos

/api/save-resource

POST

Almacena recurso en DB

/api/save-plan

POST

Guarda planificación en DB

/api/planificaciones

GET

Obtiene listado de planificaciones

/api/planificaciones/:id

PUT

Edita planificación

/api/planificaciones/:id

DELETE

Elimina planificación

/api/export-plan/:id

GET

Descarga PDF

/api/export-plan/:id/docx

GET

Descarga DOCX
