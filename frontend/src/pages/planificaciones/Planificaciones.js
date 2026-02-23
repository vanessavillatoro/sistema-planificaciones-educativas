import React, { useState, useEffect, useRef } from 'react';
import './Planificaciones.css';

const Planificaciones = ({ darkMode }) => {
  const estadoInicial = {
    nombre: '', apellido: '', edad: '', seccion: '', municipio: '', departamento: '',
    celular: '', duracion: '', nivel: '', materia: '', nombreUnidad: '',
    numUnidad: '', tema: '', grado: '', dificultad: '', objetivos: '',
    centroEscolar: '', fecha: '',
    sugerencias: ''
  };

  const [formData, setFormData] = useState(estadoInicial);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const [planId, setPlanId] = useState(null); 

  // --- OBTENER EL ID DEL USUARIO ---
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const datosParaEditar = localStorage.getItem('datosEdicion');
    if (datosParaEditar) {
      try {
        const item = JSON.parse(datosParaEditar);
        console.log("Datos recuperados con éxito:", item);
        
        // Guardamos el ID del plan que se está editando
        if (item._id) {
          setPlanId(item._id);
        }

        setFormData(prev => ({
          ...prev,
          nombre: item.nombre || '',
          apellido: item.apellido || '',
          edad: item.edad || '',
          seccion: item.seccion || '',
          municipio: item.municipio || '',
          departamento: item.departamento || '',
          celular: item.celular || '',
          duracion: item.duracion || '',
          nivel: item.nivel || '',
          materia: item.materia || '',
          nombreUnidad: item.nombreUnidad || '',
          numUnidad: item.numUnidad || '',
          tema: item.tema || '',
          grado: item.grado || '',
          dificultad: item.dificultad || '',
          centroEscolar: item.centroEscolar || '',
          fecha: item.fecha || '',
          sugerencias: item.sugerencias || ''
        }));

        setResultado({
          objetivos: item.objetivos || '',
          indicadoresLogro: item.indicadoresLogro || '',
          indicadoresEvaluacion: item.indicadoresEvaluacion || '',
          materiales: item.materiales || item.listaMateriales || [],
          tiempos: item.tiempos || item.actividades || [],
          actividadesComplementarias: item.actividadesComplementarias || ''
        });

        localStorage.removeItem('datosEdicion');
      } catch (error) {
        console.error("Error al procesar los datos de edición:", error);
      }
    }
  }, []);

  const moverAPapelera = async () => {
    if (!formData.tema && !formData.nombreUnidad) {
      limpiarFormulario();
      return;
    }
    const confirmar = window.confirm(`¿Desea mover "${formData.tema || formData.nombreUnidad}" a la papelera?`);
    if (!confirmar) {
      limpiarFormulario();
      return;
    }
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const identificador = formData.tema || formData.nombreUnidad;
      
      const response = await fetch(`${baseUrl}/api/planificaciones-por-tema/${encodeURIComponent(identificador)}?userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("Movido a la papelera correctamente.");
        limpiarFormulario();
      } else {
        limpiarFormulario();
      }
    } catch (error) {
      console.error("Error al mover a papelera:", error);
      limpiarFormulario();
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (editId) {
      console.log("Modo edición activado para ID:", editId);
    }
  }, []);

  const listaEdades = ['Edad', ...Array.from({ length: 51 }, (_, i) => `${i + 20} años`)];
  const listaSecciones = ['Seccion', 'Sección A', 'Sección B', 'Sección C'];
  const listaDeptos = ['Departamento', 'Ahuachapán', 'Cabañas', 'Chalatenango', 'Cuscatlán', 'La Libertad', 'La Paz', 'La Unión', 'Morazán', 'San Miguel', 'San Salvador', 'San Vicente', 'Santa Ana', 'Sonsonate', 'Usulután'];
  
  const municipiosPorDepto = {
    'Ahuachapán': ['Ahuachapán Centro', 'Ahuachapán Norte', 'Ahuachapán Sur'],
    'Cabañas': ['Cabañas Este', 'Cabañas Oeste'],
    'Chalatenango': ['Chalatenango Centro', 'Chalatenango Norte', 'Chalatenango Sur'],
    'Cuscatlán': ['Cuscatlán Norte', 'Cuscatlán Sur'],
    'La Libertad': ['La Libertad Centro', 'La Libertad Este', 'La Libertad Norte', 'La Libertad Oeste', 'La Libertad Sur', 'La Libertad Costa'],
    'La Paz': ['La Paz Centro', 'La Paz Este', 'La Paz Oeste'],
    'La Unión': ['La Unión Norte', 'La Unión Sur'],
    'Morazán': ['Morazán Norte', 'Morazán Sur'],
    'San Miguel': ['San Miguel Centro', 'San Miguel Norte', 'San Miguel Sur'],
    'San Salvador': ['San Salvador Centro', 'San Salvador Este', 'San Salvador Norte', 'San Salvador Oeste', 'San Salvador Sur'],
    'San Vicente': ['San Vicente Norte', 'San Vicente Sur'],
    'Santa Ana': ['Santa Ana Centro', 'Santa Ana Este', 'Santa Ana Norte', 'Santa Ana Sur'],
    'Sonsonate': ['Sonsonate Centro', 'Sonsonate Este', 'Sonsonate Norte', 'Sonsonate Sur'],
    'Usulután': ['Usulután Centro', 'Usulután Este', 'Usulután Norte']
  };

  const listaNivelEducativo = ['Nivel educativo', 'Ciclo I', 'Ciclo II', 'Ciclo III'];
  const listaUnidades = ['n° unidad', ...Array.from({ length: 12 }, (_, i) => `Unidad ${i + 1}`)];
  const listaGrados = ['Grado', ...Array.from({ length: 9 }, (_, i) => `${i + 1}º Grado`)];
  const listaDificultad = ['Nivel de dificultad', 'Repaso', 'Estudio', 'Refuerzo'];
  const listaDuracion = ['Duracion semanal', ...Array.from({ length: 30 }, (_, i) => `${i + 1} ${i === 0 ? 'hora' : 'horas'}`)];

  const copiarPlanificacion = async () => {
    const tablaOriginal = document.querySelector('.planning-table');
    if (!tablaOriginal) {
      alert("No se encontró la tabla para copiar.");
      return;
    }

    try {
      const clon = tablaOriginal.cloneNode(true);
      const celdasClonadas = clon.querySelectorAll('th, td');

      celdasClonadas.forEach((celdaCopia) => {
        if (celdaCopia.classList.contains('header-blue') || 
            celdaCopia.classList.contains('label-blue') || 
            celdaCopia.tagName === 'TH') {
          celdaCopia.style.backgroundColor = "#002855";
          celdaCopia.style.color = "#ffffff";
          celdaCopia.style.fontWeight = "bold";
        } else {
          celdaCopia.style.backgroundColor = "#ffffff";
          celdaCopia.style.color = "#000000";
        }
        celdaCopia.style.fontSize = "9pt"; 
        celdaCopia.style.fontFamily = "Arial, sans-serif";
        celdaCopia.style.border = "0.5pt solid #002855";
        celdaCopia.style.padding = "4pt"; 
        celdaCopia.style.width = "auto";
        celdaCopia.style.whiteSpace = "normal";
        celdaCopia.style.msoElement = "para-border-div";
        celdaCopia.setAttribute('contenteditable', 'true');
      });

      clon.style.width = "100%";
      clon.style.borderCollapse = "collapse";
      clon.style.tableLayout = "auto";

      const htmlFinal = `
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page { size: A4 portrait; margin: 1cm; }
            table { width: 100%; border-collapse: collapse; }
            tr { mso-shading: windowtext; } 
          </style>
        </head>
        <body>
          ${clon.outerHTML}
        </body>
        </html>
      `;

      const blobHtml = new Blob([htmlFinal], { type: 'text/html' });
      const data = [new ClipboardItem({ 'text/html': blobHtml })];
      await navigator.clipboard.write(data);
      alert("✅ ¡Copiado con colores y formato ajustable!");
    } catch (err) {
      console.error("Error al copiar:", err);
      alert("Error al copiar.");
    }
  };

  const generarConAPI = async () => {
  const camposObligatorios = [
    'nombre', 'apellido', 'edad', 'seccion', 'municipio', 'departamento',
    'duracion', 'nivel', 'materia', 'nombreUnidad', 'numUnidad', 'tema', 'grado', 
    'dificultad', 'centroEscolar', 'fecha'
  ];

  // 1. Verificamos que no haya vacíos
  const vacios = camposObligatorios.filter(campo => !formData[campo] || formData[campo].trim() === '');
  
  if (vacios.length > 0) {
    alert(`Por favor, completa todos los campos obligatorios.`);
    return;
  }

  setLoading(true);
  try {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

    // 2. REPARACIÓN CRÍTICA: 
    // Creamos una copia de seguridad para que el Backend reciba texto real
    // y no los nombres de los placeholders (como "Grado" o "Edad")
    const datosParaEnviar = { ...formData };
    
    // Si el valor es igual al placeholder, lo enviamos vacío para que el backend lo detecte
    if (datosParaEnviar.grado === 'Grado') datosParaEnviar.grado = '';
    if (datosParaEnviar.dificultad === 'Nivel de dificultad') datosParaEnviar.dificultad = '';
    if (datosParaEnviar.edad === 'Edad') datosParaEnviar.edad = '';

    const response = await fetch(`${baseUrl}/api/generar-plan-completa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...datosParaEnviar, userId, planActual: resultado }),
    });

    if (!response.ok) {
      // Si el servidor responde con 400 o 500, capturamos el error
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error en la respuesta del servidor');
    }

    const data = await response.json();
    setResultado(data);
  } catch (error) {
    console.error("Error al generar:", error);
    alert(`Error: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const guardarPlanificacion = async () => {
    if (!resultado) {
      alert("Primero debes generar una planificación.");
      return;
    }
    setSaving(true);
    try {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const datosParaGuardar = {
        ...formData,
        userId, 
        tema: (formData.tema || formData.nombreUnidad || "Sin Título").trim(),
        nombreUnidad: (formData.nombreUnidad || formData.tema || "Sin Unidad").trim(),
        objetivos: resultado.objetivos,
        indicadores: resultado.indicadoresLogro || resultado.indicadoresEvaluacion,
        indicadoresLogro: resultado.indicadoresLogro,
        indicadoresEvaluacion: resultado.indicadoresEvaluacion,
        materiales: resultado.materiales,
        tiempos: resultado.tiempos,
        actividadesComplementarias: resultado.actividadesComplementarias
      };

      const response = await fetch(`${baseUrl}/api/save-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosParaGuardar),
      });

      if (response.ok) {
        alert("✅ ¡Sincronizado! Ahora puedes usar esta planificación en el Módulo de Recursos.");
      } else {
        throw new Error("Error al guardar");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("❌ Error de conexión al guardar.");
    } finally {
      setSaving(false);
    }
  };

