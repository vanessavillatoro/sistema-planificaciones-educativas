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
    nombre: 'Invitado',
    correo: '',
    fotoUrl: ''
  });

  // --- LÍNEA AGREGADA: Para que el Navbar reaccione al usuario actual ---
  const userId = localStorage.getItem('userId');

  const API_BASE_URL = "https://sistema-planificaciones-educativas.vercel.app";

  const obtenerUrlImagen = (url) => {

  if (!url) return fotoPerfil;

  const base = url.startsWith('http') 

    ? url 

    : `https://sistema-planificaciones-educativas-ten.vercel.app${url.startsWith('/') ? '' : '/'}${url}`;

  

  // El "t=" al final genera un código único basado en la hora para que el celular

  // se de cuenta de que la foto cambió y no use la vieja.

  return `${base}${base.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;

};

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const cargarDatos = useCallback(async () => {
    try {
      // Usamos el userId que detectamos arriba
      if (!userId) {
        setUsuario({ nombre: 'Invitado', correo: '', fotoUrl: '' });
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/usuario/perfil?userId=${userId}&t=${new Date().getTime()}`);
      if (response.ok) {
        const data = await response.json();
        setUsuario({
          nombre: data.name || 'Docente',
          correo: data.email || '',
          fotoUrl: data.fotoUrl || '',
          celular: data.celular || '',
          municipio: data.municipio || '',
          departamento: data.departamento || '',
          direccion: data.direccion || ''
        });

        if (setNombreApp) setNombreApp(data.name || 'Docente');
      }
    } catch (error) {
      console.log("Error de conexión perfil.");
    }
  }, [setNombreApp, API_BASE_URL, userId]); // Agregamos userId a las dependencias

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleSave = async (datosNuevos) => {
    try {
      if (!userId) {
        alert("Sesión expirada. Por favor, inicia sesión de nuevo.");
        return;
      }

      let cuerpoPeticion;
      let encabezados = {};

      if (datosNuevos instanceof FormData) {
        cuerpoPeticion = datosNuevos;
        cuerpoPeticion.set('userId', userId);
      } else {
        cuerpoPeticion = JSON.stringify({ 
          ...datosNuevos,
          userId: userId, 
          name: datosNuevos.nombre, 
          email: datosNuevos.correo,
          celular: datosNuevos.celular,
          municipio: datosNuevos.municipio,
          departamento: datosNuevos.departamento,
          direccion: datosNuevos.direccion
        });
        encabezados['Content-Type'] = 'application/json';
      }

      const response = await fetch(`${API_BASE_URL}/api/usuario/perfil`, {
        method: 'PATCH',
        headers: encabezados,
        body: cuerpoPeticion
      });

      if (response.ok) {
        await cargarDatos(); 
        alert("¡Todos los datos se han actualizado!");
        setModalAbierta(false);
      } else {
        alert("Error al guardar los datos.");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUsuario({ nombre: 'Invitado', correo: '', fotoUrl: '' });
    window.location.href = '/login';
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
              key={usuario.fotoUrl} 
              onError={(e) => { e.target.src = fotoPerfil; }} 
            />
          </div>

          {menuAbierto && (
            <div className="perfil-dropdown">
              <div className="perfil-header">
                <img src={obtenerUrlImagen(usuario.fotoUrl)} alt="User" />
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
                  <li onClick={() => window.location.href = '/login'}>
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