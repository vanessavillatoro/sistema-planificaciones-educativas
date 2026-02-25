import React, { useState, useEffect, useCallback } from 'react'; 
import { Link } from 'react-router-dom';
import NavDropdown from './NavDropdown'; 
import ThemeToggle from './ThemeToggle';
import ModalPerfil from './ModalPerfil'; 
import ModalConfiguraciones from './ModalConfiguraciones'; 
import './Navbar.css';

import logoApp from './logo.png'; 
import fotoPerfil from './perfil.png';

const Navbar = ({ darkMode, setDarkMode, setNombreApp }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalAbierta, setModalAbierta] = useState(false);
  const [modalConfigAbierta, setModalConfigAbierta] = useState(false); 
  
  const [usuario, setUsuario] = useState({
    nombre: localStorage.getItem('userName') || 'Invitado',
    correo: localStorage.getItem('userEmail') || '',
    fotoUrl: localStorage.getItem('userFoto') || '',
    celular: localStorage.getItem('userCelular') || '',
    municipio: localStorage.getItem('userMunicipio') || '',
    departamento: localStorage.getItem('userDepartamento') || '',
    direccion: localStorage.getItem('userDireccion') || ''
  });

  const userId = localStorage.getItem('userId');

  const API_BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://sistema-planificaciones-educativas.vercel.app";

  const obtenerUrlImagen = (url) => {
    if (!url) return fotoPerfil;
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http')) {
      return url;
    }
    const rutaBase = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE_URL}${rutaBase}?v=${Date.now()}`;
  };

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const cargarDatos = useCallback(async () => {
    try {
      // AJUSTE: Solo procedemos si el userId es válido para evitar error "<"
      if (!userId || userId === "null" || userId === "undefined" || userId === "Invitado") {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/usuario/perfil?userId=${userId}&t=${Date.now()}`);
      
      // Verificamos que sea una respuesta JSON válida
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        
        const nombrePersistente = data.userName || data.nombre || data.name || 'Docente';
        const fotoPersistente = data.userFoto || data.fotoUrl || '';
        const correoPersistente = data.userEmail || data.email || data.correo || '';
        
        setUsuario({
          nombre: nombrePersistente,
          correo: correoPersistente,
          fotoUrl: fotoPersistente,
          celular: data.userCelular || data.celular || '',
          municipio: data.userMunicipio || data.municipio || '',
          departamento: data.userDepartamento || data.departamento || '',
          direccion: data.userDireccion || data.direccion || ''
        });

        localStorage.setItem('userName', nombrePersistente);
        localStorage.setItem('userFoto', fotoPersistente);
        localStorage.setItem('userEmail', correoPersistente);
        localStorage.setItem('userCelular', data.userCelular || data.celular || '');
        localStorage.setItem('userMunicipio', data.userMunicipio || data.municipio || '');
        localStorage.setItem('userDepartamento', data.userDepartamento || data.departamento || '');
        localStorage.setItem('userDireccion', data.userDireccion || data.direccion || '');

        if (setNombreApp) setNombreApp(nombrePersistente);
      }
    } catch (error) {
      console.log("Sesión no disponible.");
    }
  }, [setNombreApp, API_BASE_URL, userId]);

  useEffect(() => {
    // AJUSTE: Candado para no disparar la carga si no hay sesión activa
    if (userId && userId !== "null" && userId !== "undefined" && userId !== "Invitado") {
      cargarDatos();
    }

    const manejarCambioPerfil = () => {
      setUsuario({
        nombre: localStorage.getItem('userName') || 'Docente',
        correo: localStorage.getItem('userEmail') || '',
        fotoUrl: localStorage.getItem('userFoto') || '',
        celular: localStorage.getItem('userCelular') || '',
        municipio: localStorage.getItem('userMunicipio') || '',
        departamento: localStorage.getItem('userDepartamento') || '',
        direccion: localStorage.getItem('userDireccion') || ''
      });

      const nuevoNombre = localStorage.getItem('userName');
      if (setNombreApp && nuevoNombre) setNombreApp(nuevoNombre);
    };

    window.addEventListener('perfilActualizado', manejarCambioPerfil);
    window.addEventListener('storage', manejarCambioPerfil);

    return () => {
      window.removeEventListener('perfilActualizado', manejarCambioPerfil);
      window.removeEventListener('storage', manejarCambioPerfil);
    };
  }, [cargarDatos, setNombreApp, userId]); // Agregado userId a dependencias

  const handleSave = () => {
    window.dispatchEvent(new Event('perfilActualizado'));
    setModalAbierta(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUsuario({ nombre: 'Invitado', correo: '', fotoUrl: '', celular: '', municipio: '', departamento: '', direccion: '' });
    
    // AJUSTE: Redirección completa para limpiar políticas de seguridad (Google COOP)
    window.location.href = '/auth';
  };

  return (
    <nav className={`navbar ${darkMode ? 'dark' : 'light'}`}>
      <Link to="/" className="brand-container">
        <img src={logoApp} alt="Logo Villatoro" className="logo-img" />
        <div className="brand-text">
          <span className="brand-top">Villatoros</span>
          <span className="brand-bottom">Solutions</span>
        </div>
      </Link>

      <div className="nav-menu">
        <NavDropdown />
        <Link to="/acerca-de-nosotros">Acerca de nosotros</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/funciona">¿Cómo funciona?</Link>
      </div>

      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        
        <div className="perfil-container" style={{ position: 'relative' }}>
          <div className="perfil-trigger" onClick={toggleMenu} style={{ cursor: 'pointer' }}>
            <img 
              src={obtenerUrlImagen(usuario.fotoUrl)} 
              alt="Perfil" 
              className="avatar-img" 
              key={`nav-trigger-${usuario.fotoUrl}`}
              onError={(e) => { e.target.src = fotoPerfil; }} 
            />
          </div>

          {menuAbierto && (
            <div className="perfil-dropdown">
              <div className="perfil-header">
                <img 
                  src={obtenerUrlImagen(usuario.fotoUrl)} 
                  alt="User" 
                  key={`nav-header-${usuario.fotoUrl}`}
                  onError={(e) => { e.target.src = fotoPerfil; }} 
                />
                <div className="perfil-user-info">
                  <h4>{usuario.nombre}</h4>
                  <p className="user-email">{usuario.correo || 'Inicia sesión para ver datos'}</p>
                </div>
                <button className="close-btn" onClick={() => setMenuAbierto(false)}>×</button>
              </div>
              
              <hr />

              <ul className="perfil-menu-list">
                {userId && userId !== "Invitado" ? (
                  <>
                    <li onClick={() => { setModalAbierta(true); setMenuAbierto(false); }}>
                      <i className="icon-user"></i> Mi perfil
                    </li>
                    <li onClick={() => { setModalConfigAbierta(true); setMenuAbierto(false); }}>
                      <i className="icon-settings"></i> Configuraciones
                    </li>
                    <li className="logout" onClick={handleLogout}>
                      <i className="icon-logout"></i> Cerrar sesión
                    </li>
                  </>
                ) : (
                  <li onClick={() => window.location.href = '/auth'}>
                    <i className="icon-login"></i> Iniciar Sesión
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {modalAbierta && (
        <ModalPerfil 
          onClose={() => setModalAbierta(false)} 
          onSave={handleSave}
          darkMode={darkMode} 
          datosUsuario={usuario} 
        />
      )}
      {modalConfigAbierta && (
        <ModalConfiguraciones 
          onClose={() => setModalConfigAbierta(false)} 
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}
    </nav>
  );
};

export default Navbar;