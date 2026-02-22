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
    correo: '',
    fotoUrl: localStorage.getItem('userFoto') || '',
    celular: '',
    municipio: '',
    departamento: '',
    direccion: ''
  });

  const userId = localStorage.getItem('userId');

  const API_BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://sistema-planificaciones-educativas-ten.vercel.app";

  // --- FUNCIÓN ACTUALIZADA ---
  const obtenerUrlImagen = (url) => {
    if (!url) return fotoPerfil;
    // Si es blob (preview) o externa (google), se usa directo
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    
    // Si es del servidor, aseguramos la ruta y añadimos timestamp para refrescar
    const rutaBase = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE_URL}${rutaBase}?v=${Date.now()}`;
  };

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const cargarDatos = useCallback(async () => {
    try {
      if (!userId) {
        setUsuario({ nombre: 'Invitado', correo: '', fotoUrl: '', celular: '', municipio: '', departamento: '', direccion: '' });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/usuario/perfil?userId=${userId}&t=${new Date().getTime()}`);
      if (response.ok) {
        const data = await response.json();
        const nombrePersistente = data.name || data.nombre || 'Docente';
        const fotoPersistente = data.fotoUrl || data.userFoto || '';
        
        setUsuario({
          nombre: nombrePersistente,
          correo: data.email || data.correo || '',
          fotoUrl: fotoPersistente,
          celular: data.celular || '',
          municipio: data.municipio || '',
          departamento: data.departamento || '',
          direccion: data.direccion || ''
        });

        localStorage.setItem('userName', nombrePersistente);
        localStorage.setItem('userFoto', fotoPersistente);
        if (setNombreApp) setNombreApp(nombrePersistente);
      }
    } catch (error) {
      console.log("Error de conexión perfil.");
    }
  }, [setNombreApp, API_BASE_URL, userId]);

  useEffect(() => {
    cargarDatos();

    const manejarCambioPerfil = () => {
      const nuevoNombre = localStorage.getItem('userName');
      const nuevaFoto = localStorage.getItem('userFoto');
      
      setUsuario(prev => ({
        ...prev,
        nombre: nuevoNombre || prev.nombre,
        fotoUrl: nuevaFoto || prev.fotoUrl
      }));

      if (setNombreApp && nuevoNombre) setNombreApp(nuevoNombre);
    };

    window.addEventListener('perfilActualizado', manejarCambioPerfil);
    window.addEventListener('storage', manejarCambioPerfil);

    return () => {
      window.removeEventListener('perfilActualizado', manejarCambioPerfil);
      window.removeEventListener('storage', manejarCambioPerfil);
    };
  }, [cargarDatos, setNombreApp]);

  const handleSave = async (datosNuevos) => {
    await cargarDatos();
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
      <Link to="/" className="brand-container">
        <img src={logoApp} alt="Logo Villatoro" className="logo-img" />
        <div className="brand-text">
          <span className="brand-top">Villatoro's</span>
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
              // La key dinámica fuerza a React a redibujar la imagen si la URL cambia
              key={`trigger-${usuario.fotoUrl}`} 
              onError={(e) => { e.target.src = fotoPerfil; }} 
            />
          </div>

          {menuAbierto && (
            <div className="perfil-dropdown">
              <div className="perfil-header">
                <img 
                  src={obtenerUrlImagen(usuario.fotoUrl)} 
                  alt="User" 
                  key={`header-${usuario.fotoUrl}`}
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