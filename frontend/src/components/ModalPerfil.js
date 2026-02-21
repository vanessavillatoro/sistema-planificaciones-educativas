import React, { useState, useRef, useEffect } from 'react';
import './ModalPerfil.css';
import fotoPerfilDefault from './perfil.png'; 

const ModalPerfil = ({ onClose, onSave, darkMode }) => {
  
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://sistema-planificaciones-educativas.vercel.app';

  const [perfil, setPerfil] = useState({
    userName: localStorage.getItem('userName') || '',
    userEmail: localStorage.getItem('userEmail') || '',
    userCelular: localStorage.getItem('userCelular') || '',
    userMunicipio: localStorage.getItem('userMunicipio') || '',
    userDepartamento: localStorage.getItem('userDepartamento') || '',
    userDireccion: localStorage.getItem('userDireccion') || '',
    userFoto: localStorage.getItem('userFoto') || localStorage.getItem('fotoUrl') || ''
  });

  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
  // --- NUEVO: Estado para forzar la recarga de la imagen ---
  const [version, setVersion] = useState(Date.now()); 
  
  const inputRefs = useRef({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    const cargarDatos = () => {
      setPerfil({
        userName: localStorage.getItem('userName') || '',
        userEmail: localStorage.getItem('userEmail') || '',
        userCelular: localStorage.getItem('userCelular') || '',
        userMunicipio: localStorage.getItem('userMunicipio') || '',
        userDepartamento: localStorage.getItem('userDepartamento') || '',
        userDireccion: localStorage.getItem('userDireccion') || '',
        userFoto: localStorage.getItem('userFoto') || localStorage.getItem('fotoUrl') || ''
      });
    };
    window.addEventListener('storage', cargarDatos);
    return () => window.removeEventListener('storage', cargarDatos);
  }, []);

  const handleChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Vista previa inmediata con blob
    const previewUrl = URL.createObjectURL(file);
    setPerfil(prev => ({ ...prev, userFoto: previewUrl }));

    const userId = localStorage.getItem('userId');
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('foto', file); 

    setCargando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuario/perfil`, {
        method: 'PATCH',
        body: formData, 
      });

      const data = await response.json();

      if (response.ok) {
        const nuevaUrl = data.userFoto;
        localStorage.setItem('userFoto', nuevaUrl);
        
        // --- ACTUALIZACIÓN CRÍTICA: Cambiamos perfil y versión ---
        setPerfil(prev => ({ ...prev, userFoto: nuevaUrl }));
        setVersion(Date.now()); 
        
        alert("Foto actualizada correctamente");
        if (onSave) onSave(data);
      } else {
        throw new Error("Error en la respuesta del servidor");
      }
    } catch (error) {
      alert("Error al subir la foto al servidor");
      setPerfil(prev => ({ ...prev, userFoto: localStorage.getItem('userFoto') || '' }));
    } finally {
      setCargando(false);
    }
  };

  const handleGuardarDatos = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return alert("Sesión expirada");

    setCargando(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/usuario/perfil`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          nombre: perfil.userName,
          celular: perfil.userCelular,
          municipio: perfil.userMunicipio,
          departamento: perfil.userDepartamento,
          direccion: perfil.userDireccion
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userName', perfil.userName);
        localStorage.setItem('userCelular', perfil.userCelular);
        localStorage.setItem('userMunicipio', perfil.userMunicipio);
        localStorage.setItem('userDepartamento', perfil.userDepartamento);
        localStorage.setItem('userDireccion', perfil.userDireccion);
        
        alert("¡Datos guardados con éxito!");
        if (onSave) onSave(data);
        onClose();
      }
    } catch (error) {
      alert("Error al guardar los datos");
    } finally {
      setCargando(false);
    }
  };

  const campos = [
    { label: 'Nombre', name: 'userName' },
    { label: 'Correo', name: 'userEmail', noEditable: true },
    { label: 'Celular', name: 'userCelular' },
    { label: 'Municipio', name: 'userMunicipio' },
    { label: 'Departamento', name: 'userDepartamento' },
    { label: 'Direccion', name: 'userDireccion' }
  ];

  // --- FUNCIÓN ACTUALIZADA: Con Cache Busting ---
  const getFotoUrl = () => {
    if (!perfil.userFoto) return fotoPerfilDefault;
    
    let urlBase = "";
    if (perfil.userFoto.startsWith('blob:') || perfil.userFoto.startsWith('http')) {
      urlBase = perfil.userFoto;
    } else {
      urlBase = `${API_BASE_URL}${perfil.userFoto}`;
    }

    // Añadimos el parámetro v= para forzar al navegador a recargar la imagen real
    return `${urlBase}${urlBase.includes('?') ? '&' : '?'}v=${version}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${darkMode ? 'dark' : 'light'}`} onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <div className="avatar-container" onClick={() => !cargando && fileInputRef.current.click()}>
            <img 
              src={getFotoUrl()} 
              alt="Perfil" 
              className={`modal-avatar ${cargando ? 'img-loading' : ''}`}
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = fotoPerfilDefault;
              }}
            />
            <div className="avatar-overlay">
              <span>{cargando ? '...' : '✎'}</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleFotoChange} 
            />
          </div>
          <div className="header-text">
            <h3>{perfil.userName || 'Usuario'}</h3>
          </div>
        </div>

        <div className="modal-perfil-body">
          {campos.map((item) => (
            <div className={`input-group ${item.noEditable ? 'field-disabled' : ''}`} key={item.name}>
              <div className="label-section">
                {!item.noEditable && (
                  <button 
                    className="btn-edit-small" 
                    onClick={() => {
                      setEditando(item.name);
                      setTimeout(() => inputRefs.current[item.name]?.focus(), 100);
                    }}
                  >✎</button>
                )}
                <label>{item.label}</label>
              </div>
              <input 
                ref={(el) => (inputRefs.current[item.name] = el)}
                type="text" 
                name={item.name} 
                value={perfil[item.name] || ''} 
                onChange={handleChange} 
                readOnly={editando !== item.name || item.noEditable}
                onBlur={() => setEditando(null)}
              />
            </div>
          ))}
        </div>

        <button className="save-btn" onClick={handleGuardarDatos} disabled={cargando}>
          {cargando ? 'Procesando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};

export default ModalPerfil;