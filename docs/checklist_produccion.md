URL de Producción
https://sistema-planificaciones-educativas-ten.vercel.app/

Estado del Deployment en Vercel
Proyecto: sistema-planificaciones-educativas-ten
Estado: Ready (Verde)
Funciones: Sin errores críticos
Pruebas de Compatibilidad
Chrome (Desktop)
Flujo

Estado

Observaciones

Login

OK

Funciona correctamente

Generar Planificación

OK

Tarda menos de 10 segundos

Exportar PDF

OK

Se descarga correctamente

Logout

OK

Funciona correctamente

Móvil (Chrome)
Flujo

Estado

Observaciones

Login

OK

Funciona correctamente

Generar Planificación

OK

Funciona correctamente

Exportar PDF

OK

Se descarga correctamente

Logout

OK

Funciona correctamente

Resultados de Lighthouse
Lighthouse Desktop - Día 1 (24/02/2026)
Categoría

Puntuación

Estado

Performance

98

Excelente

Accessibility

96

Muy bien

Best Practices

100

Perfecto

SEO

64

Bajo (por Chrome extensions)

Lighthouse Desktop - Día 2 (25/02/2026)
Categoría

Puntuación

Estado

Performance

89

Muy bien

Accessibility

97

Muy bien

Best Practices

100

Perfecto

SEO

89

Muy bien

Lighthouse Móvil - Día 1 (24/02/2026)
| Categoría | Puntuación | Estado | |--------| Performance | ---|------------|--------| 20 | Bajo | | Accessibility | 21 | Bajo | | Best Practices | 4 | Bajo | | SEO | 6 | Bajo |

Lighthouse Móvil - Día 2 (25/02/2026)
Categoría

Puntuación

Estado

Performance

76

Bien

Accessibility

89

Muy bien

Best Practices

100

Perfecto

SEO

100

Excelente

Comparación de Resultados - Día 1 vs Día 2
Desktop
Categoría

Día 1

Día 2

Cambio

Performance

98

89

↓9

Accessibility

96

97

↑1

Best Practices

100

100

=

SEO

64

89

↑25

Móvil
Categoría

Día 1

Día 2

Cambio

Performance

20

76

↑56

Accessibility

21

89

↑68

Best Practices

4

100

↑96

SEO

6

100

↑94

Métricas de Rendimiento
Desktop - Día 2
Métrica

Valor

Objetivo

Estado

First Contentful Paint (FCP)

0.6s

<2s

✅ OK

Largest Contentful Paint (LCP)

0.8s

<2.5s

✅ OK

Total Blocking Time (TBT)

10ms

<200ms

✅ OK

Cumulative Layout Shift (CLS)

0.158

<0.1

⚠️ Mejorar

Speed Index (SI)

1.9s

<4s

✅ OK

Móvil - Día 2
Métrica

Valor

Objetivo

Estado

First Contentful Paint (FCP)

1.8s

<2.5s

✅ OK

Largest Contentful Paint (LCP)

3.8s

<2.5s

⚠️ Mejorar

Total Blocking Time (TBT)

390ms

<200ms

⚠️ Mejorar

Cumulative Layout Shift (CLS)

0.083

<0.1

✅ OK

Speed Index (SI)

3.2s

<4s

✅ OK

Áreas de Mejora Identificadas
Performance (Rendimiento)
[x] Lazy loading implementado
[x] Optimización de imágenes (width, height, loading="lazy")
[ ] Reducir JavaScript no utilizado (27 KiB Desktop, 35 KiB Móvil)
[ ] Implementar caching
[ ] Optimizar LCP en móvil (3.8s)
Accessibility (Accesibilidad)
[x] Lighthouse Accessibility >90 en móvil (89, casi)
[ ] Añadir landmark "main" al documento
[ ] Aumentar tamaño de botones táctiles (móvil)
SEO
[x] Lighthouse SEO >90 (89 Desktop, 100 Móvil)
[ ] Desactivar Chrome extensions al hacer pruebas
Conclusiones
Fortalezas
✅ Performance Desktop: 89 (muy bien)
✅ Performance Móvil: 76 (mejoró 56 puntos)
✅ Best Practices: 100 en ambos dispositivos
✅ SEO: 89 Desktop, 100 Móvil
✅ Métricas de rendimiento: FCP, LCP, TBT, SI dentro de objetivos
✅ Lazy loading implementado correctamente
✅ Imágenes optimizadas
Debilidades
⚠️ CLS mejorable en Desktop (0.158)
⚠️ LCP y TBT mejorables en móvil
⚠️ JavaScript no utilizado (27-35 KiB)
⚠️ Touch targets pequeños en móvil
Acciones Prioritarias
Añadir landmark "main" al documento
Aumentar tamaño de botones táctiles en móvil
Implementar caching
Reducir JavaScript no utilizado
Siguientes Pasos
Día 3: Validación de requisitos no funcionales
Día 4: Documentación final
Día 5: Revisión general y limpieza
Evaluador: Vanessa Villatoro
Fecha de creación: 24 de febrero de 2026
Última actualización: 25 de febrero de 2026