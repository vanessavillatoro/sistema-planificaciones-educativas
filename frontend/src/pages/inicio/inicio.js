import React from 'react';
import { useNavigate } from 'react-router-dom';
import './inicio.css';

// Importamos el logo/imagen de Villatoro's Solutions
import imagenVillatoro from './planificar.jpg'; 

const Inicio = ({ darkMode, nombre }) => {
  const navigate = useNavigate();

  return (
    <div className={`inicio-wrapper ${darkMode ? 'dark' : 'light'}`}>
      <div className="inicio-container">
        
        {/* Lado Izquierdo: Bienvenida y Botones (flex: 1 1 500px) */}
        <div className="inicio-content">
          <h1 className="inicio-title">
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

        {/* Lado Derecho: Imagen (Respeta .img-inicio-hero en inicio.css) */}
        <div className="inicio-visual">
          <img 
            src={imagenVillatoro} 
            alt="Villatoro's Solutions" 
            className="img-inicio-hero"
            width="600" 
            height="400" 
            loading="lazy"
          />
        </div>

      </div>
    </div>
  );
};

export default Inicio;