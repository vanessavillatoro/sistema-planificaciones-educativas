import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Gestion.css'; 

const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://sistema-planificaciones-educativas-ten.vercel.app";
const Gestion = ({ darkMode }) => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [busqueda, setBusqueda] = useState("");
  const [mostrarPapelera] = useState(false);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState("");
  const [gradoSeleccionado, setGradoSeleccionado] = useState(""); 
  const [previewItem, setPreviewItem] = useState(null); 
  
  // Busca donde terminan tus useState y pega esto:
const userId = localStorage.getItem('userId');

  // --- FUNCIONES DE RENDERIZADO (MANTENIDAS INTACTAS) ---
  const getColorPorTema = (texto) => {
    if (!texto) return '#e2e8f0';
    let hash = 0;
    for (let i = 0; i < texto.length; i++) {
      hash = texto.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 70%, 85%)`;
  };

  const renderizarEstiloIA = (texto) => {
    if (!texto || typeof texto !== 'string') return "Contenido estructurado";
    const lineas = texto.split('\n').filter(linea => linea.trim() !== "");
    let enTabla = false;
    const contenidoProcesado = lineas.map(linea => {
      const lineaLimpia = linea.trim();
      if (lineaLimpia.startsWith('|')) {
        const celdas = lineaLimpia.split('|').filter(c => c.trim() !== '');
        if (lineaLimpia.includes('---')) return ""; 
        let fila = '<tr>';
        celdas.forEach((celda) => {
          const estiloCelda = `border: 1px solid #cbd5e0; padding: 12px; font-size: 19px; line-height: 1.5;`;
          if (!enTabla) {
            fila += `<th style="${estiloCelda} background-color: #edf2f7; color: #2d3748; font-weight: 700;">${celda.trim()}</th>`;
          } else {
            fila += `<td style="${estiloCelda} text-align: left; color: #4a5568; background-color: #ffffff;">${celda.trim()}</td>`;
          }
        });
        fila += '</tr>';
        if (!enTabla) {
          enTabla = true;
          return `<table style="width: 100%; border-collapse: collapse; margin: 15px 0; border: 1px solid #cbd5e0;">${fila}`;
        }
        return fila;
      } else {
        let prefijo = enTabla ? "</table>" : "";
        enTabla = false;
        if (lineaLimpia.startsWith('#')) {
          const textoTitulo = lineaLimpia.replace(/^#+\s+/, '');
          return `${prefijo}<h1 style="color: #1a365d !important; font-size: 24px !important; text-align: center !important; font-weight: 800 !important; margin: 10px 0 20px 0 !important; text-transform: uppercase; line-height: 2; display: block;">${textoTitulo}</h1>`;
        }
        if (/^(\d+|[IVX]+)\.\s/.test(lineaLimpia)) {
          return `${prefijo}<h3 style="color: #2d3748 !important; font-size: 18px !important; font-weight: 700 !important; margin: 15px 0 5px 0 !important; line-height: 2; display: block;">${lineaLimpia}</h3>`;
        }
        if (lineaLimpia.startsWith('*')) {
          const textoPunto = lineaLimpia.replace(/^\*\s+/, '');
          return `${prefijo}<div style="display: flex; align-items: flex-start; margin-left: 20px; margin-bottom: 5px; font-size: 19px; line-height: 2;"><span style="color: #000; margin-right: 12px; font-size: 14px; padding-top: 6px;">●</span><span>${textoPunto}</span></div>`;
        }
        return `${prefijo}<p style="margin: 5px 0; font-size: 19px; line-height: 2;">${lineaLimpia}</p>`;
      }
    }).join('');
    let finalHtml = enTabla ? contenidoProcesado + "</table>" : contenidoProcesado;
    return finalHtml
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*/g, '')
      .replace(/---/g, '<div style="height: 1px; background-color: #e2e8f0; margin: 15px 0;"></div>');
  };

  // --- LÓGICA DE DATOS Y FILTROS ---
  const safeItems = Array.isArray(items) ? items : [];

  const materiasDisponibles = [...new Set(safeItems.map(i => i.materia).filter(m => m))].sort();
  const gradosDisponibles = [...new Set(safeItems.map(i => i.grado).filter(g => g))].sort();

  const normalizar = (t) => t ? t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

  const stats = {
    planificaciones: safeItems.filter(i => normalizar(i.tipo).includes('planifica') && !i.borrado).length,
    recursos: safeItems.filter(i => normalizar(i.tipo).includes('recurso') && !i.borrado).length,
    materias: materiasDisponibles.length
  };

  // --- NUEVA FUNCIÓN: EXPORTAR WORD ---
  // --- FUNCIÓN EXPORTAR WORD (CON FORMATO DE IMAGEN) ---
