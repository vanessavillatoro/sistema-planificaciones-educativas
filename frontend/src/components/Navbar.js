import React, { useState, useEffect } from 'react'; 
import { Link } from 'react-router-dom';
import NavDropdown from './NavDropdown'; 
import ThemeToggle from './ThemeToggle';
import ModalPerfil from './ModalPerfil'; 
import ModalConfiguraciones from './ModalConfiguraciones'; 
import './Navbar.css';

import fotoPerfil from './perfil.png';

const Navbar = ({ darkMode, setDarkMode }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [modalAbierta, setModalAbierta] = useState(false);
  const [modalConfigAbierta, setModalConfigAbierta] = useState(false); 
  
  const [usuario, setUsuario] = useState({
    nombre: 'Jorge',
    correo: 'yourname@gmail.com',
    celular: '',
    municipio: '',
    departamento: '',
    direccion: '',
    fotoUrl: ''
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/usuario/perfil');
        if (response.ok) {
          const data = await response.json();
          setUsuario({
            nombre: data.name || 'Jorge',
            correo: data.email || 'yourname@gmail.com',
            celular: data.celular || '',
            municipio: data.municipio || '',
            departamento: data.departamento || '',
            direccion: data.direccion || '',
            fotoUrl: data.fotoUrl || ''
          });
        }
      } catch (error) {
        console.log("No se pudo cargar el perfil del servidor.");
      }
    };
    cargarDatos();
  }, []);

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const handleSave = async (datosNuevos) => {
    try {
      const datosParaEnviar = {
        name: datosNuevos.nombre,
        email: datosNuevos.correo,
        celular: datosNuevos.celular,
        municipio: datosNuevos.municipio,
        departamento: datosNuevos.departamento,
        direccion: datosNuevos.direccion
      };

      const response = await fetch('http://localhost:5000/api/usuario/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosParaEnviar)
      });

      if (response.ok) {
        const dataActualizada = await response.json(); 
        setUsuario({
          ...datosNuevos,
          fotoUrl: dataActualizada.fotoUrl || usuario.fotoUrl
        });
        alert("¡Perfil actualizado con éxito!");
      }
    } catch (error) {
      console.error("Error al conectar:", error);
    }
  };

  return (
    <nav className={`navbar ${darkMode ? 'dark' : 'light'}`}>
      <Link to="/" className="brand-container">
        <img src="/logo.svg" alt="Logo" className="logo-img" />
        <div className="brand-text">
          <span className="brand-top">Villatoro's</span>
          <span className="brand-bottom">Solutions</span>
        </div>
      </Link>

      <div className="nav-menu">
        <NavDropdown />
        {/* RUTA ACTUALIZADA PARA COINCIDIR CON APP.JS */}
        <Link to="/acerca-de-nosotros">Acerca de nosotros</Link>
        <Link to="/blog">Blog</Link>
        <Link to="/como-funciona">¿Cómo funciona?</Link>
      </div>

      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        
        <div className="perfil-container" style={{ position: 'relative' }}>
          <div className="perfil-trigger" onClick={toggleMenu} style={{ cursor: 'pointer' }}>
            <img src={usuario.fotoUrl || fotoPerfil} alt="Perfil" className="avatar-img" />
          </div>

          {menuAbierto && (
            <div className="perfil-dropdown">
              <div className="perfil-header">
                <img src={usuario.fotoUrl || fotoPerfil} alt={usuario.nombre} />
                <div>
                  <h4>{usuario.nombre}</h4>
                  <p>{usuario.correo}</p>
                </div>
                <button className="close-btn" onClick={() => setMenuAbierto(false)}>×</button>
              </div>
              
              <hr />

              <ul className="perfil-menu-list">
                <li onClick={() => { setModalAbierta(true); setMenuAbierto(false); }}>
                  <i className="icon-user"></i> Mi perfil
                </li>
                <li onClick={() => { setModalConfigAbierta(true); setMenuAbierto(false); }}>
                  <i className="icon-settings"></i> Configuraciones
                </li>
                <li className="logout"><i className="icon-logout"></i> Cerrar sesión</li>
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