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

  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId'); 

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
      
      if (!response.ok) throw new Error("Error en el servidor");
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const soloPlanes = data.filter(item => item.tipo !== 'recurso');
        setPlanificaciones(soloPlanes);
      }
    } catch (error) {
      console.error("❌ Error al conectar:", error);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    cargarDatos();
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

  const manejarGenerar = async () => {
    if (loading || !formData.tipoRecurso) return;
    setLoading(true);
    setResultado(''); 
    try {
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
          sugerencias: `IMPORTANTE: Tablas en Markdown, matemáticas con frac.`
        }),
      });

      if (!response.ok) throw new Error("Error en el servidor");

      const data = await response.json();
      setResultado(formatearContenidoIA(data.contenido)); 
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportarAGestion = async () => {
    if (!resultado) return;
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
        fechaExportacion: new Date()
      };

      const url = editId ? `${API_BASE_URL}/api/gestion/${editId}` : `${API_BASE_URL}/api/exportar-gestion`;
      const response = await fetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosGestion),
      });

      if (response.ok) {
        alert("¡Éxito!");
        if (editId) navigate('/gestion'); 
      }
    } catch (error) {
      alert("❌ Error al procesar.");
    } finally {
      setSaving(false);
    }
  };

  const copiarConFormato = async () => {
    const elemento = document.querySelector('.markdown-body');
    if (!elemento) return;
    try {
        alert("Recurso copiado");
    } catch (err) { alert("Error al copiar"); }
  };

  const limpiarTodo = () => {
    setFormData({ nombreUnidad: '', numUnidad: '', materia: '', dificultad: '', tipoRecurso: '', objetivos: '', indicadores: '' });
    setResultado('');
    setOpenDropdown(null);
  };

  const formatearTextoPorLineas = (texto) => {
    if (!texto) return '';
    if (Array.isArray(texto)) return texto.join('\n');
    return texto.replace(/\*/g, '').split('\n').map(f => f.trim()).filter(f => f.length > 2).join('\n');
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
          indicadores: formatearTextoPorLineas(plan.indicadoresLogro || plan.indicadores),
        });
        ajustarAlturaTextareas();
        setOpenDropdown(null);
        return;
      }
    }
    
    setFormData(prev => ({ ...prev, [campo]: valor }));
    setOpenDropdown(null);
  };

  // --- CORRECCIÓN AQUÍ: LISTAS DINÁMICAS ---
  const obtenerListaCampo = (campo) => {
    if (campo === 'nombreUnidad') {
        return [...new Set(planificaciones.map(p => p.tema || p.nombreUnidad))].filter(Boolean);
    }
    return [...new Set(planificaciones.map(p => p[campo]))].filter(Boolean);
  };

  const procesarListaIA = (campo) => {
    if (!formData.nombreUnidad) return [];
    const planActual = planificaciones.find(p => (p.tema || p.nombreUnidad) === formData.nombreUnidad);
    if (!planActual) return [];
    const texto = campo === 'indicadores' ? (planActual.indicadoresLogro || planActual.indicadores) : planActual.objetivos;
    if (!texto) return [];
    const lineas = Array.isArray(texto) ? texto : texto.split('\n');
    return [...new Set(lineas.map(i => i.replace(/\*/g, '').trim()).filter(i => i.length > 5))];
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
              readOnly
              onClick={(e) => { e.stopPropagation(); setOpenDropdown(isOpen ? null : campo); }}
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', overflow: 'hidden', minHeight: '24px' }}
            />
          ) : (
            <span className="selected-text-content">{formData[campo] || placeholder}</span>
          )}
          <span className="icon-v">▼</span>
        </div>
        {isOpen && (
          <ul className="dropdown-list">
            <li className="placeholder-option" onClick={() => { setFormData({...formData, [campo]: ''}); setOpenDropdown(null); }}>-- Limpiar --</li>
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
            <p className="subtitle-ia">Vincule su planificación para autocompletar</p>
        </div>
        <div className="recursos-grid">
          {RenderDropdown('nombreUnidad', obtenerListaCampo('nombreUnidad'), 'Seleccionar Planificación')}
          {RenderDropdown('numUnidad', obtenerListaCampo('numUnidad'), 'N° Unidad')}
          {RenderDropdown('materia', obtenerListaCampo('materia'), 'Materia')}
          {RenderDropdown('dificultad', obtenerListaCampo('dificultad'), 'Dificultad')}
          
          <input className="full-width-input" type="text" placeholder="Tipo de recurso (ej: Guía de ejercicios)" value={formData.tipoRecurso} onChange={(e) => setFormData({...formData, tipoRecurso: e.target.value})} />
          
          {RenderDropdown('objetivos', procesarListaIA('objetivos'), 'Objetivos de la planificación', true)}
          {RenderDropdown('indicadores', procesarListaIA('indicadores'), 'Indicadores de la planificación', true)}
        </div>

        <div className="form-footer">
            <div className="footer-buttons-container">
                <button onClick={limpiarTodo} className="btn-footer btn-clear">Limpiar</button>
                <button onClick={cargarDatos} className="btn-footer btn-sync-white">Sincronizar</button>
                <button className="btn-footer btn-generate-main-small" onClick={manejarGenerar} disabled={loading || !formData.tipoRecurso}>
                  {loading ? "Procesando..." : "Generar recurso"}
                </button>
            </div>
        </div>

        {resultado && (
          <div className="resultado-container">
            <div className="resultado-texto markdown-body styled-math">
              <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                {resultado}
              </ReactMarkdown>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', gap: '15px' }}>
              <button className="btn-footer btn-sync-white" onClick={copiarConFormato}>Copiar recurso</button>
              <button className="btn-footer" onClick={exportarAGestion} disabled={saving} style={{ backgroundColor: '#003366', color: 'white' }}>
                {saving ? "Guardand..." : "Exportar a Gestión"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recursos;