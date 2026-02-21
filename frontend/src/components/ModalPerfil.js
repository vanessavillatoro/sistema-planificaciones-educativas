import React, { useState, useRef, useEffect } from 'react';
import './ModalPerfil.css';
import fotoPerfilDefault from './perfil.png'; 

const ModalPerfil = ({ onClose, onSave, darkMode, datosUsuario }) => {
  
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://sistema-planificaciones-educativas.vercel.app';

  // 1. Mapeo inteligente al cargar para que los inputs NUNCA nazcan vacíos
  const [perfil, setPerfil] = useState({
    nombre: datosUsuario?.userName || datosUsuario?.name || datosUsuario?.nombre || '',
    correo: datosUsuario?.userEmail || datosUsuario?.email || datosUsuario?.correo || '',
    celular: datosUsuario?.userCelular || datosUsuario?.celular || '',
    municipio: datosUsuario?.userMunicipio || datosUsuario?.municipio || '',
    departamento: datosUsuario?.userDepartamento || datosUsuario?.departamento || '',
    direccion: datosUsuario?.userDireccion || datosUsuario?.direccion || '',
    fotoUrl: datosUsuario?.fotoUrl || ''
  });

  useEffect(() => {
    if (datosUsuario) {
      setPerfil({
        nombre: datosUsuario.userName || datosUsuario.name || datosUsuario.nombre || '',
        correo: datosUsuario.userEmail || datosUsuario.email || datosUsuario.correo || '',
        celular: datosUsuario.userCelular || datosUsuario.celular || '',
        municipio: datosUsuario.userMunicipio || datosUsuario.municipio || '',
        departamento: datosUsuario.userDepartamento || datosUsuario.departamento || '',
        direccion: datosUsuario.userDireccion || datosUsuario.direccion || '',
        fotoUrl: datosUsuario.fotoUrl || ''
      });
    }
  }, [datosUsuario]);

  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
  const inputRefs = useRef({});
  const fileInputRef = useRef(null); 

  const handleChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  const handleGuardarDatos = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert("Sesión expirada.");
      return;
    }

    setCargando(true);
    try {
      // 2. LIMPIEZA TOTAL: Enviamos lo que el servidor espera exactamente
      const payload = {
        userId,
        nombre: perfil.nombre, // El server.js lo convertirá a 'name'
        celular: perfil.celular,
        municipio: perfil.municipio,
        departamento: perfil.departamento,
        direccion: perfil.direccion,
        fotoUrl: perfil.fotoUrl
      };

      const response = await fetch(`${API_BASE_URL}/api/usuario/perfil`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. ACTUALIZACIÓN DE STORAGE CON PREFIJOS (Como lo tienes en tu App)
        localStorage.setItem('userName', data.userName || perfil.nombre);
        localStorage.setItem('userCelular', data.celular || perfil.celular);
        localStorage.setItem('userMunicipio', data.municipio || perfil.municipio);
        localStorage.setItem('userDepartamento', data.departamento || perfil.departamento);
        localStorage.setItem('userDireccion', data.direccion || perfil.direccion);
        if(data.fotoUrl) localStorage.setItem('fotoUrl', data.fotoUrl);
        
        // Notificar cambios
        window.dispatchEvent(new Event('storage')); 
        
        // 4. ÉXITO SEGURO: Cerramos el modal ANTES de cualquier otra lógica que pueda fallar
        alert("¡Datos guardados con éxito!");
        if (onSave) onSave(data);
        onClose();
      } else {
        alert(data.error || "Error en el servidor");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de conexión");
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

  const formatearUrlImagen = (url) => {
    if (!url) return fotoPerfilDefault;
    if (url.startsWith('http')) return url;
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${darkMode ? 'dark' : 'light'}`} onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>×</button>
        <div className="modal-header">
          <div className="profile-img-container" onClick={() => fileInputRef.current.click()}>
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
                <button className="btn-edit-small" onClick={() => { setEditando(item.name); setTimeout(() => inputRefs.current[item.name]?.focus(), 50); }}>✎</button>
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
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={async (e) => {
             const file = e.target.files[0];
             if (!file) return;
             const formData = new FormData();
             formData.append('foto', file);
             formData.append('userId', localStorage.getItem('userId'));
             const res = await fetch(`${API_BASE_URL}/api/usuario/foto`, { method: 'POST', body: formData });
             if (res.ok) {
               const d = await res.json();
               setPerfil({...perfil, fotoUrl: d.fotoUrl});
               localStorage.setItem('fotoUrl', d.fotoUrl);
               alert("Foto actualizada");
             }
        }} />
      </div>
    </div>
  );
};

export default ModalPerfil;