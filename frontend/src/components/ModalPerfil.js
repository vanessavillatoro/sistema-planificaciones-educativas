import React, { useState, useRef, useEffect } from 'react'; // Se agregó useEffect
import './ModalPerfil.css';
import fotoPerfilDefault from './perfil.png'; 

const ModalPerfil = ({ onClose, onSave, darkMode, datosUsuario }) => {
  
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://sistema-planificaciones-educativas.vercel.app';

  // Inicializamos el estado con los datos recibidos
  const [perfil, setPerfil] = useState({
    nombre: datosUsuario?.nombre || datosUsuario?.name || '',
    correo: datosUsuario?.correo || datosUsuario?.email || '',
    celular: datosUsuario?.celular || '',
    municipio: datosUsuario?.municipio || '',
    departamento: datosUsuario?.departamento || '',
    direccion: datosUsuario?.direccion || '',
    fotoUrl: datosUsuario?.fotoUrl || ''
  });

  // --- NUEVO: Sincronizar si datosUsuario cambia mientras el modal está abierto ---
  useEffect(() => {
    if (datosUsuario) {
      setPerfil({
        nombre: datosUsuario.nombre || datosUsuario.name || '',
        correo: datosUsuario.correo || datosUsuario.email || '',
        celular: datosUsuario.celular || '',
        municipio: datosUsuario.municipio || '',
        departamento: datosUsuario.departamento || '',
        direccion: datosUsuario.direccion || '',
        fotoUrl: datosUsuario.fotoUrl || ''
      });
    }
  }, [datosUsuario]);

  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
  
  const inputRefs = useRef({});
  const fileInputRef = useRef(null); 

  const formatearUrlImagen = (url) => {
    if (!url) return fotoPerfilDefault;
    if (url.startsWith('http')) return url;
    const base = `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    return `${base}${base.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
  };

  const handleChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleFotoClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);
    formData.append('userId', localStorage.getItem('userId'));

    try {
      const response = await fetch(`${API_BASE_URL}/api/usuario/foto`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const dataActualizada = await response.json();
        setPerfil({ ...perfil, fotoUrl: dataActualizada.fotoUrl });
        alert("Foto actualizada correctamente");
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
    }
  };

  const habilitarEdicion = (campo) => {
    setEditando(campo);
    setTimeout(() => {
      inputRefs.current[campo]?.focus();
    }, 100);
  };

  const handleGuardarDatos = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert("Sesión expirada. Inicia sesión de nuevo.");
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuario/perfil`, {
        method: 'PATCH',
        mode: 'cors', // Agregado para asegurar conexión entre URLs
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          name: perfil.nombre,   // Mapeo corregido para el Backend
          email: perfil.correo,  // Mapeo corregido para el Backend
          celular: perfil.celular,
          municipio: perfil.municipio,
          departamento: perfil.departamento,
          direccion: perfil.direccion,
          fotoUrl: perfil.fotoUrl
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // --- ACTUALIZACIÓN DE TODOS LOS CAMPOS EN STORAGE ---
        localStorage.setItem('userName', data.name || perfil.nombre);
        localStorage.setItem('userEmail', data.email || perfil.correo);
        localStorage.setItem('userCelular', data.celular || perfil.celular);
        localStorage.setItem('userMunicipio', data.municipio || perfil.municipio);
        localStorage.setItem('userDepartamento', data.departamento || perfil.departamento);
        localStorage.setItem('userDireccion', data.direccion || perfil.direccion);
        if(data.fotoUrl) localStorage.setItem('userFoto', data.fotoUrl);
        
        // Notificamos al resto de la página
        window.dispatchEvent(new CustomEvent('perfilActualizado', { 
            detail: { ...perfil, ...data } 
        }));
        window.dispatchEvent(new Event('storage')); 
        
        alert("¡Datos guardados con éxito!");

        if (onSave) onSave(data);
        onClose();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Error al procesar los datos en el servidor.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor. Revisa tu internet.");
    } finally {
      setCargando(false);
    }
  };

  const campos = [
    { label: 'Nombre', name: 'nombre' },
    { label: 'Correo', name: 'correo' },
    { label: 'Celular', name: 'celular' },
    { label: 'Municipio', name: 'municipio' },
    { label: 'Departamento', name: 'departamento' },
    { label: 'Direccion', name: 'direccion' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${darkMode ? 'dark' : 'light'}`} onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>×</button>

        <div className="modal-header">
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
          <div className="profile-img-container" onClick={handleFotoClick}>
            <img src={formatearUrlImagen(perfil.fotoUrl)} alt="User" className="modal-avatar" />
            <div className="edit-badge">✎</div>
          </div>
          <div className="header-text">
            <h3>{perfil.nombre || 'Usuario'}</h3>
            <p>{perfil.correo}</p>
          </div>
        </div>

        <div className="modal-perfil-body">
          {campos.map((item) => (
            <div className={`input-group ${editando === item.name ? 'is-editing' : ''}`} key={item.name}>
              <div className="label-section">
                <button className="btn-edit-small" onClick={() => habilitarEdicion(item.name)}>
                  ✎
                </button>
                <label>{item.label}</label>
              </div>
              <input 
                ref={(el) => (inputRefs.current[item.name] = el)}
                type="text" 
                name={item.name} 
                value={perfil[item.name] || ''} 
                onChange={handleChange} 
                readOnly={editando !== item.name || item.name === 'correo'} 
                onBlur={() => setEditando(null)}
              />
            </div>
          ))}
        </div>

        <button className="save-btn" onClick={handleGuardarDatos} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};

export default ModalPerfil;