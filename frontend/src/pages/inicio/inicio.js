import React from 'react';
import { useNavigate } from 'react-router-dom';
import './inicio.css';

// Asegúrate de que la imagen esté en src/assets/ o usa una URL directa
const imagenDocentes = "https://img.freepik.com/foto-gratis/profesores-trabajando-juntos-escuela_23-2148668105.jpg";

// Recibimos "nombre" como prop para que sea dinámico
const Inicio = ({ darkMode, nombre }) => {
  const navigate = useNavigate();

  return (
    <div className={`inicio-wrapper ${darkMode ? 'dark' : 'light'}`}>
      <div className="inicio-container">
        {/* Lado Izquierdo: Bienvenida y Botones */}
        <div className="inicio-content">
          <h1 className="inicio-title">
            {/* Ahora muestra el nombre del perfil en lugar de "Jorge" fijo */}
            Bienvenido Docente <span className="nombre-resaltado">{nombre}</span>
          </h1>
          <p className="inicio-subtitle">¿Como podemos ayudarte hoy?</p>
          
          <div className="botones-inicio-group">
            <button className="btn-inicio-outline" onClick={() => navigate('/planificaciones')}>
              Generar una planificacion
            </button>
            <button className="btn-inicio-outline" onClick={() => navigate('/recursos')}>
              Generar un recurso
            </button>
            <button className="btn-inicio-solid" onClick={() => navigate('/gestion')}>
              Gestionar planificacion y recursos
            </button>
          </div>
        </div>

        {/* Lado Derecho: Imagen */}
        <div className="inicio-visual">
          <img src={imagenDocentes} alt="Docentes trabajando" className="img-inicio-hero" />
        </div>
      </div>
    </div>
  );
};

export default Inicio;