import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Importamos componentes de navegación
import './App.css';
import Navbar from './components/Navbar';
// Corregido: carpeta en minúscula, archivo en mayúscula
import Planificaciones from './pages/planificaciones/Planificaciones'; 
import Recursos from './pages/recursos/Recursos'; // Importamos el nuevo módulo 2
import Gestion from './pages/gestion/Gestion'; // NUEVO: Importamos el módulo de gestión

// --- IMPORTACIÓN DE LA PAPELERA ---
import PapeleraFlotante from './components/PapeleraFlotante';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  useEffect(() => {
    const lightBg = "#f1efef";
    const darkBg = "#2d3748";
    document.body.style.backgroundColor = darkMode ? darkBg : lightBg;
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className={darkMode ? 'app dark' : 'app light'}>
      {/* El Navbar se mantiene fuera de Routes para que siempre sea visible */}
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      
      {/* Usamos Routes para decidir qué componente mostrar según la URL */}
      <Routes>
        {/* Ruta para el Módulo 1 */}
        <Route path="/planificaciones" element={<Planificaciones darkMode={darkMode} />} />
        
        {/* Ruta para el Módulo 2 */}
        <Route path="/recursos" element={<Recursos darkMode={darkMode} />} />

        {/* NUEVA RUTA: Ruta para el Módulo 3 (Gestión) */}
        <Route path="/gestion" element={<Gestion darkMode={darkMode} />} />
        
        {/* Redirección por defecto: Si entras a la raíz, te lleva a planificaciones */}
        <Route path="/" element={<Navigate to="/planificaciones" />} />
      </Routes>

      {/* --- COMPONENTE GLOBAL DE PAPELERA --- */}
      <PapeleraFlotante />
    </div>
  );
}

export default App;