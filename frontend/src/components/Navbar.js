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
  const [hamburguesaAbierta, setHamburguesaAbierta] = useState(false); 
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

  const toggleHamburguesa = () => {
    setHamburguesaAbierta(!hamburguesaAbierta);
  };

  const cargarDatos = useCallback(async () => {
    try {
      if (!userId) return;

      const url = `${API_BASE_URL}/api/usuario/perfil?userId=${userId}&t=${Date.now()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

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
      
      if (setNombreApp) setNombreApp(nombrePersistente);

    } catch (error) {
      console.error("Detalle del error:", error.message);
    }
  }, [setNombreApp, API_BASE_URL, userId]);

  useEffect(() => {
    cargarDatos();
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
    };

    window.addEventListener('perfilActualizado', manejarCambioPerfil);
    window.addEventListener('storage', manejarCambioPerfil);
    return () => {
      window.removeEventListener('perfilActualizado', manejarCambioPerfil);
      window.removeEventListener('storage', manejarCambioPerfil);
    };
  }, [cargarDatos]);

  const handleSave = () => {
    window.dispatchEvent(new Event('perfilActualizado'));
    setModalAbierta(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUsuario({ nombre: 'Invitado', correo: '', fotoUrl: '', celular: '', municipio: '', departamento: '', direccion: '' });
    window.location.href = '/auth';
  };

  return (
    <nav className={`navbar ${darkMode ? 'dark' : 'light'}`}>
      
      {/* SECCIÓN IZQUIERDA: Siempre visible (Hamburguesa + Logo) */}
      <div className="nav-left-section" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button 
          className={`menu-hamburguesa ${hamburguesaAbierta ? 'active' : ''}`} 
          onClick={toggleHamburguesa}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        <Link to="/" className="brand-container">
          <img src={logoApp} alt="Logo Villatoro" className="logo-img" />
          <div className="brand-text">
            <span className="brand-top">Villatoro's</span>
            <span className="brand-bottom">Solutions</span>
          </div>
        </Link>
      </div>

      {/* MENÚ DE NAVEGACIÓN (Se oculta en móvil tras la hamburguesa) */}
      <div className={`nav-menu ${hamburguesaAbierta ? 'active' : ''}`}>
        <NavDropdown />
        <Link to="/acerca-de-nosotros" onClick={() => setHamburguesaAbierta(false)}>Acerca de nosotros</Link>
        <Link to="/blog" onClick={() => setHamburguesaAbierta(false)}>Blog</Link>
        <Link to="/funciona" onClick={() => setHamburguesaAbierta(false)}>¿Cómo funciona?</Link>
      </div>

      {/* SECCIÓN DERECHA: Siempre visible (ThemeToggle + Perfil) */}
      <div className="navbar-actions">
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
                {userId ? (
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

      {/* MODALES */}
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