const exportarWord = (item) => {
    const normalizar = (t) => t ? t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
    const esPlanificacion = normalizar(item.tipo || "").includes('planifica');
    
    let contenidoFinal = "";

    if (esPlanificacion) {
      // Intentamos extraer datos de múltiples niveles para evitar campos vacíos
      const d = item.datos || {};
      const root = item || {};
      const extra = d.datos || {}; // Tercer nivel por si acaso

      const docente = `${d.nombre || root.nombre || extra.nombre || ""} ${d.apellido || root.apellido || extra.apellido || ""}`.trim();
      const grado = d.grado || root.grado || extra.grado || "";
      const seccion = d.seccion || root.seccion || extra.seccion || "";
      const municipio = d.municipio || root.municipio || extra.municipio || "";
      const departamento = d.departamento || root.departamento || extra.departamento || "";
      const nivel = d.nivel || root.nivel || extra.nivel || "";
      const centro = d.centroEscolar || root.centroEscolar || extra.centroEscolar|| "";
      const materia = d.materia || root.materia || extra.materia || "";
      const unidadNombre = d.nombreUnidad || root.nombreUnidad || extra.nombreUnidad || "";
      const unidadNum = d.numUnidad || root.numUnidad || extra.numUnidad || "";
      const fecha = d.fecha || root.fecha || extra.fecha || "";
      const duracion = d.duracion || root.duracion || extra.duracion || "";
      const dificultad = d.dificultad || root.dificultad || extra.dificultad || "";
      const tema = d.tema || root.tema || extra.tema || "";

      const materialesArray = d.materiales || root.materiales || extra.materiales || [];
      const actividades = d.tiempos || root.tiempos || d.actividades || extra.actividades || [];

      const formatCellList = (text) => {
        if (!text) return "";
        return text.split('\n')
          .map(line => line.replace(/\*/g, '').trim())
          .filter(line => line)
          .map(line => `• ${line}`)
          .join('<br>');
      };

      contenidoFinal = `
        <table style="width: 100%; border-collapse: collapse; font-family: Arial; border: 1pt solid #000;">
          <tr>
            <td colspan="9" style="background-color: #002060; color: white; text-align: center; font-weight: bold; padding: 2pt; border: 1pt solid #000; font-size: 10pt;">PLANIFICACIÓN GENERADA</td>
          </tr>
          
          <tr>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; width: 12%; font-size: 8pt;">Docente:</td>
            <td colspan="3" style="border: 1pt solid #000; padding: 2pt; font-size: 8pt;">${docente || "vanessa villatoro"}</td>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; width: 10%; font-size: 8pt;">Grado:</td>
            <td colspan="2" style="border: 1pt solid #000; padding: 2pt; font-size: 8pt;">${grado}</td>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; width: 10%; font-size: 8pt;">Seccion:</td>
            <td style="border: 1pt solid #000; padding: 2pt; font-size: 8pt;">${seccion}</td>
          </tr>

          <tr>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">municipio:</td>
            <td colspan="4" style="border: 1pt solid #000; padding: 2pt; font-size: 8pt;">${municipio}</td>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">Departamento:</td>
            <td colspan="3" style="border: 1pt solid #000; padding: 2pt; font-size: 8pt;">${departamento}</td>
          </tr>

          <tr>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">Nivel educativo:</td>
            <td colspan="2" style="border: 1pt solid #000; padding: 2pt; font-size: 8pt;">${nivel}</td>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">Centro escolar:</td>
            <td colspan="2" style="border: 1pt solid #000; padding: 2pt; font-size: 8pt;">${centro}</td>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">Materia:</td>
            <td colspan="2" style="border: 1pt solid #000; padding: 2pt; font-size: 8pt;">${materia}</td>
          </tr>

          <tr>
            <td colspan="9" style="background-color: #002060; color: white; text-align: center; font-weight: bold; padding: 2pt; border: 1pt solid #000; font-size: 8pt;">Datos específicos</td>
          </tr>

          <tr>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">Nombre de la unidad:</td>
            <td colspan="3" style="border: 1pt solid #000; padding: 2pt; font-size: 8pt;">${unidadNombre}</td>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">n° de Unidad:</td>
            <td colspan="2" style="border: 1pt solid #000; padding: 2pt; font-size: 8pt;">${unidadNum}</td>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">fecha:</td>
            <td style="border: 1pt solid #000; padding: 2pt; font-size: 8pt;">${fecha}</td>
          </tr>

          <tr>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">Duracion semanal:</td>
            <td colspan="2" style="border: 1pt solid #000; padding: 2pt; font-size: 8pt;">${duracion}</td>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">Nivel de dificultad:</td>
            <td colspan="2" style="border: 1pt solid #000; padding: 2pt; font-size: 8pt;">${dificultad}</td>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">Tema:</td>
            <td colspan="2" style="border: 1pt solid #000; padding: 2pt; font-size: 8pt;">${tema}</td>
          </tr>

          <tr>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">Indicadores de logro:</td>
            <td colspan="8" style="border: 1pt solid #000; padding: 2pt; font-size: 7.5pt;">${formatCellList(d.indicadoresLogro || root.indicadoresLogro || extra.indicadoresLogro)}</td>
          </tr>
          <tr>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">Objetivos:</td>
            <td colspan="8" style="border: 1pt solid #000; padding: 2pt; font-size: 7.5pt;">${formatCellList(d.objetivos || root.objetivos || extra.objetivos)}</td>
          </tr>

          <tr>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; text-align: center; padding: 2pt; font-size: 8pt;">Materiales:</td>
            ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<td style="border: 1pt solid #000; padding: 2pt; font-size: 7pt; vertical-align: top;">${formatCellList(materialesArray[i])}</td>`).join('')}
          </tr>

          <tr>
            <td colspan="9" style="background-color: #002060; color: white; text-align: center; font-weight: bold; padding: 2pt; border: 1pt solid #000; font-size: 8pt;">MOMENTOS DE LA CLASE</td>
          </tr>
          <tr>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; text-align: center; padding: 2pt; font-size: 8pt;">Inicio</td>
            ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<td style="border: 1pt solid #000; padding: 2pt; font-size: 7pt; vertical-align: top;">${actividades[i]?.inicio || ""}</td>`).join('')}
          </tr>
          <tr>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; text-align: center; height: 40pt; padding: 2pt; font-size: 8pt;">desarrollo</td>
            ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<td style="border: 1pt solid #000; padding: 2pt; font-size: 7pt; vertical-align: top;">${actividades[i]?.desarrollo || ""}</td>`).join('')}
          </tr>
          <tr>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; text-align: center; padding: 2pt; font-size: 8pt;">cierre</td>
            ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<td style="border: 1pt solid #000; padding: 2pt; font-size: 7pt; vertical-align: top;">${actividades[i]?.cierre || ""}</td>`).join('')}
          </tr>

          <tr>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">Indicadores de evaluacion:</td>
            <td colspan="8" style="border: 1pt solid #000; padding: 2pt; font-size: 7.5pt;">${formatCellList(d.indicadoresEvaluacion || root.indicadoresEvaluacion || extra.indicadoresEvaluacion)}</td>
          </tr>
          <tr>
            <td style="background-color: #002060; color: white; font-weight: bold; border: 1pt solid #000; padding: 2pt; font-size: 8pt;">Actividades complementarias:</td>
            <td colspan="8" style="border: 1pt solid #000; padding: 2pt; font-size: 7.5pt;">${formatCellList(d.actividadesComplementarias || root.actividadesComplementarias || extra.actividadesComplementarias)}</td>
          </tr>
        </table>
      `;
    } else {
      const contenidoBruto = typeof item.datos === 'string' ? item.datos : (item.datos?.contenido || item.contenido || "");
      contenidoFinal = renderizarEstiloIA(contenidoBruto);
    }

    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <style>
          @page { size: landscape; margin: 0.5in; }
          body { font-family: Arial, sans-serif; }
          h1 { color: #1a365d; text-align: center; }
        </style>
      </head>
      <body>
        ${contenidoFinal}
      </body>
      </html>`;

    const blob = new Blob(['\ufeff', header], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.tema || 'planificacion'}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

const obtenerContenidoParaModal = (item) => {
  if (!item) return "";
  
  const d = item.datos || {};
  const root = item || {};
  const tipo = (root.tipo || d.tipo || "").toLowerCase();
  
  if (!tipo.includes('planifica')) {
    return renderizarEstiloIA(typeof item.datos === 'string' ? item.datos : (d.contenido || root.contenido || ""));
  }

  const indLogro = d.indicadoresLogro || root.indicadoresLogro || "";
  const actividades = d.tiempos || root.tiempos || d.actividades || root.actividades || [];
  const materialesArray = d.materiales || root.materiales || d.listaMateriales || [];
  const docente = `${d.nombre || root.nombre || ""} ${d.apellido || root.apellido || ""}`.trim();

  // Definimos una variable para el tamaño de fuente y así asegurar uniformidad
  const fontSizeGeneral = "10px";

  return `
    <div style="width: 100%; border: 2px solid #000; font-family: Arial, sans-serif; color: black; background: white; font-size: ${fontSizeGeneral};">
      <div style="background: #002060; color: white; padding: 5px; text-align: center; font-weight: bold; border-bottom: 2px solid #000; font-size: 12px;">PLANIFICACIÓN GENERADA</div>
      
      <div style="display: flex; border-bottom: 1px solid #000;">
        <div style="background: #002060; color: white; width: 100px; padding: 4px; font-weight: bold; border-right: 1px solid #000;">Docente:</div>
        <div style="padding: 4px; flex: 2; border-right: 1px solid #000;">${docente || "vanessa villatoro"}</div>
        <div style="background: #002060; color: white; width: 80px; padding: 4px; font-weight: bold; border-right: 1px solid #000;">Grado:</div>
        <div style="padding: 4px; flex: 1; border-right: 1px solid #000;">${d.grado || root.grado || "3° Grado"}</div>
        <div style="background: #002060; color: white; width: 80px; padding: 4px; font-weight: bold; border-right: 1px solid #000;">Seccion:</div>
        <div style="padding: 4px; flex: 1;">${d.seccion || root.seccion || "Sección A"}</div>
      </div>

      <div style="display: flex; border-bottom: 1px solid #000;">
        <div style="background: #002060; color: white; width: 100px; padding: 4px; font-weight: bold; border-right: 1px solid #000;">municipio:</div>
        <div style="padding: 4px; flex: 1; border-right: 1px solid #000;">${d.municipio || root.municipio || "Ahuachapán Centro"}</div>
        <div style="background: #002060; color: white; width: 110px; padding: 4px; font-weight: bold; border-right: 1px solid #000;">Departamento:</div>
        <div style="padding: 4px; flex: 1;">${d.departamento || root.departamento || "Ahuachapán"}</div>
      </div>

      <div style="display: flex; border-bottom: 1px solid #000;">
        <div style="background: #002060; color: white; width: 110px; padding: 4px; font-weight: bold; border-right: 1px solid #000;">Nivel educativo:</div>
        <div style="padding: 4px; flex: 1; border-right: 1px solid #000;">${d.nivel_educativo || root.nivel_educativo || "Ciclo I"}</div>
        <div style="background: #002060; color: white; width: 110px; padding: 4px; font-weight: bold; border-right: 1px solid #000;">Centro escolar:</div>
        <div style="padding: 4px; flex: 1; border-right: 1px solid #000;">${d.centro_escolar || root.centro_escolar || "CEJFB"}</div>
        <div style="background: #002060; color: white; width: 80px; padding: 4px; font-weight: bold; border-right: 1px solid #000;">Materia:</div>
        <div style="padding: 4px; flex: 1;">${d.materia || root.materia || "Ciencias"}</div>
      </div>

      <div style="background: #002060; color: white; padding: 4px; font-weight: bold; border-bottom: 1px solid #000;">Datos específicos</div>
      <div style="display: flex; border-bottom: 1px solid #000;">
        <div style="background: #002060; color: white; width: 130px; padding: 4px; font-weight: bold; border-right: 1px solid #000;">Nombre de la unidad:</div>
        <div style="padding: 4px; flex: 2; border-right: 1px solid #000;">${d.nombre_unidad || root.nombre_unidad || "El agua"}</div>
        <div style="background: #002060; color: white; width: 90px; padding: 4px; font-weight: bold; border-right: 1px solid #000;">n° de Unidad:</div>
        <div style="padding: 4px; flex: 1; border-right: 1px solid #000;">${d.num_unidad || root.num_unidad || "Unidad 3"}</div>
        <div style="background: #002060; color: white; width: 70px; padding: 4px; font-weight: bold; border-right: 1px solid #000;">fecha:</div>
        <div style="padding: 4px; flex: 1;">${d.fecha || root.fecha || "2026-01-13"}</div>
      </div>

      <div style="display: flex; border-bottom: 2px solid #000;">
        <div style="background: #002060; color: white; width: 130px; padding: 4px; font-weight: bold; border-right: 1px solid #000;">Duracion semanal:</div>
        <div style="padding: 4px; flex: 1; border-right: 1px solid #000;">${d.duracion || root.duracion || "3 horas"}</div>
        <div style="background: #002060; color: white; width: 130px; padding: 4px; font-weight: bold; border-right: 1px solid #000;">Nivel de dificultad:</div>
        <div style="padding: 4px; flex: 1; border-right: 1px solid #000;">${d.dificultad || root.dificultad || "Repaso"}</div>
        <div style="background: #002060; color: white; width: 70px; padding: 4px; font-weight: bold; border-right: 1px solid #000;">Tema:</div>
        <div style="padding: 4px; flex: 2;">${d.tema || root.tema || "El ciclo del agua"}</div>
      </div>

      <div style="display: flex; border-bottom: 1px solid #000;">
        <div style="background: #002060; color: white; width: 140px; padding: 6px; font-weight: bold; border-right: 1px solid #000; display: flex; align-items: center;">Indicadores de logro:</div>
        <div style="padding: 6px; flex: 1; white-space: pre-line; text-align: left;">${indLogro}</div>
      </div>
      <div style="display: flex; border-bottom: 1px solid #000;">
        <div style="background: #002060; color: white; width: 140px; padding: 6px; font-weight: bold; border-right: 1px solid #000; display: flex; align-items: center;">Objetivos:</div>
        <div style="padding: 6px; flex: 1; white-space: pre-line; text-align: left;">${d.objetivos || root.objetivos || ""}</div>
      </div>

      <div style="display: flex; background: #002060; color: white; font-weight: bold; border-bottom: 1px solid #000; text-align: center;">
        <div style="width: 80px; padding: 4px; border-right: 1px solid #000; font-size: 9px;">n° activdad:</div>
        ${[1, 2, 3, 4, 5, 6, 7, 8].map(i => `
          <div style="flex: 1; padding: 4px; border-right: ${i < 8 ? '1px solid #000' : 'none'}; font-size: 9px;">Actividad ${i}</div>
        `).join('')}
      </div>
      <div style="display: flex; border-bottom: 1px solid #000; min-height: 50px;">
        <div style="background: #002060; color: white; width: 80px; padding: 4px; font-weight: bold; border-right: 1px solid #000; display: flex; align-items: center; justify-content: center;">Materiales:</div>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `
          <div style="flex: 1; border-right: ${i < 7 ? '1px solid #000' : 'none'}; padding: 4px; font-size: ${fontSizeGeneral}; white-space: pre-line; overflow-wrap: break-word;">
            ${materialesArray[i] || ""}
          </div>
        `).join('')}
      </div>

      <div style="background: #002060; color: white; padding: 5px; text-align: center; font-weight: bold; border-bottom: 1px solid #000;">MOMENTOS DE LA CLASE</div>
      
      <div style="display: flex; border-bottom: 1px solid #000;">
        <div style="background: #002060; color: white; width: 80px; padding: 4px; font-weight: bold; border-right: 1px solid #000; display: flex; align-items: center; justify-content: center; text-align: center;">Tiempo para actividades</div>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `
          <div style="flex: 1; border-right: ${i < 7 ? '1px solid #000' : 'none'}; padding: 4px; font-size: 9px; text-align: center;">Actividad ${i + 1}</div>
        `).join('')}
      </div>

      <div style="display: flex; border-bottom: 1px solid #000;">
        <div style="background: #002060; color: white; width: 80px; padding: 4px; font-weight: bold; border-right: 1px solid #000; display: flex; align-items: center; justify-content: center; text-align: center;">Inicio</div>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `
          <div style="flex: 1; border-right: ${i < 7 ? '1px solid #000' : 'none'}; padding: 4px; font-size: ${fontSizeGeneral}; overflow-wrap: break-word;">
            ${actividades[i]?.inicio || ""}
          </div>
        `).join('')}
      </div>

      <div style="display: flex; border-bottom: 1px solid #000;">
        <div style="background: #002060; color: white; width: 80px; padding: 4px; font-weight: bold; border-right: 1px solid #000; display: flex; align-items: center; justify-content: center; text-align: center;">desarrollo</div>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `
          <div style="flex: 1; border-right: ${i < 7 ? '1px solid #000' : 'none'}; padding: 4px; font-size: ${fontSizeGeneral}; min-height: 80px; overflow-wrap: break-word;">
            ${actividades[i]?.desarrollo || ""}
          </div>
        `).join('')}
      </div>

      <div style="display: flex; border-bottom: 2px solid #000;">
        <div style="background: #002060; color: white; width: 80px; padding: 4px; font-weight: bold; border-right: 1px solid #000; display: flex; align-items: center; justify-content: center; text-align: center;">cierre</div>
        ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `
          <div style="flex: 1; border-right: ${i < 7 ? '1px solid #000' : 'none'}; padding: 4px; font-size: ${fontSizeGeneral}; overflow-wrap: break-word;">
            ${actividades[i]?.cierre || ""}
          </div>
        `).join('')}
      </div>

      <div style="display: flex; border-bottom: 1px solid #000;">
        <div style="background: #002060; color: white; width: 140px; padding: 6px; font-weight: bold; border-right: 1px solid #000; display: flex; align-items: center;">Indicadores de evaluacion:</div>
        <div style="padding: 6px; flex: 1; white-space: pre-line; text-align: left;">${d.indicadoresEvaluacion || root.indicadoresEvaluacion || ""}</div>
      </div>
      <div style="display: flex;">
        <div style="background: #002060; color: white; width: 140px; padding: 6px; font-weight: bold; border-right: 1px solid #000; display: flex; align-items: center;">Actividades complementarias:</div>
        <div style="padding: 6px; flex: 1; white-space: pre-line; text-align: left;">${d.actividadesComplementarias || root.actividadesComplementarias || ""}</div>
      </div>
    </div>
  `;
};

const exportarPDF = (item) => {
  const printWindow = window.open('', '_blank');
  
  const normalizar = (t) => t ? t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
  const esPlanificacion = normalizar(item.tipo || "").includes('planifica');

  const d = item.datos || {};
  const contenidoBruto = (typeof item.datos === 'string' ? item.datos : null) || 
                         d.planificacion || d.contenido || item.contenido || "";

  let contenidoFinal = "";
  let filaMaterialesTexto = ""; 

  if (esPlanificacion) {
    const nombreDoc = item.nombre || d.nombre || "";
    const apellidoDoc = item.apellido || d.apellido || "";
    const docenteCompleto = `${nombreDoc} ${apellidoDoc}`.trim();
    const nivel = item.nivel || d.nivel || "";
    const escuela = item.centroEscolar || d.centroEscolar || "";
    const grado = item.grado || d.grado || "";
    const seccion = item.seccion || d.seccion || "";
    const municipio = item.municipio || d.municipio || "";
    const depto = item.departamento || d.departamento || "";
    const materia = item.materia || d.materia || "";
    const nombreUnidad = item.nombreUnidad || d.nombreUnidad || "";
    const numUnidad = item.numUnidad || d.numUnidad || "";
    const fecha = item.fecha || d.fecha || "";
    const duracion = item.duracion || d.duracion || "";
    const dificultad = item.dificultad || d.dificultad || "";
    const tema = item.tema || d.tema || "";

    const formatList = (raw) => {
      if (!raw) return '';
      return raw.split('\n')
        .map(l => l.replace(/\*/g, '').trim())
        .filter(l => l.length > 0)
        .map(l => `
          <div style="display:flex; align-items:flex-start; text-align:left; margin-bottom:1px; line-height:1.2;">
            <span style="min-width:10px; font-weight:bold;">•</span>
            <span>${l}</span>
          </div>`).join('');
    };

    const formatListSinVineta = (raw) => {
      if (!raw) return '';
      return raw.split('\n')
        .map(l => l.replace(/\*/g, '').trim())
        .filter(l => l.length > 0)
        .map(l => `<div style="text-align:left; margin-bottom:4px; line-height:1.2;">${l}</div>`).join('');
    };

    const fuenteActividades = item.tiempos || d.tiempos || item.actividades || d.actividades || [];
    
    let indicadoresRaw = item.indicadoresLogro || d.indicadoresLogro || item.indicadores || d.indicadores || "";
    if (!indicadoresRaw && contenidoBruto.includes('INDICADORES')) {
      const parte = contenidoBruto.split(/### .*INDICADORES.*/i)[1];
      if (parte) indicadoresRaw = parte.split('###')[0].trim();
    }
    const indicadoresFinal = formatList(indicadoresRaw);

    let objetivosRaw = item.objetivos || d.objetivos || item.objetivo || d.objective || "";
    if (!objetivosRaw && contenidoBruto.includes('OBJETIVO')) {
      const parte = contenidoBruto.split(/### .*OBJETIVO.*/i)[1];
      if (parte) objetivosRaw = parte.split('###')[0].trim();
    }
    const objetivosFinal = formatList(objetivosRaw);

    let evalRaw = item.indicadoresEvaluacion || d.indicadoresEvaluacion || "";
    if (!evalRaw && contenidoBruto.includes('EVALUACIÓN')) {
        const parte = contenidoBruto.split(/### .*EVALUACIÓN.*/i)[1];
        if (parte) evalRaw = parte.split('###')[0].trim();
    }
    const evaluacionFinal = formatList(evalRaw);

    let compRaw = item.actividadesComplementarias || d.actividadesComplementarias || "";
    if (!compRaw && contenidoBruto.includes('COMPLEMENTARIAS')) {
        const parte = contenidoBruto.split(/### .*COMPLEMENTARIAS.*/i)[1];
        if (parte) compRaw = parte.split('###')[0].trim();
    }
    const complementariasFinal = formatList(compRaw);

    const lineas = contenidoBruto.replace(/\*\*/g, '').split('\n').map(l => l.trim()).filter(l => l);

    let datosMateriales = [];
    if (item.materiales && Array.isArray(item.materiales)) {
        datosMateriales = item.materiales.map(m => formatList(m));
    } else if (d.materiales && Array.isArray(d.materiales)) {
        datosMateriales = d.materiales.map(m => formatList(m));
    } else if (contenidoBruto.includes('### IV. MATERIALES')) {
        const bloqueMateriales = contenidoBruto.split('### IV. MATERIALES')[1].split('###')[0].trim();
        const listaLimpia = bloqueMateriales.split('\n').map(l => l.replace(/\*/g, '').trim()).filter(l => l !== "");
        for (let i = 0; i < 8; i++) {
            const inicio = i * 3;
            const grupo = listaLimpia.slice(inicio, inicio + 3);
            datosMateriales.push(formatList(grupo.join('\n')));
        }
    } else {
        const encontrada = lineas.find(l => 
          (l.includes('|') && (l.toLowerCase().includes('materiales') || l.toLowerCase().includes('recursos'))) ||
          (l.toLowerCase().startsWith('materiales:') || l.toLowerCase().startsWith('recursos:'))
        );
        if (encontrada) {
          filaMaterialesTexto = encontrada;
          let itemsMat = [];
          if (encontrada.includes('|')) {
            itemsMat = encontrada.split('|').map(c => c.trim().replace(/\*/g, '')).filter(c => c !== "" && !/materiales:|recursos:|materia:|grado:/i.test(c));
          } else {
            itemsMat = encontrada.replace(/materiales:|recursos:/i, '').split(/[,•-]/).map(c => c.trim()).filter(c => c !== "");
          }
          datosMateriales = itemsMat.map(m => formatList(m));
        }
    }

    contenidoFinal = `
      <div style="background:#002060 !important; color:white !important; border:2px solid #000; padding:8px; text-align:center; font-weight:bold; text-transform:uppercase; font-size:11pt; -webkit-print-color-adjust: exact;">Planificación Generada</div>
      
      <div style="display:flex; width:100%; margin-top:-2px; align-items: stretch;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:160px; flex-shrink:0; -webkit-print-color-adjust: exact;">Nombre del docente:</div>
        <div style="border:1px solid #000; padding:5px 8px; font-size:9pt; flex-grow:2; margin-left:-1px; background:white;">${docenteCompleto}</div>
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:70px; margin-left:-1px; -webkit-print-color-adjust: exact;">Grado:</div>
        <div style="border:1px solid #000; padding:5px 8px; font-size:9pt; width:100px; margin-left:-1px; background:white;">${grado}</div>
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:80px; margin-left:-1px; -webkit-print-color-adjust: exact;">Sección:</div>
        <div style="border:1px solid #000; padding:5px 8px; font-size:9pt; width:90px; margin-left:-1px; background:white;">${seccion}</div>
      </div>

      <div style="display:flex; width:100%; margin-top:-1px; align-items: stretch;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:160px; -webkit-print-color-adjust: exact;">municipio:</div>
        <div style="border:1px solid #000; padding:5px 8px; font-size:9pt; flex-grow:1; margin-left:-1px; background:white;">${municipio}</div>
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:150px; margin-left:-1px; -webkit-print-color-adjust: exact;">Departamento:</div>
        <div style="border:1px solid #000; padding:5px 8px; font-size:9pt; flex-grow:1; margin-left:-1px; background:white;">${depto}</div>
      </div>

      <div style="display:flex; width:100%; margin-top:-1px; align-items: stretch;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:160px; -webkit-print-color-adjust: exact;">Nivel educativo:</div>
        <div style="border:1px solid #000; padding:5px 8px; font-size:9pt; width:120px; margin-left:-1px; background:white;">${nivel}</div>
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:140px; margin-left:-1px; -webkit-print-color-adjust: exact;">Centro escolar:</div>
        <div style="border:1px solid #000; padding:5px 8px; font-size:9pt; flex-grow:1; margin-left:-1px; background:white;">${escuela}</div>
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:80px; margin-left:-1px; -webkit-print-color-adjust: exact;">Materia:</div>
        <div style="border:1px solid #000; padding:5px 8px; font-size:9pt; width:100px; margin-left:-1px; background:white;">${materia}</div>
      </div>

      <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:6px; text-align:center; font-weight:bold; font-size:10pt; text-transform:uppercase; margin-top:-1px; -webkit-print-color-adjust: exact;">Datos específicos</div>

      <div style="display:flex; width:100%; margin-top:-1px; align-items: stretch;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:160px; -webkit-print-color-adjust: exact;">Nombre de la unidad:</div>
        <div style="border:1px solid #000; padding:5px 8px; font-size:9pt; flex-grow:1; margin-left:-1px; background:white;">${nombreUnidad}</div>
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:110px; margin-left:-1px; -webkit-print-color-adjust: exact;">n° de Unidad:</div>
        <div style="border:1px solid #000; padding:5px 8px; font-size:9pt; width:90px; margin-left:-1px; text-align:center;">${numUnidad}</div>
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:70px; margin-left:-1px; -webkit-print-color-adjust: exact;">fecha:</div>
        <div style="border:1px solid #000; padding:5px 8px; font-size:9pt; width:100px; margin-left:-1px; background:white;">${fecha}</div>
      </div>

      <div style="display:flex; width:100%; margin-top:-1px; align-items: stretch;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:160px; -webkit-print-color-adjust: exact;">Duracion semanal:</div>
        <div style="border:1px solid #000; padding:5px 8px; font-size:9pt; width:100px; margin-left:-1px; background:white;">${duracion}</div>
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:160px; margin-left:-1px; -webkit-print-color-adjust: exact;">Nivel de dificultad:</div>
        <div style="border:1px solid #000; padding:5px 8px; font-size:9pt; width:100px; margin-left:-1px; background:white;">${dificultad}</div>
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:70px; margin-left:-1px; -webkit-print-color-adjust: exact;">Tema:</div>
        <div style="border:1px solid #000; padding:5px 8px; font-size:9pt; flex-grow:1; margin-left:-1px; background:white;">${tema}</div>
      </div>

      <div style="display:flex; width:100%; margin-top:-1px; align-items: stretch;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:160px; flex-shrink:0; -webkit-print-color-adjust: exact;">Indicadores de logro:</div>
        <div style="border:1px solid #000; padding:8px; font-size:9pt; flex-grow:1; margin-left:-1px; background:white;">${indicadoresFinal || 'No especificados'}</div>
      </div>

      <div style="display:flex; width:100%; margin-top:-1px; align-items: stretch;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:160px; flex-shrink:0; -webkit-print-color-adjust: exact;">Objetivos:</div>
        <div style="border:1px solid #000; padding:8px; font-size:9pt; flex-grow:1; margin-left:-1px; background:white;">${objetivosFinal || 'No especificados'}</div>
      </div>

      <div style="display:flex; width:100%; margin-top:-1px;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px; font-weight:bold; font-size:8pt; width:160px; text-align:center; -webkit-print-color-adjust: exact;">n° actividad:</div>
        ${[1,2,3,4,5,6,7,8].map(num => `
          <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px; font-weight:bold; font-size:8pt; flex:1; text-align:center; margin-left:-1px; -webkit-print-color-adjust: exact;">Actividad ${num}</div>
        `).join('')}
      </div>

      <div style="display:flex; width:100%; margin-top:-1px; align-items: stretch;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px; font-weight:bold; font-size:8pt; width:160px; display:flex; align-items:center; justify-content:center; flex-shrink:0; -webkit-print-color-adjust: exact;">Materiales:</div>
        ${[0,1,2,3,4,5,6,7].map(idx => `
          <div style="background:white; border:1px solid #000; padding:8px 5px; font-size:8pt; flex:1; margin-left:-1px; text-align:left;">
            ${datosMateriales[idx] || ''}
          </div>
        `).join('')}
      </div>

      <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:6px; text-align:center; font-weight:bold; font-size:10pt; text-transform:uppercase; margin-top:-1px; -webkit-print-color-adjust: exact;">MOMENTOS DE LA CLASE</div>

      <div style="display:flex; width:100%; margin-top:-1px;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px; font-weight:bold; font-size:8pt; width:160px; text-align:center; -webkit-print-color-adjust: exact;">Tiempo para actividades</div>
        ${[1,2,3,4,5,6,7,8].map(num => `
          <div style="background:white; border:1px solid #000; padding:5px; font-weight:bold; font-size:8pt; flex:1; text-align:center; margin-left:-1px;">Actividad ${num}</div>
        `).join('')}
      </div>

      <div style="display:flex; width:100%; margin-top:-1px; align-items: stretch;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px; font-weight:bold; font-size:8pt; width:160px; display:flex; align-items:center; justify-content:center; flex-shrink:0; -webkit-print-color-adjust: exact;">Inicio</div>
        ${[0,1,2,3,4,5,6,7].map(idx => `
          <div style="background:white; border:1px solid #000; flex:1; margin-left:-1px; padding:6px; font-size:7.5pt; word-break: break-word;">${formatListSinVineta(fuenteActividades[idx]?.inicio || '')}</div>
        `).join('')}
      </div>

      <div style="display:flex; width:100%; margin-top:-1px; align-items: stretch;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px; font-weight:bold; font-size:8pt; width:160px; display:flex; align-items:center; justify-content:center; flex-shrink:0; -webkit-print-color-adjust: exact;">Desarrollo</div>
        ${[0,1,2,3,4,5,6,7].map(idx => `
          <div style="background:white; border:1px solid #000; flex:1; margin-left:-1px; padding:6px; font-size:7.5pt; word-break: break-word;">${formatListSinVineta(fuenteActividades[idx]?.desarrollo || '')}</div>
        `).join('')}
      </div>

      <div style="display:flex; width:100%; margin-top:-1px; align-items: stretch;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px; font-weight:bold; font-size:8pt; width:160px; display:flex; align-items:center; justify-content:center; flex-shrink:0; -webkit-print-color-adjust: exact;">Cierre</div>
        ${[0,1,2,3,4,5,6,7].map(idx => `
          <div style="background:white; border:1px solid #000; flex:1; margin-left:-1px; padding:6px; font-size:7.5pt; word-break: break-word;">${formatListSinVineta(fuenteActividades[idx]?.cierre || '')}</div>
        `).join('')}
      </div>

      <div style="display:flex; width:100%; margin-top:-1px; align-items: stretch;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:160px; flex-shrink:0; -webkit-print-color-adjust: exact;">Indicadores de evaluación:</div>
        <div style="border:1px solid #000; padding:8px; font-size:9pt; flex-grow:1; margin-left:-1px; background:white;">${evaluacionFinal || 'No especificados'}</div>
      </div>

      <div style="display:flex; width:100%; margin-top:-1px; align-items: stretch;">
        <div style="background:#002060 !important; color:white !important; border:1px solid #000; padding:5px 8px; font-weight:bold; font-size:9pt; width:160px; flex-shrink:0; -webkit-print-color-adjust: exact;">Actividades complementarias:</div>
        <div style="border:1px solid #000; padding:8px; font-size:9pt; flex-grow:1; margin-left:-1px; background:white;">${complementariasFinal || 'No especificados'}</div>
      </div>

      <div style="margin-top:-1px;">
        ${lineas.filter(l => 
          !l.toLowerCase().includes('###') &&
          !l.toLowerCase().includes('materia:') && 
          !l.toLowerCase().includes('grado:') &&
          (filaMaterialesTexto === "" || l !== filaMaterialesTexto)
        ).map(l => {
          if (l.includes('|')) {
            const celdas = l.split('|').filter(c => c.trim() !== "");
            if (l.toUpperCase().includes("MOMENTOS DE LA CLASE")) return '';
            return `
              <div style="display:flex; width:100%; margin-top:-1px; align-items: stretch;">
                ${celdas.map(c => {
                  const esEncabezado = /Actividad|Momento|Inicio|Desarrollo|Cierre|Tiempo|Evaluacion|MOMENTOS/i.test(c);
                  return `
                    <div style="border:1px solid #000; padding:6px; font-size:8pt; flex:1; margin-left:-1px;
                      ${esEncabezado ? 'background:#002060 !important; color:white !important; font-weight:bold; text-align:center; -webkit-print-color-adjust: exact;' : 'background:white; text-align:left;'}">
                      ${c.trim()}
                    </div>`;
                }).join('')}
              </div>`;
          }
          return '';
        }).join('')}
      </div>
    `;
  } else {
    contenidoFinal = (typeof renderizarEstiloIA === 'function') ? renderizarEstiloIA(contenidoBruto) : contenidoBruto;
  }

  const htmlDoc = `
    <html>
      <head>
        <style>
          @page { size: A4 landscape; margin: 10mm; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #525659; }
          .sheet { background: white; width: 277mm; margin: 20px auto; padding: 10mm; box-sizing: border-box; }
          .toolbar { background: #1a365d; padding: 10px; color: white; display: flex; justify-content: space-between; position: fixed; width: 100%; top: 0; z-index: 999; }
          @media print {
            body { background: none; }
            .toolbar { display: none; }
            .sheet { margin: 0; width: 100%; padding: 0; box-shadow: none; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        </style>
      </head>
      <body>
        <div class="toolbar">
          <span>VILLATORO'S SOLUTIONS</span>
          <button onclick="window.print()" style="background:#10b981; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; font-weight:bold;">GUARDAR PDF</button>
        </div>
        <div class="sheet">${contenidoFinal}</div>
      </body>
    </html>`;

  printWindow.document.write(htmlDoc);
  printWindow.document.close();
};
  const cargarDatosGestion = async () => {
  setLoading(true); // <--- Úsalo al empezar
  try {
    const userId = localStorage.getItem('userId');
const response = await fetch(`${API_BASE_URL}/api/gestion?userId=${userId}`);    const data = await response.json();
    setItems(data);
  } catch (error) {
    console.error("Error al cargar datos:", error);
  } finally {
    setLoading(false); // <--- Úsalo al terminar
  }
};

useEffect(() => {
    if (userId) {
      cargarDatosGestion();
    }
  }, [userId]);
  const enviarAPapelera = (id) => {
    if (!window.confirm("¿Mover a la papelera?")) return;
    fetch(`http://localhost:5000/api/gestion/${id}`, { method: 'DELETE' })
        .then(res => { if(res.ok) cargarDatosGestion(); });
  };

  return (
    <div className={`gestion-container ${darkMode ? 'dark' : 'light'}`}>
      <h1 className="main-title">{mostrarPapelera ? "Papelera de Reciclaje" : "Centro de Gestión Educativa"}</h1>

      <div className="stats-header" style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <div className="stat-box" style={{ background: '#3182ce', padding: '10px 20px', borderRadius: '12px', color: 'white' }}>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>Planificaciones</span><br/>
            <strong style={{ fontSize: '20px' }}>{stats.planificaciones}</strong>
        </div>
        <div className="stat-box" style={{ background: '#38a169', padding: '10px 20px', borderRadius: '12px', color: 'white' }}>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>Recursos</span><br/>
            <strong style={{ fontSize: '20px' }}>{stats.recursos}</strong>
        </div>
        <div className="stat-box" style={{ background: '#805ad5', padding: '10px 20px', borderRadius: '12px', color: 'white' }}>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>Materias Activas</span><br/>
            <strong style={{ fontSize: '20px' }}>{stats.materias}</strong>
        </div>
      </div>

      <div className="gestion-tools" style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <input type="text" placeholder="Buscar tema..." className="search-input" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} style={{ flex: 2, padding: '12px', borderRadius: '8px' }} />
        <select value={materiaSeleccionada} onChange={(e) => setMateriaSeleccionada(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px' }}>
          <option value="">Todas las Materias</option>
          {materiasDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={gradoSeleccionado} onChange={(e) => setGradoSeleccionado(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px' }}>
          <option value="">Todos los Grados</option>
          {gradosDisponibles.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {loading ? ( <div className="loading-msg">Cargando...</div> ) : (
        ['planificacion', 'recurso'].map(tipo => (
          <section key={tipo} className="gestion-section">
            <h2 className="section-subtitle">{tipo === 'planificacion' ? 'Planificaciones' : 'Recursos'}</h2>
            <div className="cards-grid">
              {safeItems
                .filter(i => {
                   const tipoNormalizado = normalizar(i.tipo);
                   const esTipoPlanif = (tipo === 'planificacion' && tipoNormalizado.includes('planifica'));
                   const esTipoRecurso = (tipo === 'recurso' && tipoNormalizado.includes('recurso'));
                   return (esTipoPlanif || esTipoRecurso) && (mostrarPapelera ? i.borrado : !i.borrado);
                })
                .filter(i => {
                  const coincideTxt = (i.tema || i.nombreUnidad || "").toLowerCase().includes(busqueda.toLowerCase());
                  const coincideMat = !materiaSeleccionada || i.materia === materiaSeleccionada;
                  const coincideGra = !gradoSeleccionado || i.grado === gradoSeleccionado;
                  return coincideTxt && coincideMat && coincideGra;
                })
                .map((item) => {
  const titulo = item.tema || item.tipoRecurso || item.nombreUnidad;
  // 1. Aquí definimos la variable (esto quita el error de la imagen)
  const esPlanif = normalizar(item.tipo).includes('planifica');

  return (
    <div key={item._id} className="card" style={{ zIndex: activeMenu === item._id ? 100 : 1 }}>
      <div className="card-info">
        <h3 onClick={() => setPreviewItem(item)} style={{ cursor: 'pointer' }}>
          <span style={{ backgroundColor: getColorPorTema(titulo), padding: '2px 8px', borderRadius: '4px' }}>{titulo}</span>
        </h3>
        <p>{item.materia} - {item.grado}</p>
      </div>
      <div className="card-options">
        <button onClick={() => setActiveMenu(activeMenu === item._id ? null : item._id)} className="dots-btn">⋮</button>
        {activeMenu === item._id && (
          <div className="dropdown-menu">
            {!mostrarPapelera ? (
              <>
                {/* 2. Aquí usamos la variable esPlanif para decidir cómo editar */}
                <button onClick={() => {
                  if (esPlanif) {
                    // Guardamos en memoria para el Módulo 1
                    localStorage.setItem('datosEdicion', JSON.stringify(item));
                    navigate('/planificaciones');
                  } else {
                    // Navegamos normal para Recursos (Módulo 2)
                    navigate(`/recursos?edit=${item._id}`);
                  }
                }}>
                  Editar
                </button>
                
                <button onClick={() => enviarAPapelera(item._id)}>Eliminar</button>
                <div className="submenu-trigger">Exportar
                  <div className="submenu">
                    <button onClick={() => exportarPDF(item)}>PDF</button>
                    <button onClick={() => exportarWord(item)}>Word</button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
})}
            </div>
          </section>
        ))
      )}

     {previewItem && (
  <div className="modal-overlay" onClick={() => setPreviewItem(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '95%', maxWidth: '1100px', maxHeight: '95vh', overflowY: 'auto', color: '#2d3748' }}>
      <button onClick={() => setPreviewItem(null)} style={{ float: 'right', border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
      
      {/* AQUÍ ESTÁ EL CAMBIO: Inyectamos la tabla completa */}
      <div 
        className="preview-body" 
        style={{ marginTop: '20px' }}
        dangerouslySetInnerHTML={{ __html: obtenerContenidoParaModal(previewItem) }} 
      />

    </div>
  </div>
)}
    </div>
  );
};

export default Gestion;