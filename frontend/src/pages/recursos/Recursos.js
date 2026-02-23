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

  const formatearTextoPorLineas = (texto) => {
    if (!texto) return '';
    return texto.replace(/\*/g, '').split(/(?<=[.!?])\s+/).map(frase => frase.trim()).filter(frase => frase.length > 3).join('\n');
  };

  // --- CARGAR DATOS CORREGIDO ---
  const cargarDatos = useCallback(async () => {
    const userId = localStorage.getItem('userId'); 
    if (!userId) {
      console.warn("⚠️ No se encontró userId en localStorage");
      return;
    }

    try {
      setLoading(true);
      // Usamos una URL limpia y verificamos que el servidor responda
      const response = await fetch(`${API_BASE_URL}/api/gestion?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Filtramos para obtener solo las planificaciones (tipo !== recurso)
        const soloPlanes = data.filter(item => item.tipo !== 'recurso');
        setPlanificaciones(soloPlanes);
      }
    } catch (error) {
      // Línea 119 original: Manejo del error de conexión
      console.error("❌ Error al conectar con el servidor:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]); // Se añade cargarDatos para eliminar el warning de la consola

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

  const manejarGenerar = async () => {
    if (loading || !formData.tipoRecurso) return;
    setLoading(true);
    setResultado(''); 
    try {
      const response = await fetch(`${API_BASE_URL}/api/generar-recurso-v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Línea 147 original
        body: JSON.stringify({
          materia: formData.materia,
          tema: formData.nombreUnidad, 
          tipoRecurso: formData.tipoRecurso,
          dificultad: formData.dificultad,
          objetivos: formData.objetivos,
          indicadores: formData.indicadores,
          sugerencias: `IMPORTANTE: Tablas en Markdown y operaciones matemáticas en LaTeX.`
        }),
      });

      if (!response.ok) throw new Error("Error en el servidor al generar");

      const data = await response.json();
      setResultado(formatearContenidoIA(data.contenido)); 
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
        el.removeAttribute('class');
        el.removeAttribute('id');
        el.style.fontFamily = "Arial, sans-serif";
      });

      const htmlFinal = `<div style="font-family: Arial;">${clono.innerHTML}</div>`;
      const blobHTML = new Blob([htmlFinal], { type: "text/html" });
      const blobText = new Blob([elemento.innerText], { type: "text/plain" });

      const data = [new ClipboardItem({ "text/html": blobHTML, "text/plain": blobText })];
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

  const manejarSeleccion = (campo, valor) => {
    if (campo === 'nombreUnidad') {
      const plan = planificaciones.find(p => (p.tema || p.nombreUnidad || "").trim() === valor.trim());
      if (plan) {
        setFormData({
          ...formData,
          nombreUnidad: valor,
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
    setFormData(prev => ({ ...prev, [campo]: valor }));
    setOpenDropdown(null);
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
              style={{ width: '100%', background: 'transparent', border: 'none', color: 'inherit', resize: 'none', outline: 'none', minHeight: '24px', overflow: 'hidden' }}
            />
          ) : (
            <span className="selected-text-content">{formData[campo] || placeholder}</span>
          )}
          <span className="icon-v">▼</span>
        </div>
        {isOpen && (
          <ul className="dropdown-list">
            <li className="placeholder-option" onClick={() => { setFormData({...formData, [campo]: ''}); setOpenDropdown(null); }}>-- Limpiar selección --</li>
            {lista.map((opcion, index) => (
              <li key={index} onClick={() => manejarSeleccion(campo, opcion)} className="dropdown-option-item">
                <span className="option-text">{opcion}</span>
                {campo === 'nombreUnidad' && (
                  <button className="btn-delete-inline" onClick={(e) => eliminarPlanificacion(e, opcion)}>🗑️</button>
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
              <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                {resultado}
              </ReactMarkdown>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '15px', flexWrap: 'wrap' }}>
              <button className="btn-footer btn-sync-white" onClick={copiarConFormato} style={{ maxWidth: '320px' }}>Copiar recurso</button>
              <button className="btn-footer" onClick={exportarAGestion} disabled={saving} style={{ backgroundColor: ' #003366', color: 'white', maxWidth: '320px' }}>
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