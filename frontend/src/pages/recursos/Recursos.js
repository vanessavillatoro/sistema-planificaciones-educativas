import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'; 
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm'; 
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import './Recursos.css';

const Recursos = ({ darkMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreUnidad: '', numUnidad: '', materia: '',
    dificultad: '', tipoRecurso: '', objetivos: '', indicadores: ''
  });

  const [planificaciones, setPlanificaciones] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); 
  const [resultado, setResultado] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // --- URL FIJA PARA EVITAR ERRORES DE ENTORNO ---
  const API_BASE_URL = 'https://sistema-planificaciones-back.vercel.app';

  const ajustarAlturaTextareas = () => {
    setTimeout(() => {
      const textareas = document.querySelectorAll('.dropdown-textarea-header');
      textareas.forEach(ta => {
        ta.style.height = 'auto';
        ta.style.height = ta.scrollHeight + 'px';
      });
    }, 50);
  };

  const eliminarPlanificacion = async (e, tema) => {
    e.stopPropagation(); 
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la planificación: "${tema}"?`);
    
    if (confirmar) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/planificaciones-por-tema/${encodeURIComponent(tema)}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert("✅ Planificación eliminada correctamente.");
          if (formData.nombreUnidad === tema) {
            limpiarTodo();
          }
          cargarDatos(); 
        } else {
          alert("❌ No se pudo eliminar la planificación.");
        }
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("❌ Error de conexión.");
      }
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const editId = queryParams.get('edit');

    if (editId) {
      fetch(`${API_BASE_URL}/api/gestion/${editId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setFormData({
              nombreUnidad: data.tema || data.nombreUnidad || '',
              numUnidad: data.numUnidad || '',
              materia: data.materia || '',
              dificultad: data.dificultad || '',
              tipoRecurso: data.tipoRecurso || '',
              objetivos: formatearTextoPorLineas(data.objetivos || ''),
              indicadores: formatearTextoPorLineas(data.indicadores || '')
            });
            
            if (data.contenido || data.datos?.contenido) {
              setResultado(data.contenido || data.datos?.contenido);
            }
            ajustarAlturaTextareas(); 
          }
        })
        .catch(err => console.error("Error al cargar datos de edición:", err));
    }
  }, [location, API_BASE_URL]);

  // --- FUNCIÓN CARGAR DATOS ESTABILIZADA ---
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId'); 

      const planReciente = localStorage.getItem('planificacionReciente');
      if (planReciente) {
        const p = JSON.parse(planReciente);
        setFormData(prev => ({
          ...prev,
          nombreUnidad: p.tema || p.nombreUnidad || '',
          materia: p.materia || '',
          dificultad: p.dificultad || '',
          objetivos: formatearTextoPorLineas(p.objetivos || ''),
          indicadores: formatearTextoPorLineas(p.indicadoresLogro || p.indicadores || '')
        }));
        ajustarAlturaTextareas();
        localStorage.removeItem('planificacionReciente'); 
      }

      if (!userId) {
        setPlanificaciones([]);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/gestion?userId=${userId}&t=${new Date().getTime()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const soloPlanes = data.filter(item => item.tipo !== 'recurso');
        setPlanificaciones(soloPlanes);
      } else {
        setPlanificaciones([]);
      }
    } catch (error) {
      console.error("❌ Error al conectar:", error);
      setPlanificaciones([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarDatos();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [cargarDatos]);

  const formatearContenidoIA = (texto) => {
    if (!texto) return '';
    return texto
      .replace(/<img[^>]*>/g, '') 
      .replace(/(?<![\d$])(\d+)\/(\d+)(?![\d$])/g, '$\\frac{$1}{$2}$')
      .replace(/(?<!\$)\\frac\{([^}]+)\}\{([^}]+)\}(?!\$)/g, '$\\frac{$1}{$2}$')
      .replace(/\\text\{([^}]+)\}/g, '$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // --- MANEJAR GENERAR ACTUALIZADO PARA USAR EL ENDPOINT CORRECTO ---
  const manejarGenerar = async () => {
    if (loading || !formData.tipoRecurso) return;
    setLoading(true);
    setResultado(''); 
    try {
      // Usamos el endpoint v2 que creamos en el server.js para mayor compatibilidad
      const response = await fetch(`${API_BASE_URL}/api/generar-recurso-v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materia: formData.materia,
          tema: formData.nombreUnidad, 
          tipoRecurso: formData.tipoRecurso,
          dificultad: formData.dificultad,
          objetivos: formData.objetivos,
          indicadores: formData.indicadores,
          sugerencias: `
            IMPORTANTE: 
            - Si presentas datos comparativos o listas organizadas, utiliza TABLAS de Markdown estándar (| celda |).
            - Asegúrate de que las tablas tengan una fila de encabezado y una fila divisoria con guiones (---).
            - Presenta las operaciones matemáticas usando SIEMPRE $\\frac{numerador}{denominador}$.
            - Asegúrate de que cada ejercicio esté bien separado.`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error en el servidor");
      }

      const data = await response.json();
      const contenidoProcesado = formatearContenidoIA(data.contenido);
      setResultado(contenidoProcesado); 
    } catch (error) {
      console.error("❌ Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportarAGestion = async () => {
    if (!resultado) {
      alert("Primero debes generar un recurso.");
      return;
    }
    setSaving(true);
    try {
      const queryParams = new URLSearchParams(location.search);
      const editId = queryParams.get('edit');
      const userId = localStorage.getItem('userId');

      const datosGestion = {
        ...formData,
        userId: userId, 
        tipo: 'recurso',
        tema: formData.nombreUnidad,
        contenido: resultado,
        datos: { contenido: resultado },
        fechaExportacion: new Date()
      };

      const url = editId ? `${API_BASE_URL}/api/gestion/${editId}` : `${API_BASE_URL}/api/exportar-gestion`;
      const metodo = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosGestion),
      });

      if (response.ok) {
        alert(editId ? "¡Recurso actualizado con éxito!" : "¡Recurso enviado al Módulo de Gestión!");
        if (editId) navigate('/gestion'); 
      } else {
        throw new Error("Error en la operación");
      }
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("❌ Error al procesar en el módulo de Gestión.");
    } finally {
      setSaving(false);
    }
  };

  const copiarConFormato = async () => {
    const elemento = document.querySelector('.markdown-body');
    if (!elemento) return;

    try {
      const clono = elemento.cloneNode(true);
      const ruidos = clono.querySelectorAll('.katex-html, [aria-hidden="true"]');
      ruidos.forEach(r => r.remove());

      const todos = clono.querySelectorAll('*');
      
      todos.forEach(el => {
        const tag = el.tagName;
        const texto = el.innerText.trim();

        el.removeAttribute('class');
        el.removeAttribute('id');
        el.style.fontFamily = "Arial, sans-serif";
        
        if (tag === 'H1') {
          el.style.cssText = "color: #2c5282 !important; font-weight: bold !important; font-size: 18pt; text-align: center; margin-bottom: 12pt; display: block;";
        } 
        else if (['H2', 'H3'].includes(tag)) {
          el.style.cssText = "color: #2c5282 !important; font-weight: bold !important; font-size: 14pt; margin-top: 14pt; margin-bottom: 7pt; display: block;";
        }
        else if (tag === 'P' && texto.includes(':') && texto.length < 60) {
          el.style.cssText = "color: #2c5282 !important; font-weight: bold !important; font-size: 11pt; margin: 2pt 0; display: block;";
        }
        else if (tag === 'STRONG' || tag === 'B') {
          el.style.cssText = "font-weight: bold !important; color: #000000 !important; display: inline;";
        }
        else if (['TD', 'TH'].includes(tag)) {
          el.style.cssText = "border: 1px solid #ccc; padding: 6px; font-weight: normal;";
          if (tag === 'TH') el.style.fontWeight = "bold";
        }
        else {
          el.style.cssText = "font-weight: 400 !important; color: #333333 !important; font-size: 11pt; line-height: 1.5; margin-bottom: 8pt; display: block; text-align: left;";
        }
      });

      const htmlFinal = `
        <table border="0" cellpadding="0" cellspacing="0" style="width: 100%; font-weight: 400 !important;">
          <tr>
            <td style="font-weight: 400 !important;">
              ${clono.innerHTML}
            </td>
          </tr>
        </table>`;

      const blobHTML = new Blob([htmlFinal], { type: "text/html" });
      const blobText = new Blob([elemento.innerText], { type: "text/plain" });

      const data = [
        new ClipboardItem({
          "text/html": blobHTML,
          "text/plain": blobText
        })
      ];

      await navigator.clipboard.write(data);
      alert("Recurso copiado");
    } catch (err) {
      console.error("Error al copiar:", err);
      alert("Error al copiar formato.");
    }
  };

  const limpiarTodo = () => {
    setFormData({ nombreUnidad: '', numUnidad: '', materia: '', dificultad: '', tipoRecurso: '', objetivos: '', indicadores: '' });
    setResultado('');
    setOpenDropdown(null);
    if (location.search) navigate('/recursos');
  };

  const formatearTextoPorLineas = (texto) => {
    if (!texto) return '';
    return texto.replace(/\*/g, '').split(/(?<=[.!?])\s+/).map(frase => frase.trim()).filter(frase => frase.length > 3).join('\n');
  };

  const manejarSeleccion = (campo, valor) => {
    if (campo === 'nombreUnidad') {
      const plan = planificaciones.find(p => (p.tema || p.nombreUnidad || "").trim().toLowerCase() === valor.trim().toLowerCase());
      if (plan) {
        setFormData({
          ...formData,
          nombreUnidad: plan.tema || plan.nombreUnidad || valor,
          numUnidad: plan.numUnidad || '',
          materia: plan.materia || '',
          dificultad: plan.dificultad || '',
          objetivos: formatearTextoPorLineas(plan.objetivos),
          indicadores: formatearTextoPorLineas(plan.indicadores || plan.indicadoresLogro),
        });
        ajustarAlturaTextareas(); 
        setOpenDropdown(null);
        return;
      }
    }
    if (campo === 'objetivos' || campo === 'indicadores') {
      setFormData(prev => {
        const valorActual = prev[campo] ? prev[campo].trim() : '';
        const lineasActuales = valorActual.split('\n').map(v => v.trim());
        if (lineasActuales.includes(valor.trim())) return prev;
        const nuevoValor = valorActual === '' ? valor : `${valorActual}\n${valor}`;
        ajustarAlturaTextareas(); 
        return { ...prev, [campo]: nuevoValor };
      });
    } else {
      setFormData(prev => ({ ...prev, [campo]: valor }));
      setOpenDropdown(null);
    }
  };

  const obtenerListaFiltrada = (campo) => {
    if (!formData.nombreUnidad) return [];
    const planActual = planificaciones.find(p => (p.tema || p.nombreUnidad) === formData.nombreUnidad);
    return planActual && planActual[campo] ? [planActual[campo]] : [];
  };

  const procesarListaIA = (campo) => {
    if (!formData.nombreUnidad) return [];
    const planActual = planificaciones.find(p => (p.tema || p.nombreUnidad) === formData.nombreUnidad);
    if (!planActual) return [];
    const texto = campo === 'indicadores' ? (planActual.indicadoresLogro || planActual.indicadores) : planActual.objetivos;
    return texto ? [...new Set(texto.replace(/\*/g, '\n').split('\n').map(i => i.trim()).filter(i => i.length > 5))] : [];
  };

  const RenderDropdown = (campo, lista, placeholder, isFullWidth = false) => {
    const isOpen = openDropdown === campo;
    const esCampoTextoLargo = campo === 'objetivos' || campo === 'indicadores';

    return (
      <div className={`custom-dropdown ${isOpen ? 'is-open' : ''} ${isFullWidth ? 'full-width-input' : ''}`}>
        <div className="dropdown-header dinamic-height" onClick={() => !esCampoTextoLargo && setOpenDropdown(isOpen ? null : campo)}>
          {esCampoTextoLargo ? (
            <textarea
              className="dropdown-textarea-header"
              value={formData[campo]}
              placeholder={placeholder}
              onChange={(e) => {
                setFormData({ ...formData, [campo]: e.target.value });
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
              }}
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(isOpen ? null : campo);
              }}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                resize: 'none',
                padding: '0',
                outline: 'none',
                minHeight: '24px',
                overflow: 'hidden'
              }}
            />
          ) : (
            <span className="selected-text-content">{formData[campo] || placeholder}</span>
          )}
          <span className="icon-v" onClick={(e) => { 
            if(esCampoTextoLargo) { 
              e.stopPropagation(); 
              setOpenDropdown(isOpen ? null : campo); 
            }
          }}>▼</span>
        </div>
        {isOpen && (
          <ul className="dropdown-list">
            <li className="placeholder-option" onClick={() => { setFormData({...formData, [campo]: ''}); setOpenDropdown(null); }}>-- Limpiar selección --</li>
            {lista.map((opcion, index) => (
              <li key={index} onClick={() => manejarSeleccion(campo, opcion)} className="dropdown-option-item">
                <span className="option-text">{opcion}</span>
                {campo === 'nombreUnidad' && (
                  <button 
                    className="btn-delete-inline" 
                    onClick={(e) => eliminarPlanificacion(e, opcion)}
                    title="Eliminar planificación"
                  >
                    🗑️
                  </button>
                )}
              </li>
            ))}
            {lista.length === 0 && <li className="no-data">⚠️ Sin datos</li>}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className={`recursos-page ${darkMode ? 'dark' : 'light'}`}>
      <div className="recursos-card" ref={dropdownRef}>
        <div className="header-centered">
            <h1>Crear Recursos Didácticos</h1>
            <p className="subtitle-ia">Generado con Inteligencia Artificial</p>
        </div>
        <div className="recursos-grid">
          {RenderDropdown('nombreUnidad', [...new Set(planificaciones.map(p => p.tema || p.nombreUnidad))].filter(Boolean), 'Seleccionar Planificación')}
          {RenderDropdown('numUnidad', obtenerListaFiltrada('numUnidad'), 'N° Unidad')}
          {RenderDropdown('materia', obtenerListaFiltrada('materia'), 'Materia')}
          {RenderDropdown('dificultad', obtenerListaFiltrada('dificultad'), 'Dificultad')}
          <input className="full-width-input" type="text" placeholder="Tipo de recurso (ej: Guía de ejercicios)" value={formData.tipoRecurso} onChange={(e) => setFormData({...formData, tipoRecurso: e.target.value})} />
          {RenderDropdown('objetivos', procesarListaIA('objetivos'), 'Añadir Objetivos', true)}
          {RenderDropdown('indicadores', procesarListaIA('indicadores'), 'Añadir Indicadores', true)}
        </div>

        <div className="form-footer">
            <div className="footer-buttons-container">
                <button onClick={limpiarTodo} className="btn-footer btn-clear">Limpiar</button>
                <button onClick={cargarDatos} className="btn-footer btn-sync-white"> Sincronizar</button>
                <button className="btn-footer btn-generate-main-small" onClick={manejarGenerar} disabled={loading || !formData.tipoRecurso}>
                  {loading ? "Procesando..." : "Generar recurso"}
                </button>
            </div>
        </div>

        {resultado && (
          <div className="resultado-container">
            <h3 className="resultado-titulo">Contenido del Recurso:</h3>
            <div className="resultado-texto markdown-body styled-math">
              <ReactMarkdown 
                remarkPlugins={[remarkMath, remarkGfm]} 
                rehypePlugins={[rehypeKatex]}
              >
                {resultado}
              </ReactMarkdown>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '15px', flexWrap: 'wrap' }}>
              <button className="btn-footer btn-sync-white" onClick={copiarConFormato} style={{ maxWidth: '320px' }}>
                Copiar recurso
              </button>
              
              <button 
                className="btn-footer" 
                onClick={exportarAGestion} 
                disabled={saving}
                style={{ backgroundColor: ' #003366', color: 'white', maxWidth: '320px' }}
              >
                {saving ? " Procesando..." : (new URLSearchParams(location.search).get('edit') ? " Guardar Cambios" : " Exportar a Gestión")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recursos;