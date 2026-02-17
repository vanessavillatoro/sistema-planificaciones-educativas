import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import './App.css';
import Navbar from './components/Navbar';
import Planificaciones from './pages/planificaciones/Planificaciones'; 
import Recursos from './pages/recursos/Recursos'; 
import Gestion from './pages/gestion/Gestion'; 
import AcercaDeNosotros from './pages/acerca de nosotros/acerca'; 
import Blog from './pages/blog/blog'; 
import Funciona from './pages/funcionamiento/funciona'; 
import Inicio from './pages/inicio/inicio';
import PapeleraFlotante from './components/PapeleraFlotante';

import Auth from './pages/sesion/auth'; 

// URL de producción para que el celular conecte con el servidor real
const API_BASE_URL = "https://sistema-planificaciones-educativas-ten.vercel.app";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [nombreUsuario, setNombreUsuario] = useState(localStorage.getItem('userName') || 'Docente');

  useEffect(() => {
    // Configuración de colores de fondo según tus instrucciones guardadas
    const lightBg = "#f1efef";
    const darkBg = "#2d3748"; 
    document.body.style.backgroundColor = darkMode ? darkBg : lightBg;
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Verificación de sesión: si existe el ID, el usuario está logueado
  const isAuth = !!localStorage.getItem('userId');

  return (
    <div className={darkMode ? 'app dark' : 'app light'}>
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        setNombreApp={setNombreUsuario} 
      />
      
      <Routes>
        {/* Si ya está logueado y trata de ir a auth, lo mandamos al inicio */}
        <Route 
          path="/auth" 
          element={isAuth ? <Navigate to="/" /> : <Auth API_BASE_URL={API_BASE_URL} />} 
        />

        {/* Ruta principal: Inicio si hay sesión, sino a Auth */}
        <Route 
          path="/" 
          element={isAuth ? <Inicio darkMode={darkMode} nombre={nombreUsuario} /> : <Navigate to="/auth" />} 
        />

        {/* --- RUTAS PROTEGIDAS --- */}
        <Route 
          path="/planificaciones" 
          element={isAuth ? <Planificaciones darkMode={darkMode} API_BASE_URL={API_BASE_URL} /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/recursos" 
          element={isAuth ? <Recursos darkMode={darkMode} API_BASE_URL={API_BASE_URL} /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/gestion" 
          element={isAuth ? <Gestion darkMode={darkMode} API_BASE_URL={API_BASE_URL} /> : <Navigate to="/auth" />} 
        />

        {/* --- RUTAS PÚBLICAS --- */}
        <Route path="/acerca-de-nosotros" element={<AcercaDeNosotros darkMode={darkMode} />} />
        <Route path="/blog" element={<Blog darkMode={darkMode} />} />
        <Route path="/funciona" element={<Funciona darkMode={darkMode} />} />
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to={isAuth ? "/" : "/auth"} />} />
      </Routes>

      <PapeleraFlotante API_BASE_URL={API_BASE_URL} />
    </div>
  );
}

export default App;