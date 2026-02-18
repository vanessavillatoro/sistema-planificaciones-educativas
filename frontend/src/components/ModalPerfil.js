import React, { useState, useRef } from 'react';
import './ModalPerfil.css';
import fotoPerfilDefault from './perfil.png'; 

const ModalPerfil = ({ onClose, onSave, darkMode, datosUsuario }) => {
  
  // --- CONFIGURACIÓN DE URL DINÁMICA ---
  // Detectamos si estamos en producción (Vercel) o localmente
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://sistema-planificaciones-educativas.vercel.app';

  const [perfil, setPerfil] = useState({
    nombre: datosUsuario.nombre,
    correo: datosUsuario.correo,
    celular: datosUsuario.celular,
    municipio: datosUsuario.municipio,
    departamento: datosUsuario.departamento,
    direccion: datosUsuario.direccion,
    fotoUrl: datosUsuario.fotoUrl 
  });

  const [editando, setEditando] = useState(null);
  const inputRefs = useRef({});
  const fileInputRef = useRef(null); 

  // --- FUNCIÓN PARA ASEGURAR URL VÁLIDA (CORREGIDA PARA VERCEL) ---
  const formatearUrlImagen = (url) => {
    if (!url) return fotoPerfilDefault;
    if (url.startsWith('http')) return url;
    
    // Usamos la API_BASE_URL en lugar de localhost fijo
    const base = `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    return `${base}${base.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
  };

  const handleChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleFotoClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('foto', file);
    const userId = localStorage.getItem('userId');
    formData.append('userId', userId);

    try {
      // CAMBIO: Usamos la URL dinámica aquí también
      const response = await fetch(`${API_BASE_URL}/api/usuario/foto`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const dataActualizada = await response.json();
        setPerfil({ ...perfil, fotoUrl: dataActualizada.fotoUrl });
        alert("Foto actualizada correctamente");
      } else {
        alert("Error al subir la imagen al servidor");
      }
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };

  const habilitarEdicion = (campo) => {
    setEditando(campo);
    setTimeout(() => {
      inputRefs.current[campo]?.focus();
    }, 10);
  };

  const handleGuardar = () => {
    if (onSave) {
      onSave(perfil); 
    }
    onClose(); 
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
          <input 
            type="file" 
            ref={fileInputRef} 
            className="file-input-hidden"
            style={{ display: 'none' }} 
            accept="image/*" 
            onChange={handleFileChange} 
          />
          
          <div className="profile-img-container" onClick={handleFotoClick}>
            <img 
              src={formatearUrlImagen(perfil.fotoUrl)} 
              alt="User" 
              className="modal-avatar" 
              key={perfil.fotoUrl}
            />
            <div className="edit-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </div>
          </div>

          <div className="header-text">
            <h3>{perfil.nombre}</h3>
            <p>{perfil.correo}</p>
          </div>
        </div>

        <hr className="modal-divider" />

        <div className="modal-perfil-body">
          {campos.map((item) => (
            <div className={`input-group ${editando === item.name ? 'is-editing' : ''}`} key={item.name}>
              <div className="label-section">
                <div className="btn-edit-small" onClick={() => habilitarEdicion(item.name)}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </div>
                <label>{item.label}</label>
              </div>
              <input 
                ref={(el) => (inputRefs.current[item.name] = el)}
                type="text" 
                name={item.name} 
                value={perfil[item.name] || ''} 
                onChange={handleChange} 
                readOnly={editando !== item.name}
                onBlur={() => setEditando(null)}
              />
            </div>
          ))}
        </div>

        <button className="save-btn" onClick={handleGuardar}>Save Changes</button>
      </div>
    </div>
  );
};

export default ModalPerfil;