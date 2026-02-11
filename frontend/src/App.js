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

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const [nombreUsuario, setNombreUsuario] = useState(localStorage.getItem('userName') || 'Jorge');

  useEffect(() => {
    const lightBg = "#f1efef";
    const darkBg = "#2d3748";
    document.body.style.backgroundColor = darkMode ? darkBg : lightBg;
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Función auxiliar para verificar si hay sesión (Opcional, para limpiar el código)
  const isAuth = !!localStorage.getItem('userId');

  return (
    <div className={darkMode ? 'app dark' : 'app light'}>
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        setNombreApp={setNombreUsuario} 
      />
      
      <Routes>
        <Route path="/auth" element={<Auth />} />

        <Route 
          path="/" 
          element={isAuth ? <Inicio darkMode={darkMode} nombre={nombreUsuario} /> : <Navigate to="/auth" />} 
        />

        {/* --- RUTAS PROTEGIDAS: Ahora verifican el userId antes de cargar --- */}
        <Route 
          path="/planificaciones" 
          element={isAuth ? <Planificaciones darkMode={darkMode} /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/recursos" 
          element={isAuth ? <Recursos darkMode={darkMode} /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/gestion" 
          element={isAuth ? <Gestion darkMode={darkMode} /> : <Navigate to="/auth" />} 
        />

        {/* --- RUTAS PÚBLICAS: Siempre visibles --- */}
        <Route path="/acerca-de-nosotros" element={<AcercaDeNosotros darkMode={darkMode} />} />
        <Route path="/blog" element={<Blog darkMode={darkMode} />} />
        <Route path="/funciona" element={<Funciona darkMode={darkMode} />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <PapeleraFlotante />
    </div>
  );
}

export default App;