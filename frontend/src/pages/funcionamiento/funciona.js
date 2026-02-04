import React from 'react';
import './funciona.css';
import { FaFileAlt, FaToolbox, FaFolderOpen } from 'react-icons/fa';

const Funciona = ({ darkMode }) => {
  const modulos = [
    {
      id: 1,
      titulo: "Generador de Planificaciones",
      descripcion: "Diseñado para crear planes de clase en segundos. Permite seleccionar grados y materias oficiales, vinculando automáticamente los indicadores de logro del MINED a tus actividades pedagógicas.",
      icono: <FaFileAlt />,
      color: "#003366"
    },
    {
      id: 2,
      titulo: "Generador de Recursos",
      descripcion: "Facilita la creación de material didáctico complementario. Genera guías, exámenes y ejercicios prácticos basados en los temas de tu planificación para enriquecer el aprendizaje en el aula.",
      icono: <FaToolbox />,
      color: "#4a90e2"
    },
    {
      id: 3,
      titulo: "Gestor de Recursos y Planificaciones",
      descripcion: "Tu centro de control administrativo. Aquí puedes organizar, editar y descargar en PDF todo el material generado anteriormente, manteniendo un historial ordenado por año lectivo.",
      icono: <FaFolderOpen />,
      color: "#27ae60"
    }
  ];

  return (
    <section className={`funciona-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="funciona-header">
        <h1>¿Cómo funciona nuestra plataforma?</h1>
        <p>Potencia tu labor docente con tres herramientas integradas para una gestión escolar eficiente.</p>
      </header>

      <div className="modulos-grid">
        {modulos.map((modulo) => (
          <div key={modulo.id} className="modulo-card">
            <div className="modulo-badge">Módulo {modulo.id}</div>
            <div className="modulo-icon" style={{ color: modulo.color }}>
              {modulo.icono}
            </div>
            <h3>{modulo.titulo}</h3>
            <p>{modulo.descripcion}</p>
          </div>
        ))}
      </div>

      <footer className="funciona-disclaimer">
        <p>Optimizado para el sistema educativo de El Salvador.</p>
      </footer>
    </section>
  );
};

export default Funciona;