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
    fotoUrl: ''
  });

  const userId = localStorage.getItem('userId');
  const API_BASE_URL = window.location.hostname === "localhost" 
    ? "http://localhost:5000" 
    : "https://sistema-planificaciones-educativas-ten.vercel.app";

  const obtenerUrlImagen = (url) => {
    if (!url) return fotoPerfil;
    const base = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    return `${base}${base.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
  };

  const cargarDatos = useCallback(async () => {
    try {
      if (!userId) return;
      const response = await fetch(`${API_BASE_URL}/api/usuario/perfil?userId=${userId}&t=${new Date().getTime()}`);
      if (response.ok) {
        const data = await response.json();
        const nombreFinal = data.name || 'Docente';
        
        setUsuario(prev => ({
          ...prev,
          nombre: nombreFinal,
          correo: data.email || '',
          fotoUrl: data.fotoUrl || '',
          celular: data.celular || '',
          municipio: data.municipio || '',
          departamento: data.departamento || '',
          direccion: data.direccion || ''
        }));

        localStorage.setItem('userName', nombreFinal);
        if (setNombreApp) setNombreApp(nombreFinal);
      }
    } catch (error) {
      console.log("Error de conexión perfil.");
    }
  }, [setNombreApp, API_BASE_URL, userId]);

  useEffect(() => {
    cargarDatos();
    const manejarCambio = (e) => {
      const n = e.detail?.nombre || localStorage.getItem('userName');
      if (n) {
        setUsuario(prev => ({ ...prev, nombre: n }));
        if (setNombreApp) setNombreApp(n);
      }
    };
    window.addEventListener('perfilActualizado', manejarCambio);
    window.addEventListener('storage', manejarCambio);
    return () => {
      window.removeEventListener('perfilActualizado', manejarCambio);
      window.removeEventListener('storage', manejarCambio);
    };
  }, [cargarDatos, setNombreApp]);

  const handleSave = async (datosNuevos) => {
    try {
      if (!userId) return alert("Sesión expirada.");
      let cuerpo;
      let headers = {};

      if (datosNuevos instanceof FormData) {
        cuerpo = datosNuevos;
        cuerpo.set('userId', userId);
      } else {
        cuerpo = JSON.stringify({ 
          ...datosNuevos, 
          userId, 
          name: datosNuevos.nombre, // Mapeo de nombre a name para el server
          email: datosNuevos.correo 
        });
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(`${API_BASE_URL}/api/usuario/perfil`, {
        method: 'PATCH',
        headers,
        body: cuerpo
      });

      if (res.ok) {
        const data = await res.json();
        // Disparar evento para que todos se enteren del cambio
        window.dispatchEvent(new CustomEvent('perfilActualizado', { 
          detail: { nombre: datosNuevos.nombre || data.name } 
        }));
        alert("¡Datos actualizados!");
        setModalAbierta(false);
      }
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/auth';
  };

  return (
    <nav className={`navbar ${darkMode ? 'dark' : 'light'}`}>
      <Link to="/" className="brand-container">
        <img src={logoApp} alt="Logo" className="logo-img" />
        <div className="brand-text">
          <span className="brand-top">Villatoro's</span>
          <span className="brand-bottom">Solutions</span>
        </div>
      </Link>

      <div className="nav-menu">
        <NavDropdown />
        <Link to="/acerca-de-nosotros">Acerca de nosotros</Link>
      </div>

      <div className="navbar-actions">
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        <div className="perfil-container">
          <div className="perfil-trigger" onClick={() => setMenuAbierto(!menuAbierto)}>
            <img src={obtenerUrlImagen(usuario.fotoUrl)} alt="Perfil" className="avatar-img" />
          </div>

          {menuAbierto && (
            <div className="perfil-dropdown">
              <div className="perfil-header">
                <div className="perfil-user-info">
                  <h4>{usuario.nombre}</h4>
                  <p>{usuario.correo}</p>
                </div>
                <button onClick={() => setMenuAbierto(false)}>×</button>
              </div>
              <ul className="perfil-menu-list">
                <li onClick={() => { setModalAbierta(true); setMenuAbierto(false); }}>Mi perfil</li>
                <li onClick={() => { setModalConfigAbierta(true); setMenuAbierto(false); }}>Configuraciones</li>
                <li className="logout" onClick={handleLogout}>Cerrar sesión</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {modalAbierta && <ModalPerfil onClose={() => setModalAbierta(false)} onSave={handleSave} darkMode={darkMode} datosUsuario={usuario} />}
      {modalConfigAbierta && <ModalConfiguraciones onClose={() => setModalConfigAbierta(false)} darkMode={darkMode} setDarkMode={setDarkMode} />}
    </nav>
  );
};

export default Navbar;