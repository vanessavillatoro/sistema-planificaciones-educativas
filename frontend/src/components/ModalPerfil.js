import React, { useState, useRef, useEffect } from 'react';
import './ModalPerfil.css';
import fotoPerfilDefault from './perfil.png'; 

const ModalPerfil = ({ onClose, onSave, darkMode }) => {
  
  // Mantenemos tus URLs exactamente como pediste
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
    userFoto: localStorage.getItem('userFoto') || ''
  });

  const [editando, setEditando] = useState(null);
  const [cargando, setCargando] = useState(false);
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
        userFoto: localStorage.getItem('userFoto') || ''
      });
      setVersion(Date.now());
    };

    window.addEventListener('storage', cargarDatos);
    window.addEventListener('perfilActualizado', cargarDatos);
    
    return () => {
      window.removeEventListener('storage', cargarDatos);
      window.removeEventListener('perfilActualizado', cargarDatos);
    };
  }, []);

  const handleChange = (e) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  // --- SOLUCIÓN PARA VERCEL: CONVERTIR A BASE64 ---
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen es muy pesada. Máximo 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      // Actualizamos la vista previa local inmediatamente
      setPerfil(prev => ({ ...prev, userFoto: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleGuardarDatos = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return alert("Sesión expirada");

    setCargando(true);
    try {
      const datosParaEnviar = {
        userId,
        nombre: perfil.userName,
        celular: perfil.userCelular,
        municipio: perfil.userMunicipio,
        departamento: perfil.userDepartamento,
        direccion: perfil.userDireccion,
        foto: perfil.userFoto // Enviamos el Base64
      };

      const response = await fetch(`${API_BASE_URL}/api/usuario/perfil`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosParaEnviar),
      });

      const data = await response.json();

      if (response.ok) {
        // ACTUALIZACIÓN CRÍTICA: Guardamos lo que el servidor devuelve
        // Si el servidor devuelve la imagen procesada, la usamos; si no, la que ya tenemos en Base64
        const nuevaFoto = data.userFoto || perfil.userFoto;

        localStorage.setItem('userName', data.userName || perfil.userName);
        localStorage.setItem('userFoto', nuevaFoto);
        localStorage.setItem('userCelular', data.userCelular || perfil.userCelular);
        localStorage.setItem('userMunicipio', data.userMunicipio || perfil.userMunicipio);
        localStorage.setItem('userDepartamento', data.userDepartamento || perfil.userDepartamento);
        localStorage.setItem('userDireccion', data.userDireccion || perfil.userDireccion);
        
        // Actualizar el estado del componente para que la foto cambie en el modal
        setPerfil(prev => ({
          ...prev,
          userFoto: nuevaFoto
        }));

        // Avisar al Navbar que refresque
        window.dispatchEvent(new Event('perfilActualizado'));
        
        alert("¡Perfil actualizado con éxito!");
        if (onSave) onSave(data);
        onClose();
      } else {
        alert(`Error: ${data.error || 'No se pudo guardar'}`);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error de conexión con el servidor");
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

  const getFotoUrl = () => {
    const foto = perfil.userFoto;
    if (!foto) return fotoPerfilDefault;
    
    // Si la foto es Base64 (empieza con data:), la usamos directamente.
    // Esto evita el 404 de la carpeta /uploads/
    if (foto.startsWith('data:') || foto.startsWith('blob:') || foto.startsWith('http')) {
      return foto;
    }

    // Solo si es una ruta vieja intentamos concatenar la URL
    const rutaLimpia = foto.startsWith('/') ? foto : `/${foto}`;
    return `${API_BASE_URL}${rutaLimpia}?v=${version}`;
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
              key={perfil.userFoto} 
              onError={(e) => { e.target.src = fotoPerfilDefault; }}
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