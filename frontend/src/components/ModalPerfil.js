import React, { useState, useRef, useEffect } from 'react';
import './ModalPerfil.css';
import fotoPerfilDefault from './perfil.png'; 

const ModalPerfil = ({ onClose, onSave, darkMode, datosUsuario }) => {
  
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://sistema-planificaciones-educativas.vercel.app';

  const [perfil, setPerfil] = useState({
    nombre: datosUsuario?.nombre || datosUsuario?.name || localStorage.getItem('userName') || '',
    correo: datosUsuario?.correo || datosUsuario?.email || localStorage.getItem('userEmail') || '',
    celular: datosUsuario?.celular || localStorage.getItem('userCelular') || '',
    municipio: datosUsuario?.municipio || localStorage.getItem('userMunicipio') || '',
    departamento: datosUsuario?.departamento || localStorage.getItem('userDepartamento') || '',
    direccion: datosUsuario?.direccion || localStorage.getItem('userDireccion') || '',
    fotoUrl: datosUsuario?.fotoUrl || localStorage.getItem('userFoto') || ''
  });

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
        localStorage.setItem('userFoto', dataActualizada.fotoUrl);
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
    if (!userId || userId === "undefined") {
      alert("Sesión no válida. Por favor, cierra sesión e ingresa de nuevo.");
      return;
    }

    setCargando(true);
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      
      // MAPEO CORRECTO PARA EL SERVIDOR
      formData.append('name', perfil.nombre); 
      formData.append('email', perfil.correo);
      
      // Solo enviar si tienen contenido para evitar errores de validación
      if (perfil.celular) formData.append('celular', perfil.celular);
      if (perfil.municipio) formData.append('municipio', perfil.municipio);
      if (perfil.departamento) formData.append('departamento', perfil.departamento);
      if (perfil.direccion) formData.append('direccion', perfil.direccion);

      const response = await fetch(`${API_BASE_URL}/api/usuario/perfil`, {
        method: 'PATCH',
        body: formData, // Enviamos como FormData
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar localStorage con los nombres de campos que devuelve el servidor
        localStorage.setItem('userName', data.name || perfil.nombre);
        localStorage.setItem('userEmail', data.email || perfil.correo);
        localStorage.setItem('userCelular', data.celular || '');
        localStorage.setItem('userMunicipio', data.municipio || '');
        localStorage.setItem('userDepartamento', data.departamento || '');
        localStorage.setItem('userDireccion', data.direccion || '');
        if (data.fotoUrl) localStorage.setItem('userFoto', data.fotoUrl);
        
        // Disparar eventos para actualizar la interfaz global
        window.dispatchEvent(new CustomEvent('perfilActualizado', { 
            detail: data 
        }));
        window.dispatchEvent(new Event('storage')); 
        
        alert("¡Perfil actualizado con éxito!");

        if (onSave) onSave(data);
        onClose();
      } else {
        alert(data.error || "Error al guardar los datos.");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("Error de conexión con el servidor.");
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
    { label: 'Dirección', name: 'direccion' }
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