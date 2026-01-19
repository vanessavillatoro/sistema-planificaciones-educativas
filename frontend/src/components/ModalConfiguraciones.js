import React from 'react';
import './ModalConfiguraciones.css';

const ModalConfiguraciones = ({ onClose, darkMode, setDarkMode }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal-config-content ${darkMode ? 'dark' : 'light'}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-config-header">
          <h2>Configuracion</h2>
          <button className="close-btn-config" onClick={onClose}>×</button>
        </div>

        <hr className="modal-divider" />

        <div className="modal-config-body">
          {/* Opción de Tema únicamente */}
          <div className="config-item">
            <span>Tema</span>
            <div className="select-wrapper">
              <select 
                value={darkMode ? 'Dark' : 'Light'} 
                onChange={(e) => setDarkMode(e.target.value === 'Dark')}
              >
                <option value="Light">Light</option>
                <option value="Dark">Dark</option>
              </select>
              {/* Icono de flecha SVG para que sea idéntico a tu imagen */}
              <svg className="arrow-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfiguraciones;