import React, { useState, useRef, useEffect } from 'react';
import './ModalPerfil.css';
import fotoPerfilDefault from './perfil.png'; 

const ModalPerfil = ({ onClose, onSave, darkMode }) => {
  
  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://sistema-planificaciones-educativas.vercel.app';

  // --- CAMBIO CLAVE: Los nombres aquí deben ser los del name de los inputs ---
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
  const inputRefs = useRef({});

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
          nombre: perfil.userName, // El server espera 'nombre' o 'name'
          email: perfil.userEmail,
          celular: perfil.userCelular,
          municipio: perfil.userMunicipio,
          departamento: perfil.userDepartamento,
          direccion: perfil.userDireccion
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardamos con los nombres que ya vimos en tu F12
        localStorage.setItem('userName', perfil.userName);
        localStorage.setItem('userEmail', perfil.userEmail);
        localStorage.setItem('userCelular', perfil.userCelular);
        localStorage.setItem('userMunicipio', perfil.userMunicipio);
        localStorage.setItem('userDepartamento', perfil.userDepartamento);
        localStorage.setItem('userDireccion', perfil.userDireccion);
        
        alert("¡Datos guardados con éxito!");
        if (onSave) onSave(data);
        onClose();
      }
    } catch (error) {
      alert("Error al guardar");
    } finally {
      setCargando(false);
    }
  };

  // --- IMPORTANTE: El 'name' debe coincidir con las llaves del objeto perfil ---
  const campos = [
    { label: 'Nombre', name: 'userName' },
    { label: 'Correo', name: 'userEmail' },
    { label: 'Celular', name: 'userCelular' },
    { label: 'Municipio', name: 'userMunicipio' },
    { label: 'Departamento', name: 'userDepartamento' },
    { label: 'Direccion', name: 'userDireccion' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${darkMode ? 'dark' : 'light'}`} onClick={(e) => e.stopPropagation()}>
        <button className="close-x" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <img 
            src={perfil.userFoto ? (perfil.userFoto.startsWith('http') ? perfil.userFoto : `${API_BASE_URL}${perfil.userFoto}`) : fotoPerfilDefault} 
            alt="Perfil" 
            className="modal-avatar" 
          />
          <div className="header-text">
            <h3>{perfil.userName || 'Usuario'}</h3>
          </div>
        </div>

        <div className="modal-perfil-body">
          {campos.map((item) => (
            <div className="input-group" key={item.name}>
              <div className="label-section">
                <button 
                  className="btn-edit-small" 
                  onClick={() => {
                    setEditando(item.name);
                    setTimeout(() => inputRefs.current[item.name]?.focus(), 100);
                  }}
                >✎</button>
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

        <button className="save-btn" onClick={handleGuardarDatos} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
};

export default ModalPerfil;