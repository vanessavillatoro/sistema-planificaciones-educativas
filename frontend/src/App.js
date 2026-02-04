import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Importamos componentes de navegación
import './App.css';
import Navbar from './components/Navbar';
// Corregido: carpeta en minúscula, archivo en mayúscula
import Planificaciones from './pages/planificaciones/Planificaciones'; 
import Recursos from './pages/recursos/Recursos'; // Importamos el nuevo módulo 2
import Gestion from './pages/gestion/Gestion'; // NUEVO: Importamos el módulo de gestión

// --- IMPORTACIÓN DE ACERCA DE NOSOTROS ---
import AcercaDeNosotros from './pages/acerca de nosotros/acerca'; 

// --- NUEVA IMPORTACIÓN: BLOG (Corregida en minúsculas para evitar errores) ---
import Blog from './pages/blog/blog'; 

// --- NUEVA IMPORTACIÓN: FUNCIONA ---
import Funciona from './pages/funcionamiento/funciona'; 

// --- NUEVA IMPORTACIÓN: INICIO (Pantalla de Bienvenida) ---
import Inicio from './pages/inicio/inicio';

// --- IMPORTACIÓN DE LA PAPELERA ---
import PapeleraFlotante from './components/PapeleraFlotante';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // NUEVO: Estado para el nombre del usuario dinámico
  const [nombreUsuario, setNombreUsuario] = useState('Jorge');

  useEffect(() => {
    const lightBg = "#f1efef";
    const darkBg = "#2d3748";
    document.body.style.backgroundColor = darkMode ? darkBg : lightBg;
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className={darkMode ? 'app dark' : 'app light'}>
      {/* Pasamos setNombreApp al Navbar para sincronizar el nombre desde la API */}
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        setNombreApp={setNombreUsuario} 
      />
      
      <Routes>
        {/* NUEVA RUTA PRINCIPAL: Pasamos el nombre dinámico al Inicio */}
        <Route path="/" element={<Inicio darkMode={darkMode} nombre={nombreUsuario} />} />

        {/* Ruta para el Módulo 1 */}
        <Route path="/planificaciones" element={<Planificaciones darkMode={darkMode} />} />
        
        {/* Ruta para el Módulo 2 */}
        <Route path="/recursos" element={<Recursos darkMode={darkMode} />} />

        {/* NUEVA RUTA: Ruta para el Módulo 3 (Gestión) */}
        <Route path="/gestion" element={<Gestion darkMode={darkMode} />} />

        {/* NUEVA RUTA: Acerca de nosotros */}
        <Route path="/acerca-de-nosotros" element={<AcercaDeNosotros darkMode={darkMode} />} />

        {/* NUEVA RUTA: Blog de Novedades */}
        <Route path="/blog" element={<Blog darkMode={darkMode} />} />

        {/* NUEVA RUTA: ¿Cómo funciona? */}
        <Route path="/funciona" element={<Funciona darkMode={darkMode} />} />
        
        {/* Redirección de seguridad: Si la ruta no existe, vuelve al Inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* --- COMPONENTE GLOBAL DE PAPELERA --- */}
      <PapeleraFlotante />
    </div>
  );
}

export default App;