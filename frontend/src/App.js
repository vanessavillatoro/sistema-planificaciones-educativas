import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import './App.css';
import Navbar from './components/Navbar';
const Planificaciones = lazy(() => import('./pages/planificaciones/Planificaciones'));
const Recursos = lazy(() => import('./pages/recursos/Recursos'));
const Gestion = lazy(() => import('./pages/gestion/Gestion'));
const AcercaDeNosotros = lazy(() => import('./pages/acerca de nosotros/acerca'));
const Blog = lazy(() => import('./pages/blog/blog'));
const Funciona = lazy(() => import('./pages/funcionamiento/funciona'));
const Inicio = lazy(() => import('./pages/inicio/inicio'));
const Auth = lazy(() => import('./pages/sesion/auth'));
const PapeleraFlotante = lazy(() => import('./components/PapeleraFlotante'));

// URL de producción para que el celular conecte con el servidor real
const API_BASE_URL = "https://sistema-planificaciones-educativas.vercel.app";

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
<Suspense fallback={<div className="loading">Cargando...</div>}>
  <Routes>
    <Route 
      path="/auth" 
      element={isAuth ? <Navigate to="/" /> : <Auth API_BASE_URL={API_BASE_URL} />} 
    />
    <Route 
      path="/" 
      element={isAuth ? <Inicio darkMode={darkMode} nombre={nombreUsuario} /> : <Navigate to="/auth" />} 
    />
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
    <Route path="/acerca-de-nosotros" element={<AcercaDeNosotros darkMode={darkMode} />} />
    <Route path="/blog" element={<Blog darkMode={darkMode} />} />
    <Route path="/funciona" element={<Funciona darkMode={darkMode} />} />
    <Route path="*" element={<Navigate to={isAuth ? "/" : "/auth"} />} />
  </Routes>
</Suspense>

      <PapeleraFlotante API_BASE_URL={API_BASE_URL} />
    </div>
  );
}

export default App;