const exportarAGestion = async () => {
  if (!resultado) {
    alert("Primero debes generar una planificación.");
    return;
  }
  setSaving(true);

  try {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    
    const actividadesEstructuradas = (resultado.tiempos || []).slice(0, 8).map(t => ({
      inicio: t.inicio || '',
      desarrollo: t.desarrollo || '',
      cierre: t.cierre || ''
    }));

    const datosGestion = {
      ...formData,
      userId, 
      idActualizar: planId || null, 
      tipo: 'Planificación',
      objetivos: resultado.objetivos,
      indicadoresLogro: resultado.indicadoresLogro,
      indicadoresEvaluacion: resultado.indicadoresEvaluacion,
      actividadesComplementarias: resultado.actividadesComplementarias,
      tiempos: actividadesEstructuradas, 
      actividades: actividadesEstructuradas, 
      materiales: (resultado.materiales || []).slice(0, 8),
      listaMateriales: (resultado.materiales || []).slice(0, 8),
      inicios: actividadesEstructuradas.map(a => a.inicio),
      desarrollos: actividadesEstructuradas.map(a => a.desarrollo),
      cierres: actividadesEstructuradas.map(a => a.cierre),
      fechaExportacion: new Date()
    };

    const response = await fetch(`${baseUrl}/api/exportar-gestion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosGestion),
    });

    if (response.ok) {
      alert("✅ ¡Guardado con éxito! Los cambios ya están en Gestión.");
      setPlanId(null);
    } else {
      throw new Error("Respuesta no exitosa");
    }
  } catch (error) {
    console.error("Error detallado:", error);
    alert("❌ No se pudo guardar. Revisa que el servidor esté encendido.");
  } finally {
    setSaving(false);
  }
};

  const limpiarFormulario = () => {
    setFormData(estadoInicial);
    setResultado(null);
    setOpenDropdown(null);
    setHighlightedIndex(-1);
    setPlanId(null);
  };

  const getMunisDisponibles = () => {
    if (!formData.departamento || formData.departamento === 'Departamento') {
      return ['Municipio (Selecciona Depto.)'];
    }
    return ['Municipio', ...municipiosPorDepto[formData.departamento]];
  };

  const seleccionarOpcion = (campo, valor, cerrar = true) => {
    const valorLimpio = valor.includes('años') ? valor.replace(' años', '') : valor;
    const esPlaceholder = ['Edad', 'Seccion', 'Departamento', 'Nivel educativo', 'n° unidad', 'Grado', 'Nivel de dificultad', 'Duracion semanal', 'Municipio'].some(p => valor === p) || valor.includes('Municipio (Selecciona');
    const finalValue = esPlaceholder ? '' : valorLimpio;
    
    setFormData(prev => {
      const nuevoEstado = { ...prev, [campo]: finalValue };
      if (campo === 'departamento') nuevoEstado.municipio = '';
      return nuevoEstado;
    });
    
    if (cerrar) {
      setOpenDropdown(null);
      setHighlightedIndex(-1);
    }
  };

  const manejarTeclado = (e, campo, lista) => {
    const valorActual = formData[campo] || lista[0];
    let displayValue = valorActual;
    if (campo === 'edad' && formData[campo]) displayValue = `${formData[campo]} años`;
    if (campo === 'duracion' && formData[campo]) {
        displayValue = formData[campo].includes('hora') ? formData[campo] : `${formData[campo]} ${formData[campo] === '1' ? 'hora' : 'horas'}`;
    }
    const currentIndex = lista.indexOf(displayValue);

    if (openDropdown !== campo) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(currentIndex + 1, lista.length - 1);
        seleccionarOpcion(campo, lista[next], false);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(currentIndex - 1, 0);
        seleccionarOpcion(campo, lista[prev], false);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpenDropdown(campo);
        setHighlightedIndex(currentIndex === -1 ? 0 : currentIndex);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, lista.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex !== -1) seleccionarOpcion(campo, lista[highlightedIndex], true);
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpenDropdown(null);
    }
  };

  useEffect(() => {
    const clickFuera = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', clickFuera);
    return () => document.removeEventListener('mousedown', clickFuera);
  }, []);

  const RenderDropdown = (campo, lista, placeholder) => {
    const isOpen = openDropdown === campo;
    let display = formData[campo] ? formData[campo] : placeholder;
    if (formData[campo]) {
        if (campo === 'edad') display = `${formData[campo]} años`;
        if (campo === 'duracion' && !formData[campo].includes('hora')) {
            display = `${formData[campo]} ${formData[campo] === '1' ? 'hora' : 'horas'}`;
        }
    }

    return (
      <div className={`custom-dropdown ${isOpen ? 'is-open' : ''}`} tabIndex="0" onKeyDown={(e) => manejarTeclado(e, campo, lista)}>
        <div className="dropdown-header" onClick={() => setOpenDropdown(isOpen ? null : campo)}>
          <span>{display}</span>
          <span className="icon-v">▼</span>
        </div>
        {isOpen && (
          <ul className="dropdown-list">
            {lista.map((opcion, index) => (
              <li key={opcion} className={highlightedIndex === index ? 'highlighted' : ''} onClick={() => seleccionarOpcion(campo, opcion)} onMouseEnter={() => setHighlightedIndex(index)}>
                {opcion}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className={`main-content ${darkMode ? 'dark' : 'light'}`}>
      <div className="form-container" ref={dropdownRef}>
        <h1 className="main-title">Generador de planificaciones</h1>
        <section className="form-section">
          <h2>Datos generales</h2>
          <div className="input-grid">
            <input placeholder="Nombre" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
            <input placeholder="Apellido" value={formData.apellido} onChange={(e) => setFormData({...formData, apellido: e.target.value})} />
            {RenderDropdown('edad', listaEdades, 'Edad')}
            {RenderDropdown('seccion', listaSecciones, 'Seccion')}
            {RenderDropdown('departamento', listaDeptos, 'Departamento')}
            {RenderDropdown('municipio', getMunisDisponibles(), 'Municipio')}
            <input placeholder="Celular" value={formData.celular} onChange={(e) => setFormData({...formData, celular: e.target.value})} />
            {RenderDropdown('duracion', listaDuracion, 'Duracion semanal')}
            {RenderDropdown('nivel', listaNivelEducativo, 'Nivel educativo')}
          </div>
        </section>
        <section className="form-section">
          <h2>Datos específicos</h2>
          <div className="input-grid">
            <input placeholder="Materia" value={formData.materia} onChange={(e) => setFormData({...formData, materia: e.target.value})} />
            <input placeholder="Nombre unidad" value={formData.nombreUnidad} onChange={(e) => setFormData({...formData, nombreUnidad: e.target.value})} />
            {RenderDropdown('numUnidad', listaUnidades, 'n° unidad')}
            <input placeholder="Tema" value={formData.tema} onChange={(e) => setFormData({...formData, tema: e.target.value})} />
            {RenderDropdown('grado', listaGrados, 'Grado')}
            {RenderDropdown('dificultad', listaDificultad, 'Nivel de dificultad')}
          </div>
        </section>

        <div className="full-width-input-container">
          <input className="full-width-input1" placeholder="Centro escolar" value={formData.centroEscolar} onChange={(e) => setFormData({...formData, centroEscolar: e.target.value})} />
          <input className="full-width-input2" type="date" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} />
        </div>

        <textarea
          className="objetivos-area"
          placeholder="Escriba los cambios que desea realizar a su planificacion, (por ejemplo, agregar 4 indicadores de logro en lugar de 3)"
          value={formData.sugerencias}
          onChange={(e) => setFormData({...formData, sugerencias: e.target.value})}
        ></textarea>

        <div className="button-group">
          <button className="btn-primary" onClick={generarConAPI} disabled={loading}>
            {loading ? "Generando..." : resultado ? "Guardar cambios " : "Generar planificacion"}
          </button>
          
          {resultado && (
            <>
              <button 
                className="btn-primary" 
                onClick={guardarPlanificacion} 
                disabled={saving}
                style={{ backgroundColor: ' #003366', marginLeft: '10px' }}
              >
                {saving ? "Guardando..." : "Exportar a recursos"}
              </button>

              <button 
                className="btn-primary" 
                onClick={exportarAGestion} 
                disabled={saving}
                style={{ backgroundColor: ' #003366', marginLeft: '10px' }}
              >
                {saving ? "Exportando..." : "Exportar a gestión"}
              </button>

              <button 
                className="btn-primary" 
                onClick={copiarPlanificacion}
                style={{ backgroundColor: ' #003366', marginLeft: '10px' }}
              >
                Copiar planificación
              </button>
            </>
          )}

          <button className="btn-secondary" onClick={moverAPapelera}>Limpiar campos</button>
        </div>

        {resultado && (
          <div className="table-wrapper">
            <table className="planning-table">
              <thead>
                <tr><th colSpan="9" className="header-blue">Planificación Generada</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="2" className="label-blue">Docente:</td>
                  <td colSpan="3" className="white-cell">{formData.nombre} {formData.apellido}</td>
                  <td className="label-blue">Grado:</td>
                  <td colSpan="1" className="white-cell">{formData.grado}</td>
                   <td className="label-blue">Seccion:</td>
                  <td colSpan="1" className="white-cell">{formData.seccion}</td>
                </tr>
                <tr>
                  <td colSpan="2" className="label-blue">municipio:</td>
                  <td colSpan="2" className="white-cell">{formData.municipio}</td>
                  <td colSpan="3" className="label-blue">Departamento:</td>
                  <td colSpan="2" className="white-cell">{formData.departamento}</td>
                </tr>
                <tr>
                  <td colSpan="2" className="label-blue">Nivel educativo:</td>
                  <td colSpan="1" className="white-cell">{formData.nivel}</td>
                  <td colSpan="2" className="label-blue">Centro escolar:</td>
                  <td colSpan="2" className="white-cell">{formData.centroEscolar}</td>
                  <td colSpan="1" className="label-blue">Materia:</td>
                  <td colSpan="1" className="white-cell">{formData.materia}</td>
                </tr>
                <tr><td colSpan="9" className="label-blue">Datos específicos</td></tr>
                <tr>
                  <td colSpan="2" className="label-blue">Nombre de la unidad:</td>
                  <td colSpan="3" className="white-cell">{formData.nombreUnidad}</td>
                  <td colSpan="1" className="label-blue">nº de Unidad:</td>
                  <td colSpan="1" className="white-cell">{formData.numUnidad}</td>
                  <td colSpan="1" className="label-blue">fecha:</td>
                  <td colSpan="1" className="white-cell">{formData.fecha}</td>
                </tr>
                <tr>
                  <td colSpan="2" className="label-blue">Duracion semanal:</td>
                  <td colSpan="1" className="white-cell">{formData.duracion}</td>
                  <td colSpan="2" className="label-blue">Nivel de dificultad:</td>
                  <td colSpan="1" className="white-cell">{formData.dificultad}</td>
                  <td colSpan="1" className="label-blue">Tema:</td>
                  <td colSpan="2" className="white-cell">{formData.tema}</td>
                </tr>
                <tr>
                  <td colSpan="2" className="label-blue">Indicadores de logro:</td>
                  <td colSpan="7" className="white-cell" style={{ whiteSpace: 'pre-line' }}>{resultado.indicadoresLogro}</td>
                </tr>
                <tr>
                  <td colSpan="2" className="label-blue">Objetivos:</td>
                  <td colSpan="7" className="white-cell" style={{ whiteSpace: 'pre-line' }}>{resultado.objetivos}</td>
                </tr>
                <tr>
                  <td colSpan="1" className="label-blue">nº activdad:</td>
                  {resultado.materiales?.slice(0, 8).map((_, i) => (
                    <td key={`h-${i}`} className="label-blue">Actividad {i + 1}</td>
                  ))}
                </tr>
                <tr>
                  <td className="label-blue">Materiales:</td>
                  {resultado.materiales?.slice(0, 8).map((m, i) => (
                    <td key={`m-${i}`} className="white-cell" style={{ whiteSpace: 'pre-line' }}>{m}</td>
                  ))}
                </tr>
                <tr><th colSpan="9" className="header-blue">Momentos de la Clase</th></tr>
                <tr>
                  <td className="label-blue">Tiempo para actividades</td>
                  {resultado.tiempos?.slice(0, 8).map((_, i) => (
                    <td key={`head-${i}`} className="white-cell">Actividad {i + 1}</td>
                  ))}
                </tr>
                <tr>
                  <td className="label-blue">Inicio</td>
                  {resultado.tiempos?.slice(0, 8).map((t, i) => (
                    <td key={`inicio-${i}`} className="white-cell"><strong>Inicio: </strong> {t.inicio}</td>
                  ))}
                </tr>
                <tr>
                  <td className="label-blue">desarrollo</td>
                  {resultado.tiempos?.slice(0, 8).map((t, i) => (
                    <td key={`desarrollo-${i}`} className="white-cell"><strong>Desarrollo: </strong> {t.desarrollo}</td>
                  ))}
                </tr>
                <tr>
                  <td className="label-blue">Cierre</td>
                  {resultado.tiempos?.slice(0, 8).map((t, i) => (
                    <td key={`cierre-${i}`} className="white-cell"><strong>Cierre: </strong> {t.cierre}</td>
                  ))}
                </tr>
                <tr>
                  <td colSpan="2" className="label-blue">Indicadores de evaluacion:</td>
                  <td colSpan="7" className="white-cell" style={{ whiteSpace: 'pre-line' }}>{resultado.indicadoresEvaluacion}</td>
                </tr>
                <tr>
                  <td colSpan="2" className="label-blue">Actividades complementarias:</td>
                  <td colSpan="7" className="white-cell" style={{ whiteSpace: 'pre-line' }}>{resultado.actividadesComplementarias}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Planificaciones;