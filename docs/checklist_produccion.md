# Checklist de Producción - Semana 14
## Fecha de Evaluación
24 de febrero de 2026
## URL de Producción
https://sistema-planificaciones-educativas-ten.vercel.app/
## Estado del Deployment en Vercel
- **Proyecto**: sistema-planificaciones-educativas-ten
- **Estado**: Ready (Verde)
- **Funciones**: Sin errores críticos
## Pruebas de Compatibilidad
### Chrome (Desktop)
Flujo	Estado	Observaciones
Login	OK	Funciona correctamente
Generar Planificación	OK	Tarda menos de 10 segundos
Exportar PDF	OK	Se descarga correctamente
Logout	OK	Funciona correctamente
Móvil (Chrome)
Flujo	Estado	Observaciones
Login	OK	Funciona correctamente
Generar Planificación	OK	Funciona correctamente
Exportar PDF	OK	Se descarga correctamente
Logout	OK	Funciona correctamente
________________________________________
Resultados de Lighthouse
Lighthouse Desktop
Categoría	Puntuación	Estado
Performance	98	Excelente
Accessibility	96	Muy bien
Best Practices	100	Perfecto
SEO	64	Bajo (por Chrome extensions)
Lighthouse Móvil
Categoría	Puntuación	Estado
Performance	20	Bajo
Accessibility	21	Bajo
Best Practices	4	Bajo
SEO	6	Bajo
________________________________________
Métricas de Rendimiento (Desktop)
Métrica	Valor	Objetivo	Estado
First Contentful Paint (FCP)	0.7s	<2s	OK
Largest Contentful Paint (LCP)	0.9s	<2.5s	OK
Total Blocking Time (TBT)	1,150ms	<200ms	Mejorar
Cumulative Layout Shift (CLS)	0	<0.1	OK
Speed Index (SI)	2.5s	<4s	OK
________________________________________
Áreas de Mejora Identificadas
Performance (Rendimiento)
•	[ ] Reducir JavaScript no utilizado (2,798 KiB)
•	[ ] Añadir width/height explícitos a imágenes
•	[ ] Minificar JavaScript (110 KiB ahorro)
•	[ ] Reducir CSS no utilizado (48 KiB ahorro)
•	[ ] Implementar lazy loading en componentes
Accessibility (Accesibilidad)
•	[ ] Añadir landmark "main" al documento
•	[ ] Añadir atributos alt a todas las imágenes
•	[ ] Mejorar contraste de colores
•	[ ] Asegurar navegación por teclado
SEO
•	[ ] Desactivar Chrome extensions al hacer pruebas
•	[ ] Limpiar caché antes de pruebas
•	[ ] Probar en ventana de incógnito
________________________________________
Conclusiones
Fortalezas
•	Excelente rendimiento en Desktop (98/100)
•	Buena accesibilidad en Desktop (96/100)
•	Mejores prácticas perfectas (100/100)
•	Sistema funcional en Chrome y Móvil
•	Tiempos de carga adecuados
Debilidades
•	Rendimiento bajo en Móvil (20/100)
•	Accesibilidad mejorable en Móvil (21/100)
•	JavaScript no optimizado
•	Imágenes sin width/height
Acciones Prioritarias
1.	Implementar lazy loading en React
2.	Optimizar imágenes (añadir width/height)
3.	Minificar JavaScript y CSS
4.	Añadir landmark "main" al documento
5.	Repetir Lighthouse en móvil después de optimizaciones
________________________________________
Evaluador: Vanessa Villatoro Fecha de creación: 24 de febrero de 2026 Última actualización: 24 de febrero de 2026
